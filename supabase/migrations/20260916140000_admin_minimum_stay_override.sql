ALTER TABLE public.bookings ADD COLUMN minimum_stay_override boolean NOT NULL DEFAULT false;
ALTER TABLE public.bookings DROP CONSTRAINT bookings_minimum_two_nights;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_minimum_two_nights
  CHECK (status = 'cancelled' OR check_out - check_in >= CASE WHEN minimum_stay_override THEN 1 ELSE 2 END) NOT VALID;

-- Also guard direct writes: a client-supplied flag cannot authorize an exception.
CREATE FUNCTION public.guard_booking_minimum_stay_override()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.minimum_stay_override AND NOT coalesce(public.is_admin(), false) THEN
      RAISE EXCEPTION 'Seul un administrateur peut déroger au minimum de 2 nuits.' USING ERRCODE = '42501';
    END IF;
  ELSIF NEW.minimum_stay_override IS DISTINCT FROM OLD.minimum_stay_override
     OR (NEW.minimum_stay_override AND (NEW.check_in IS DISTINCT FROM OLD.check_in OR NEW.check_out IS DISTINCT FROM OLD.check_out)) THEN
    IF NOT coalesce(public.is_admin(), false) THEN
      RAISE EXCEPTION 'Seul un administrateur peut modifier la dérogation au minimum de 2 nuits.' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_booking_minimum_stay_override() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_booking_minimum_stay_override
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.guard_booking_minimum_stay_override();

CREATE OR REPLACE FUNCTION public.admin_save_booking(p_action text, p_booking_id bigint, p_version integer, p_payload jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  old_booking public.bookings;
  saved public.bookings;
  studio public.studios;
  selected_customer_id bigint;
  arrival date;
  departure date;
  guests bigint;
  price numeric;
  reason text;
  stay_override boolean;
BEGIN
  IF NOT coalesce(public.is_admin(), false) THEN RAISE EXCEPTION 'Accès administrateur requis.' USING ERRCODE = '42501'; END IF;
  IF p_action IS NULL OR p_action NOT IN ('create', 'update', 'cancel') THEN RAISE EXCEPTION 'Action invalide.'; END IF;
  -- Serialize writes, including concurrent calendar changes, before checking availability.
  LOCK TABLE public.bookings, public.availability_blocks IN SHARE ROW EXCLUSIVE MODE;
  IF p_action <> 'create' THEN
    SELECT * INTO old_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Réservation introuvable.'; END IF;
    IF p_version IS DISTINCT FROM old_booking.version THEN RAISE EXCEPTION 'Cette réservation a changé. Rechargez la page avant de continuer.'; END IF;
    IF old_booking.status = 'cancelled' THEN RAISE EXCEPTION 'Une réservation annulée ne peut plus être modifiée.'; END IF;
  END IF;
  IF p_action = 'cancel' THEN
    reason := btrim(p_payload->>'reason');
    IF reason IS NULL OR length(reason) < 3 OR length(reason) > 1000 THEN RAISE EXCEPTION 'Indiquez un motif de 3 à 1 000 caractères.'; END IF;
    UPDATE public.bookings SET status = 'cancelled', version = version + 1 WHERE id = p_booking_id RETURNING * INTO saved;
    DELETE FROM public.availability_blocks WHERE booking_id = p_booking_id;
  ELSE
    SELECT * INTO studio FROM public.studios WHERE id = (p_payload->>'studio_id')::bigint FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Studio introuvable.'; END IF;
    stay_override := coalesce(p_payload->'minimum_stay_override' = 'true'::jsonb, false);
    arrival := (p_payload->>'check_in')::date;
    departure := (p_payload->>'check_out')::date;
    guests := (p_payload->>'guests_count')::bigint;
    -- The stored total is authoritative: never trust a client-supplied amount.
    price := round(studio.base_price * (departure - arrival), 2);
    IF arrival IS NULL OR departure IS NULL OR departure <= arrival THEN RAISE EXCEPTION 'La date de départ doit suivre la date d’arrivée.'; END IF;
    IF departure - arrival < 2 AND NOT stay_override THEN RAISE EXCEPTION 'Le séjour doit comprendre au moins 2 nuits.'; END IF;
    IF guests IS NULL OR guests < 1 OR guests > studio.capacity THEN RAISE EXCEPTION 'Le nombre de voyageurs dépasse la capacité du studio.'; END IF;
    IF price IS NULL OR price < 0 OR price::text IN ('NaN', 'Infinity', '-Infinity') OR price <> round(price, 2) THEN RAISE EXCEPTION 'Montant invalide.'; END IF;
    IF coalesce(p_payload->>'status', '') NOT IN ('pending', 'confirmed') OR coalesce(p_payload->>'source', '') NOT IN ('direct', 'airbnb', 'booking') THEN RAISE EXCEPTION 'Statut ou canal invalide.'; END IF;
    IF EXISTS (SELECT 1 FROM public.bookings b WHERE b.studio_id = studio.id AND b.status <> 'cancelled' AND (p_action = 'create' OR b.id <> p_booking_id) AND b.check_in < departure AND b.check_out > arrival)
      OR EXISTS (SELECT 1 FROM public.availability_blocks a WHERE a.studio_id = studio.id AND (p_action = 'create' OR a.booking_id IS DISTINCT FROM p_booking_id) AND a.start_date < departure AND a.end_date > arrival)
    THEN RAISE EXCEPTION 'Ce studio est déjà réservé ou indisponible sur ces dates.' USING ERRCODE = '23P01'; END IF;
    IF p_payload->>'customer_id' IS NOT NULL THEN
      SELECT id INTO selected_customer_id FROM public.customers WHERE id = (p_payload->>'customer_id')::bigint;
      IF NOT FOUND THEN RAISE EXCEPTION 'Client introuvable.'; END IF;
    ELSE
      IF coalesce(btrim(p_payload->>'first_name'), '') = '' OR coalesce(btrim(p_payload->>'last_name'), '') = ''
        OR coalesce(p_payload->>'email', '') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
        OR coalesce(btrim(p_payload->>'phone_country_code'), '') = '' OR coalesce(btrim(p_payload->>'phone_number'), '') = ''
      THEN RAISE EXCEPTION 'Complétez les coordonnées du client.'; END IF;
      INSERT INTO public.customers (first_name, last_name, email, phone_country_code, phone_number)
      VALUES (btrim(p_payload->>'first_name'), btrim(p_payload->>'last_name'), lower(btrim(p_payload->>'email')), btrim(p_payload->>'phone_country_code'), btrim(p_payload->>'phone_number')) RETURNING id INTO selected_customer_id;
    END IF;
    IF p_action = 'create' THEN
      INSERT INTO public.bookings (studio_id, customer_id, source, status, check_in, check_out, guests_count, total_price, minimum_stay_override)
      VALUES (studio.id, selected_customer_id, (p_payload->>'source')::public.booking_source_type, (p_payload->>'status')::public.booking_status_type, arrival, departure, guests, price, stay_override) RETURNING * INTO saved;
    ELSE
      UPDATE public.bookings SET studio_id = studio.id, customer_id = selected_customer_id,
        source = (p_payload->>'source')::public.booking_source_type, status = (p_payload->>'status')::public.booking_status_type,
        check_in = arrival, check_out = departure, guests_count = guests, total_price = price, minimum_stay_override = stay_override, version = version + 1
      WHERE id = p_booking_id RETURNING * INTO saved;
    END IF;
    DELETE FROM public.availability_blocks WHERE booking_id = saved.id;
    INSERT INTO public.availability_blocks (studio_id, booking_id, source, start_date, end_date, reason)
    VALUES (saved.studio_id, saved.id, saved.source::text::public.availability_block_source_type, saved.check_in, saved.check_out, 'Réservation #' || saved.id);
  END IF;
  INSERT INTO public.booking_events (booking_id, actor_id, actor_email, action, reason, previous_data, current_data)
  VALUES (saved.id, auth.uid(), (SELECT email FROM public.admin_users WHERE id = auth.uid()), p_action, reason,
    CASE WHEN p_action = 'create' THEN NULL ELSE to_jsonb(old_booking) END, to_jsonb(saved));
  RETURN saved.id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_save_booking(text, bigint, integer, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_booking(text, bigint, integer, jsonb) TO authenticated;
