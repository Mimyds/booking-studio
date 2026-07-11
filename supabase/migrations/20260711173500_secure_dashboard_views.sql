DROP VIEW IF EXISTS "public"."dashboard_bookings_by_source";
DROP VIEW IF EXISTS "public"."dashboard_bookings_by_studio";
DROP VIEW IF EXISTS "public"."dashboard_bookings_over_time";
DROP VIEW IF EXISTS "public"."dashboard_kpis";
DROP VIEW IF EXISTS "public"."dashboard_payments_alerts";
DROP VIEW IF EXISTS "public"."dashboard_recent_bookings";
DROP VIEW IF EXISTS "public"."dashboard_revenue_over_time";
DROP VIEW IF EXISTS "public"."dashboard_upcoming_arrivals";

CREATE VIEW "public"."dashboard_bookings_by_source"
WITH ("security_invoker" = true) AS
 SELECT "source",
    "count"(*) AS "count"
   FROM "public"."bookings"
  GROUP BY "source"
  ORDER BY ("count"(*)) DESC;

CREATE VIEW "public"."dashboard_bookings_by_studio"
WITH ("security_invoker" = true) AS
 SELECT "s"."name" AS "studio",
    "count"("b"."id") AS "count"
   FROM ("public"."bookings" "b"
     JOIN "public"."studios" "s" ON (("s"."id" = "b"."studio_id")))
  GROUP BY "s"."name"
  ORDER BY ("count"("b"."id")) DESC;

CREATE VIEW "public"."dashboard_bookings_over_time"
WITH ("security_invoker" = true) AS
 SELECT "to_char"("created_at", 'YYYY-MM'::"text") AS "month",
    "count"(*) AS "count"
   FROM "public"."bookings"
  GROUP BY ("to_char"("created_at", 'YYYY-MM'::"text"))
  ORDER BY ("to_char"("created_at", 'YYYY-MM'::"text"));

CREATE VIEW "public"."dashboard_kpis"
WITH ("security_invoker" = true) AS
 SELECT ( SELECT "count"(*) AS "count"
           FROM "public"."studios") AS "studios_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."bookings"
          WHERE (("bookings"."check_in" >= CURRENT_DATE) AND ("bookings"."status" = 'confirmed'::"public"."booking_status_type"))) AS "upcoming_bookings",
    ( SELECT "count"(*) AS "count"
           FROM "public"."bookings"
          WHERE ("date_trunc"('month'::"text", "bookings"."created_at") = "date_trunc"('month'::"text", (CURRENT_DATE)::timestamp with time zone))) AS "monthly_bookings",
    ( SELECT COALESCE("sum"("bookings"."total_price"), (0)::numeric) AS "coalesce"
           FROM "public"."bookings"
          WHERE (("bookings"."status" = 'confirmed'::"public"."booking_status_type") AND ("date_trunc"('month'::"text", "bookings"."created_at") = "date_trunc"('month'::"text", (CURRENT_DATE)::timestamp with time zone)))) AS "monthly_revenue";

CREATE VIEW "public"."dashboard_payments_alerts"
WITH ("security_invoker" = true) AS
 SELECT "id" AS "payment_id",
    "booking_id",
    "amount",
    "status"
   FROM "public"."payments" "p"
  WHERE ("status" = ANY (ARRAY['pending'::"public"."payment_status_type", 'failed'::"public"."payment_status_type"]))
  ORDER BY "created_at" DESC;

CREATE VIEW "public"."dashboard_recent_bookings"
WITH ("security_invoker" = true) AS
 SELECT "b"."id" AS "booking_id",
    "b"."created_at",
    "b"."total_price",
    "s"."name" AS "studio_name"
   FROM ("public"."bookings" "b"
     JOIN "public"."studios" "s" ON (("s"."id" = "b"."studio_id")))
  ORDER BY "b"."created_at" DESC
 LIMIT 10;

CREATE VIEW "public"."dashboard_revenue_over_time"
WITH ("security_invoker" = true) AS
 SELECT "to_char"("created_at", 'YYYY-MM'::"text") AS "month",
    "sum"("total_price") AS "revenue"
   FROM "public"."bookings"
  WHERE ("status" = 'confirmed'::"public"."booking_status_type")
  GROUP BY ("to_char"("created_at", 'YYYY-MM'::"text"))
  ORDER BY ("to_char"("created_at", 'YYYY-MM'::"text"));

CREATE VIEW "public"."dashboard_upcoming_arrivals"
WITH ("security_invoker" = true) AS
 SELECT "b"."id" AS "booking_id",
    "b"."check_in",
    "c"."first_name",
    "c"."last_name",
    "s"."name" AS "studio_name"
   FROM (("public"."bookings" "b"
     JOIN "public"."customers" "c" ON (("c"."id" = "b"."customer_id")))
     JOIN "public"."studios" "s" ON (("s"."id" = "b"."studio_id")))
  WHERE (("b"."check_in" >= CURRENT_DATE) AND ("b"."status" = 'confirmed'::"public"."booking_status_type"))
  ORDER BY "b"."check_in"
 LIMIT 10;

REVOKE ALL ON TABLE "public"."dashboard_bookings_by_source" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_bookings_by_studio" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_bookings_over_time" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_kpis" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_payments_alerts" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_recent_bookings" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_revenue_over_time" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_upcoming_arrivals" FROM "anon";

GRANT SELECT ON TABLE "public"."dashboard_bookings_by_source" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_bookings_by_studio" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_bookings_over_time" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_kpis" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_payments_alerts" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_recent_bookings" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_revenue_over_time" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_upcoming_arrivals" TO "authenticated";
