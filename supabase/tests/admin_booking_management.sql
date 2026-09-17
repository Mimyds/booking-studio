-- Run against a disposable database with the application schema and migration loaded.
BEGIN;
INSERT INTO public.studios (id, slug, name, capacity, base_price) VALUES (900001, 'test-booking', 'Test studio', 2, 80.50);
INSERT INTO public.customers (id, first_name, last_name, email, phone_country_code, phone_number)
VALUES (900001, 'Test', 'Client', 'test@example.com', '+596', '696123456');
DO $$
DECLARE
  payload jsonb := '{"studio_id":900001,"customer_id":900001,"check_in":"2026-11-01","check_out":"2026-11-04","guests_count":2,"total_price":"100.50","source":"direct","status":"confirmed"}';
  test_booking_id bigint;
  next_id bigint;
BEGIN
  BEGIN
    PERFORM public.admin_save_booking('create', NULL, NULL, payload || '{"check_out":"2026-11-02"}');
    RAISE EXCEPTION 'TEST FAILED: one-night creation accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Le séjour doit comprendre au moins 2 nuits.' THEN RAISE; END IF;
  END;
  test_booking_id := public.admin_save_booking('create', NULL, NULL, payload);
  ASSERT (SELECT total_price FROM public.bookings WHERE id = test_booking_id) = 241.50, 'derive total from studio rate and three nights, ignoring payload';
  ASSERT (SELECT count(*) FROM public.availability_blocks WHERE availability_blocks.booking_id = test_booking_id) = 1, 'creation must block dates';
  BEGIN
    PERFORM public.admin_save_booking('create', NULL, NULL, payload);
    RAISE EXCEPTION 'TEST FAILED: duplicate accepted';
  EXCEPTION WHEN exclusion_violation THEN NULL; END;
  next_id := public.admin_save_booking('create', NULL, NULL, payload || '{"check_in":"2026-11-04","check_out":"2026-11-06"}');
  BEGIN
    PERFORM public.admin_save_booking('update', test_booking_id, 1, payload || '{"guests_count":3}');
    RAISE EXCEPTION 'TEST FAILED: over capacity accepted';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE; END IF; END;
  BEGIN
    PERFORM public.admin_save_booking('update', test_booking_id, 1, payload || '{"check_out":"2026-11-02"}');
    RAISE EXCEPTION 'TEST FAILED: one-night update accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Le séjour doit comprendre au moins 2 nuits.' THEN RAISE; END IF;
  END;
  BEGIN
    UPDATE public.bookings SET check_out = check_in + 1 WHERE id = test_booking_id;
    RAISE EXCEPTION 'TEST FAILED: direct one-night update accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  PERFORM public.admin_save_booking('update', test_booking_id, 1, payload || '{"check_out":"2026-11-03","total_price":"0.01"}');
  ASSERT (SELECT total_price FROM public.bookings WHERE id = test_booking_id) = 161, 'date changes must recalculate price and ignore a forged total';
  BEGIN
    PERFORM public.admin_save_booking('cancel', test_booking_id, 1, '{"reason":"stale"}');
    RAISE EXCEPTION 'TEST FAILED: stale version accepted';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE; END IF; END;
  BEGIN
    PERFORM public.admin_save_booking('cancel', test_booking_id, 2, '{"reason":""}');
    RAISE EXCEPTION 'TEST FAILED: missing reason accepted';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE; END IF; END;
  PERFORM public.admin_save_booking('cancel', test_booking_id, 2, '{"reason":"Demande du client"}');
  ASSERT (SELECT status FROM public.bookings WHERE id = test_booking_id) = 'cancelled', 'retain cancelled booking';
  ASSERT NOT EXISTS (SELECT 1 FROM public.availability_blocks a WHERE a.booking_id = test_booking_id), 'cancel must release dates';
  ASSERT (SELECT count(*) FROM public.booking_events e WHERE e.booking_id = test_booking_id) = 3, 'audit every action';
  ASSERT EXISTS (SELECT 1 FROM public.booking_events e WHERE e.booking_id = test_booking_id AND reason = 'Demande du client' AND actor_id = auth.uid()), 'audit cancellation actor and reason';
  BEGIN
    PERFORM public.admin_save_booking('update', test_booking_id, 3, payload);
    RAISE EXCEPTION 'TEST FAILED: cancelled booking edited';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE; END IF; END;
  PERFORM public.admin_save_booking('create', NULL, NULL, payload);
  -- New customer and booking are created together.
  PERFORM public.admin_save_booking('create', NULL, NULL, (payload - 'customer_id') || '{"check_in":"2026-12-01","check_out":"2026-12-03","first_name":"New","last_name":"Guest","email":"new@example.com","phone_country_code":"+596","phone_number":"696000000"}');
  ASSERT EXISTS (SELECT 1 FROM public.customers WHERE email = 'new@example.com'), 'new customer created';
  -- An external availability block must also prevent a booking.
  INSERT INTO public.availability_blocks (studio_id, booking_id, source, start_date, end_date) VALUES (900001, next_id, 'manual', '2026-12-10', '2026-12-12');
  BEGIN
    PERFORM public.admin_save_booking('create', NULL, NULL, payload || '{"check_in":"2026-12-11","check_out":"2026-12-13"}');
    RAISE EXCEPTION 'TEST FAILED: external block ignored';
  EXCEPTION WHEN exclusion_violation THEN NULL; END;
END;
$$;
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  BEGIN
    DELETE FROM public.bookings WHERE studio_id = 900001;
    RAISE EXCEPTION 'TEST FAILED: permanent deletion permitted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
