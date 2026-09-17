import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/formatters"
import type { BookingOptions } from "@/lib/bookings/form"
import { BookingForm } from "../../booking-form"
import { CancelBookingForm } from "../../cancel-form"
import { actions, type BookingEvent, type EditedBooking } from "./booking-edit-model"
const fields: Record<string, string> = {
  minimum_stay_override: "Dérogation au minimum de 2 nuits", studio_id: "Studio", customer_id: "Client",
  check_in: "Arrivée", check_out: "Départ", guests_count: "Voyageurs", total_price: "Montant",
  source: "Canal", status: "Statut",
}
const labels: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée", cancelled: "Annulée",
  direct: "Direct", airbnb: "Airbnb", booking: "Booking.com",
}

function valueLabel(value: unknown) {
  return typeof value === "boolean" ? (value ? "Activée" : "Désactivée") : labels[String(value)] ?? String(value ?? "—")
}

function CancelledBookingDetails({ booking }: { booking: EditedBooking }) {
  return <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-6">
    <h2 className="font-bold text-rose-700">Réservation annulée</h2>
    <p>{booking.customers ? `${booking.customers.first_name} ${booking.customers.last_name} · ${booking.customers.email}` : `Client #${booking.customer_id}`}</p>
    <p>{booking.studios?.name ?? `Studio #${booking.studio_id}`} · Du {booking.check_in} au {booking.check_out}</p>
    <p>{booking.guests_count} voyageur(s) · {formatCurrency(booking.total_price, booking.studios?.currency ?? "EUR")} · {valueLabel(booking.source)}</p>
    <p className="text-sm text-slate-500">Conservée dans l’historique. Les dates ont été libérées.</p>
    <Button variant="outline" asChild className="w-fit"><Link href="/admin/bookings">Retour à la liste</Link></Button>
  </section>
}

export function BookingEditContent({ booking, options }: { booking: EditedBooking; options: BookingOptions | null }) {
  if (booking.status === "cancelled") return <CancelledBookingDetails booking={booking} />
  if (!options) return null
  return <>
    <BookingForm key={`${booking.id}-${booking.version}`} booking={booking} options={options} />
    <CancelBookingForm key={`cancel-${booking.version}`} id={booking.id} version={booking.version} />
  </>
}

function BookingHistoryEvent({ event }: { event: BookingEvent }) {
  const changes = Object.entries(fields).filter(([key]) => event.previous_data?.[key] !== event.current_data?.[key])
  return <li className="rounded-xl bg-slate-50 p-4">
    <p className="text-sm font-semibold">{actions[event.action] ?? event.action}</p>
    <p className="mt-1 text-xs text-slate-500">{formatDate(event.created_at, { dateStyle: "medium", timeStyle: "short", timeZone: "America/Martinique" })} (Martinique) · {event.actor_email}</p>
    {event.action === "create" && event.current_data?.minimum_stay_override ? <p className="mt-2 text-sm text-amber-800">Dérogation administrateur au minimum de 2 nuits.</p> : null}
    {event.reason ? <p className="mt-2 whitespace-pre-wrap text-sm">Motif : {event.reason}</p> : null}
    {event.action === "update" ? <ul className="mt-2 grid gap-1 text-xs text-slate-600">{changes.map(([key, label]) => <li key={key}>{label} : {valueLabel(event.previous_data?.[key])} → {valueLabel(event.current_data?.[key])}</li>)}</ul> : null}
  </li>
}

export function BookingHistory({ events, error }: { events: BookingEvent[]; error: boolean }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-6">
    <h2 className="font-bold">Historique de la réservation</h2>
    {error ? <p role="alert" className="mt-3 text-sm text-destructive">L’historique n’a pas pu être chargé.</p>
      : events.length ? <ol className="mt-4 grid gap-4">{events.map(event => <BookingHistoryEvent key={event.id} event={event} />)}</ol>
        : <p className="mt-3 text-sm text-slate-500">Aucune opération enregistrée depuis l’activation de l’historique.</p>}
    {events.length >= 100 ? <p className="mt-3 text-xs text-slate-500">Les 100 opérations les plus récentes sont affichées.</p> : null}
  </section>
}
