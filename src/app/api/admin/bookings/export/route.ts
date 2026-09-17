import { NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { bookingsCsv, type ExportBooking } from "@/lib/bookings/export"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 500

export async function GET() {
  if (!(await getCurrentAdmin())) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 })
  }

  const supabase = await createServerSupabaseClient()
  const bookings: ExportBooking[] = []
  let lastId = 0

  while (true) {
    const { data, error } = await supabase
      .from("bookings")
      .select("id, created_at, source, status, check_in, check_out, guests_count, total_price, minimum_stay_override, customers(first_name, last_name, email, phone_country_code, phone_number), studios(name, currency)")
      .gt("id", lastId)
      .order("id", { ascending: true })
      .limit(PAGE_SIZE)

    if (error) {
      console.error("[export-bookings] Supabase read failed", { code: error.code })
      return NextResponse.json({ error: "Impossible d’exporter les réservations." }, { status: 500 })
    }

    const batch = (data ?? []) as unknown as ExportBooking[]
    bookings.push(...batch)
    if (batch.length < PAGE_SIZE) break
    lastId = batch[batch.length - 1].id
  }

  const filename = `reservations-${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse(bookingsCsv(bookings), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
