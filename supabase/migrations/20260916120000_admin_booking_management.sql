-- All admin booking mutations go through a transaction that also updates availability.
ALTER TABLE public.bookings ADD COLUMN version integer NOT NULL DEFAULT 1;
CREATE TABLE public.booking_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id bigint NOT NULL REFERENCES public.bookings(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid NOT NULL,
  actor_email text NOT NULL,
  action text NOT NULL CHECK (action IN ('create', 'update', 'cancel')),
  reason text,
  previous_data jsonb,
  current_data jsonb NOT NULL
);
CREATE INDEX booking_events_booking_idx ON public.booking_events (booking_id, id DESC);
CREATE INDEX bookings_studio_dates_idx ON public.bookings (studio_id, check_in, check_out) WHERE status <> 'cancelled';
CREATE INDEX availability_blocks_studio_dates_idx ON public.availability_blocks (studio_id, start_date, end_date);
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.booking_events FROM anon, authenticated;
GRANT SELECT ON public.booking_events TO authenticated;
CREATE POLICY "Admins read booking history" ON public.booking_events FOR SELECT TO authenticated USING ((SELECT public.is_admin()));
-- Prevent bypassing audit, cancellation and availability checks from the client API.
REVOKE INSERT, UPDATE, DELETE ON public.bookings FROM authenticated;

CREATE FUNCTION public.admin_save_booking(p_action text, p_booking_id bigint, p_version integer, p_payload jsonb)
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
    arrival := (p_payload->>'check_in')::date;
    departure := (p_payload->>'check_out')::date;
    guests := (p_payload->>'guests_count')::bigint;
    -- The stored total is authoritative: never trust a client-supplied amount.
    price := round(studio.base_price * (departure - arrival), 2);
    IF arrival IS NULL OR departure IS NULL OR departure <= arrival THEN RAISE EXCEPTION 'La date de départ doit suivre la date d’arrivée.'; END IF;
    IF departure - arrival < 2 THEN RAISE EXCEPTION 'Le séjour doit comprendre au moins 2 nuits.'; END IF;
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
      INSERT INTO public.bookings (studio_id, customer_id, source, status, check_in, check_out, guests_count, total_price)
      VALUES (studio.id, selected_customer_id, (p_payload->>'source')::public.booking_source_type, (p_payload->>'status')::public.booking_status_type, arrival, departure, guests, price) RETURNING * INTO saved;
    ELSE
      UPDATE public.bookings SET studio_id = studio.id, customer_id = selected_customer_id,
        source = (p_payload->>'source')::public.booking_source_type, status = (p_payload->>'status')::public.booking_status_type,
        check_in = arrival, check_out = departure, guests_count = guests, total_price = price, version = version + 1
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
