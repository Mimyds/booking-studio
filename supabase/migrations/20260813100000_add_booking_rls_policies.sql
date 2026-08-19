ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."availability_blocks" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."bookings" FROM "anon";
REVOKE ALL ON TABLE "public"."customers" FROM "anon";
REVOKE ALL ON TABLE "public"."payments" FROM "anon";
REVOKE ALL ON TABLE "public"."availability_blocks" FROM "anon";

REVOKE ALL ON SEQUENCE "public"."bookings_id_seq" FROM "anon";
REVOKE ALL ON SEQUENCE "public"."customers_id_seq" FROM "anon";
REVOKE ALL ON SEQUENCE "public"."payments_id_seq" FROM "anon";
REVOKE ALL ON SEQUENCE "public"."availability_blocks_id_seq" FROM "anon";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."bookings" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."customers" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."payments" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."availability_blocks" TO "authenticated";

GRANT USAGE, SELECT ON SEQUENCE "public"."bookings_id_seq" TO "authenticated";
GRANT USAGE, SELECT ON SEQUENCE "public"."customers_id_seq" TO "authenticated";
GRANT USAGE, SELECT ON SEQUENCE "public"."payments_id_seq" TO "authenticated";
GRANT USAGE, SELECT ON SEQUENCE "public"."availability_blocks_id_seq" TO "authenticated";

DROP POLICY IF EXISTS "Admins can manage bookings"
ON "public"."bookings";

CREATE POLICY "Admins can manage bookings"
ON "public"."bookings"
FOR ALL
TO "authenticated"
USING ((SELECT "public"."is_admin"()))
WITH CHECK ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admins can manage customers"
ON "public"."customers";

CREATE POLICY "Admins can manage customers"
ON "public"."customers"
FOR ALL
TO "authenticated"
USING ((SELECT "public"."is_admin"()))
WITH CHECK ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admins can manage payments"
ON "public"."payments";

CREATE POLICY "Admins can manage payments"
ON "public"."payments"
FOR ALL
TO "authenticated"
USING ((SELECT "public"."is_admin"()))
WITH CHECK ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admins can manage availability blocks"
ON "public"."availability_blocks";

CREATE POLICY "Admins can manage availability blocks"
ON "public"."availability_blocks"
FOR ALL
TO "authenticated"
USING ((SELECT "public"."is_admin"()))
WITH CHECK ((SELECT "public"."is_admin"()));
