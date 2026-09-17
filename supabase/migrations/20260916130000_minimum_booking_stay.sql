-- Enforce the minimum for every new or updated active reservation, including
-- writes outside the admin RPC. Preserve existing history and allow cancellation.
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_minimum_two_nights
  CHECK (status = 'cancelled' OR check_out - check_in >= 2) NOT VALID;
