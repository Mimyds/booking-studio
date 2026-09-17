"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BookingOptions } from "@/lib/bookings/form"
import type { getBookingPrice } from "@/lib/bookings/pricing"
import type { UnavailableRange } from "@/lib/bookings/availability"
import { BookingDateRange } from "./booking-date-range"
import { BookingPriceSummary } from "./booking-price-summary"

type Props = {
  studios: BookingOptions["studios"]
  studioId: string
  onStudioChange: (value: string) => void
  availabilityReady: boolean
  availabilityError?: string
  refreshAvailability: () => void
  minimumStayOverride: boolean
  onOverrideChange: (value: boolean) => void
  unavailable: UnavailableRange[]
  pending: boolean
  values: Record<string, string>
  onValueChange: (name: string, value: string) => void
  onDateChange: (checkIn: string, checkOut: string) => void
  price: ReturnType<typeof getBookingPrice>
  selectClass: string
}

function AvailabilityNotice({ error, retry }: { error?: string; retry: () => void }) {
  return <div className="text-sm text-slate-600 sm:col-span-2" role={error ? "alert" : "status"}>
    {error ? <>{error} <Button type="button" variant="link" size="sm" onClick={retry}>Réessayer</Button></> : "Chargement des disponibilités…"}
  </div>
}

export function BookingStayFields({ studios, studioId, onStudioChange, availabilityReady, availabilityError, refreshAvailability, minimumStayOverride, onOverrideChange, unavailable, pending, values, onValueChange, onDateChange, price, selectClass }: Props) {
  const studio = studios.find(item => String(item.id) === studioId)
  return <div className="grid gap-5 sm:grid-cols-2">
    <label className="grid gap-2 text-sm font-medium sm:col-span-2">Studio
      <select name="studio_id" required value={studioId} onChange={event => onStudioChange(event.target.value)} className={selectClass}>
        <option value="">Choisir un studio</option>
        {studios.map(item => <option key={item.id} value={item.id}>{item.name} — {item.capacity} voyageurs maximum</option>)}
      </select>
    </label>
    {studioId && !availabilityReady ? <AvailabilityNotice error={availabilityError} retry={refreshAvailability} /> : null}
    <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm sm:col-span-2">
      <input type="checkbox" name="minimum_stay_override" checked={minimumStayOverride} onChange={event => onOverrideChange(event.target.checked)} className="mt-1" />
      <span><span className="block font-medium">Autoriser exceptionnellement un séjour d’une nuit</span><span className="mt-1 block text-xs text-slate-600">Dérogation administrateur pour cette réservation uniquement, enregistrée dans l’historique.</span></span>
    </label>
    <BookingDateRange checkIn={values.check_in} checkOut={values.check_out} minimumStayOverride={minimumStayOverride} disabled={pending || !availabilityReady} unavailable={unavailable} onChange={onDateChange} />
    <label className="grid gap-2 text-sm font-medium">Voyageurs<Input name="guests_count" value={values.guests_count} onChange={event => onValueChange("guests_count", event.target.value)} type="number" required min={1} max={studio?.capacity} step={1} /></label>
    <BookingPriceSummary price={price} currency={studio?.currency ?? "EUR"} minimumStayOverride={minimumStayOverride} />
    <label className="grid gap-2 text-sm font-medium">Canal<select name="source" value={values.source} onChange={event => onValueChange("source", event.target.value)} className={selectClass}><option value="direct">Direct</option><option value="airbnb">Airbnb</option><option value="booking">Booking.com</option></select></label>
    <label className="grid gap-2 text-sm font-medium">Statut<select name="status" value={values.status} onChange={event => onValueChange("status", event.target.value)} className={selectClass}><option value="pending">En attente</option><option value="confirmed">Confirmée</option></select></label>
  </div>
}
