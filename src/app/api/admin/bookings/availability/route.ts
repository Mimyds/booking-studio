import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/admin/auth"
import type { UnavailableRange } from "@/lib/bookings/availability"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 500

function positiveId(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return null
  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0 ? number : null
}

export async function GET(request: NextRequest) {
  if (!(await getCurrentAdmin())) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 })
  }

  const studioId = positiveId(request.nextUrl.searchParams.get("studioId"))
  const rawBookingId = request.nextUrl.searchParams.get("bookingId")
  const bookingId = rawBookingId === null ? null : positiveId(rawBookingId)
  if (!studioId || (rawBookingId !== null && !bookingId)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  async function readBookings(): Promise<UnavailableRange[]> {
    const ranges: UnavailableRange[] = []
    let lastId = 0
    while (true) {
      const { data, error } = await supabase.from("bookings")
        .select("id, check_in, check_out")
        .eq("studio_id", studioId)
        .neq("status", "cancelled")
        .gt("id", lastId)
        .order("id")
        .limit(PAGE_SIZE)
      if (error) throw error
      const batch = data ?? []
      for (const booking of batch) {
        if (booking.id !== bookingId) ranges.push({ from: booking.check_in, to: booking.check_out })
      }
      if (batch.length < PAGE_SIZE) break
      lastId = batch[batch.length - 1].id
    }
    return ranges
  }

  async function readBlocks(): Promise<UnavailableRange[]> {
    const ranges: UnavailableRange[] = []
    let lastId = 0
    while (true) {
      const { data, error } = await supabase.from("availability_blocks")
        .select("id, booking_id, start_date, end_date")
        .eq("studio_id", studioId)
        .gt("id", lastId)
        .order("id")
        .limit(PAGE_SIZE)
      if (error) throw error
      const batch = data ?? []
      for (const block of batch) {
        if (block.booking_id !== bookingId) ranges.push({ from: block.start_date, to: block.end_date })
      }
      if (batch.length < PAGE_SIZE) break
      lastId = batch[batch.length - 1].id
    }
    return ranges
  }

  try {
    const [bookings, blocks] = await Promise.all([readBookings(), readBlocks()])
    return NextResponse.json({ unavailable: [...bookings, ...blocks] }, {
      headers: { "Cache-Control": "private, no-store" },
    })
  } catch (error) {
    console.error("[booking-availability] Read failed", error)
    return NextResponse.json({ error: "Impossible de charger les disponibilités." }, { status: 500 })
  }
}
