REVOKE ALL ON TABLE "public"."dashboard_bookings_by_source" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_bookings_by_studio" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_bookings_over_time" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_kpis" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_payments_alerts" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_recent_bookings" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_revenue_over_time" FROM "anon";
REVOKE ALL ON TABLE "public"."dashboard_upcoming_arrivals" FROM "anon";

REVOKE ALL ON TABLE "public"."dashboard_bookings_by_source" FROM "authenticated";
REVOKE ALL ON TABLE "public"."dashboard_bookings_by_studio" FROM "authenticated";
REVOKE ALL ON TABLE "public"."dashboard_bookings_over_time" FROM "authenticated";
REVOKE ALL ON TABLE "public"."dashboard_kpis" FROM "authenticated";
REVOKE ALL ON TABLE "public"."dashboard_payments_alerts" FROM "authenticated";
REVOKE ALL ON TABLE "public"."dashboard_recent_bookings" FROM "authenticated";
REVOKE ALL ON TABLE "public"."dashboard_revenue_over_time" FROM "authenticated";
REVOKE ALL ON TABLE "public"."dashboard_upcoming_arrivals" FROM "authenticated";

GRANT SELECT ON TABLE "public"."dashboard_bookings_by_source" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_bookings_by_studio" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_bookings_over_time" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_kpis" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_payments_alerts" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_recent_bookings" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_revenue_over_time" TO "authenticated";
GRANT SELECT ON TABLE "public"."dashboard_upcoming_arrivals" TO "authenticated";
