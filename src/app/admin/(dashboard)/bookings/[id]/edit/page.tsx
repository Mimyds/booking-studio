import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getBookingOptions } from "@/lib/bookings/options"
import { BookingEditContent, BookingHistory } from "./booking-edit-content"
import { actions, type BookingEvent, type EditedBooking } from "./booking-edit-model"

export const metadata = { title: "Détails de la réservation | The Studio" }

export default async function EditBookingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string }> }) {
  if (!(await getCurrentAdmin())) redirect("/admin/login")
  const { id } = await params
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) notFound()
  const supabase = await createServerSupabaseClient()
  const [{ data, error }, history, query] = await Promise.all([
    supabase.from("bookings").select("*, customers(first_name, last_name, email), studios(name, currency)").eq("id", id).maybeSingle(),
    supabase.from("booking_events").select("id, created_at, actor_email, action, reason, previous_data, current_data").eq("booking_id", id).order("id", { ascending: false }).limit(100),
    searchParams,
  ])
  if (error) throw new Error("Impossible de charger la réservation.")
  if (!data) notFound()
  const booking = data as unknown as EditedBooking
  const options = booking.status === "cancelled" ? null : await getBookingOptions()

  return <main className="mx-auto grid max-w-4xl gap-6">
    <div><Link href="/admin/bookings" className="text-sm text-slate-500 hover:underline">← Toutes les réservations</Link><h1 className="mt-3 text-3xl font-extrabold tracking-tight">Réservation #{booking.id}</h1></div>
    {query.success && Object.hasOwn(actions, query.success) ? <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{actions[query.success]}.</p> : null}
    <BookingEditContent booking={booking} options={options} />
    <BookingHistory events={(history.data ?? []) as BookingEvent[]} error={Boolean(history.error)} />
  </main>
}
