import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getBookingOptions } from "@/lib/bookings/options"
import type { BookingValues } from "@/lib/bookings/form"
import { BookingForm } from "../../booking-form"
import { CancelBookingForm } from "../../cancel-form"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Détails de la réservation | The Studio" }
const actions: Record<string, string> = { create: "Réservation créée", update: "Réservation modifiée", cancel: "Réservation annulée" }
const fields: Record<string, string> = { minimum_stay_override: "Dérogation au minimum de 2 nuits", studio_id: "Studio", customer_id: "Client", check_in: "Arrivée", check_out: "Départ", guests_count: "Voyageurs", total_price: "Montant", source: "Canal", status: "Statut" }
const labels: Record<string, string> = { pending: "En attente", confirmed: "Confirmée", cancelled: "Annulée", direct: "Direct", airbnb: "Airbnb", booking: "Booking.com" }
function valueLabel(value: unknown) { return typeof value === "boolean" ? (value ? "Activée" : "Désactivée") : labels[String(value)] ?? String(value ?? "—") }

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
  const booking = data as unknown as BookingValues & { customers: { first_name: string; last_name: string; email: string } | null; studios: { name: string; currency: string } | null }
  const cancelled = booking.status === "cancelled"
  const options = cancelled ? null : await getBookingOptions()
  return (
    <main className="mx-auto grid max-w-4xl gap-6">
      <div><Link href="/admin/bookings" className="text-sm text-slate-500 hover:underline">← Toutes les réservations</Link><h1 className="mt-3 text-3xl font-extrabold tracking-tight">Réservation #{booking.id}</h1></div>
      {query.success && Object.hasOwn(actions, query.success) ? <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{actions[query.success]}.</p> : null}
      {cancelled ? <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold text-rose-700">Réservation annulée</h2>
        <p>{booking.customers ? `${booking.customers.first_name} ${booking.customers.last_name} · ${booking.customers.email}` : `Client #${booking.customer_id}`}</p>
        <p>{booking.studios?.name ?? `Studio #${booking.studio_id}`} · Du {booking.check_in} au {booking.check_out}</p>
        <p>{booking.guests_count} voyageur(s) · {new Intl.NumberFormat("fr-FR", { style: "currency", currency: booking.studios?.currency ?? "EUR" }).format(Number(booking.total_price))} · {valueLabel(booking.source)}</p>
        <p className="text-sm text-slate-500">Conservée dans l’historique. Les dates ont été libérées.</p>
        <Button variant="outline" asChild className="w-fit"><Link href="/admin/bookings">Retour à la liste</Link></Button>
      </section> : options ? <><BookingForm key={`${booking.id}-${booking.version}`} booking={booking} options={options} /><CancelBookingForm key={`cancel-${booking.version}`} id={booking.id} version={booking.version} /></> : null}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold">Historique de la réservation</h2>
        {history.error ? <p role="alert" className="mt-3 text-sm text-destructive">L’historique n’a pas pu être chargé.</p> : history.data?.length ? <ol className="mt-4 grid gap-4">
          {history.data.map(event => <li key={event.id} className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold">{actions[event.action] ?? event.action}</p>
            <p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Martinique" }).format(new Date(event.created_at))} (Martinique) · {event.actor_email}</p>
            {event.action === "create" && event.current_data?.minimum_stay_override ? <p className="mt-2 text-sm text-amber-800">Dérogation administrateur au minimum de 2 nuits.</p> : null}
            {event.reason ? <p className="mt-2 whitespace-pre-wrap text-sm">Motif : {event.reason}</p> : null}
            {event.action === "update" ? <ul className="mt-2 grid gap-1 text-xs text-slate-600">{Object.entries(fields).filter(([key]) => event.previous_data?.[key] !== event.current_data?.[key]).map(([key, label]) => <li key={key}>{label} : {valueLabel(event.previous_data?.[key])} → {valueLabel(event.current_data?.[key])}</li>)}</ul> : null}
          </li>)}
        </ol> : <p className="mt-3 text-sm text-slate-500">Aucune opération enregistrée depuis l’activation de l’historique.</p>}
        {(history.data?.length ?? 0) >= 100 ? <p className="mt-3 text-xs text-slate-500">Les 100 opérations les plus récentes sont affichées.</p> : null}
      </section>
    </main>
  )
}
