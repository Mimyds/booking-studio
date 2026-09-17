-- Run with an authenticated admin identity against a disposable application database.
BEGIN;
INSERT INTO public.studios (id, slug, name, capacity, base_price) VALUES (900003, 'override-test', 'Override test', 2, 80.50);
INSERT INTO public.customers (id, first_name, last_name, email, phone_country_code, phone_number)
VALUES (900003, 'Test', 'Override', 'override@example.com', '+596', '696123456');
DO $$
DECLARE
  payload jsonb := '{"studio_id":900003,"customer_id":900003,"check_in":"2026-11-01","check_out":"2026-11-02","guests_count":2,"source":"direct","status":"confirmed","minimum_stay_override":true}';
  booking bigint;
BEGIN
  booking := public.admin_save_booking('create', NULL, NULL, payload);
  ASSERT (SELECT minimum_stay_override AND total_price = 80.50 FROM public.bookings WHERE id = booking), 'one-night override is stored and priced';
  ASSERT EXISTS (SELECT 1 FROM public.booking_events WHERE booking_id = booking AND current_data->>'minimum_stay_override' = 'true'), 'override audited';
  BEGIN
    PERFORM public.admin_save_booking('update', booking, 1, payload || '{"minimum_stay_override":false}');
    RAISE EXCEPTION 'TEST FAILED: one night without override accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Le séjour doit comprendre au moins 2 nuits.' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM public.admin_save_booking('update', booking, 1, payload || '{"check_out":"2026-11-01"}');
    RAISE EXCEPTION 'TEST FAILED: zero-night override accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'La date de départ doit suivre la date d’arrivée.' THEN RAISE; END IF;
  END;
  PERFORM public.admin_save_booking('update', booking, 1, payload || '{"check_out":"2026-11-03","minimum_stay_override":false}');
  ASSERT (SELECT NOT minimum_stay_override AND total_price = 161 FROM public.bookings WHERE id = booking), 'admin can remove override with valid dates';
  PERFORM public.admin_save_booking('update', booking, 2, payload);
  ASSERT (SELECT minimum_stay_override AND total_price = 80.5 FROM public.bookings WHERE id = booking), 'admin can enable override on edit';
  PERFORM public.admin_save_booking('cancel', booking, 3, '{"reason":"Annulation de test"}');
  ASSERT (SELECT status = 'cancelled' FROM public.bookings WHERE id = booking), 'override reservation remains cancellable';
END $$;
ROLLBACK;
