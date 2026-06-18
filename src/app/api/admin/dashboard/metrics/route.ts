// src/app/api/admin/dashboard/metrics/route.ts
import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createServerSupabaseClient()

  try {
    const { data: kpis, error: kpisError } = await supabase
      .from("dashboard_kpis")
      .select("*")
      .single()

    if (kpisError) throw kpisError

    const { data: revenue } = await supabase
      .from("dashboard_revenue_over_time")
      .select("*")

    const { data: bookingsOverTime } = await supabase
      .from("dashboard_bookings_over_time")
      .select("*")

    const { data: bookingsByStudio } = await supabase
      .from("dashboard_bookings_by_studio")
      .select("*")

    const { data: bookingsBySource } = await supabase
      .from("dashboard_bookings_by_source")
      .select("*")

    const { data: upcomingArrivals } = await supabase
      .from("dashboard_upcoming_arrivals")
      .select("*")

    const { data: recentBookings } = await supabase
      .from("dashboard_recent_bookings")
      .select("*")

    const { data: paymentsAlerts } = await supabase
      .from("dashboard_payments_alerts")
      .select("*")

    return NextResponse.json({
      kpis,
      revenue_over_time: revenue ?? [],
      bookings_over_time: bookingsOverTime ?? [],
      bookings_by_studio: bookingsByStudio ?? [],
      bookings_by_source: bookingsBySource ?? [],
      upcoming_arrivals: upcomingArrivals ?? [],
      recent_bookings: recentBookings ?? [],
      payments_alerts: paymentsAlerts ?? [],
    })
  } catch (error) {
    console.error("Dashboard metrics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    )
  }
}