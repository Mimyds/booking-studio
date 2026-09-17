"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BookingOptions, BookingValues } from "@/lib/bookings/form"
import { BookingDateRange } from "./booking-date-range"
import { getBookingPrice } from "@/lib/bookings/pricing"
import { saveBookingAction } from "./actions"
import { isStayAvailable } from "@/lib/bookings/availability"
import { useBookingAvailability } from "./use-booking-availability"
import { BookingCustomerFields } from "./booking-customer-fields"
import { BookingPriceSummary } from "./booking-price-summary"

const selectClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"

export function BookingForm({ options, booking }: { options: BookingOptions; booking?: BookingValues }) {
  const [state, action, pending] = useActionState(saveBookingAction.bind(null, booking?.id ?? null, booking?.version ?? null), {})
  const [minimumStayOverride, setMinimumStayOverride] = useState(booking?.minimum_stay_override ?? false)
  const [customer, setCustomer] = useState(String(booking?.customer_id ?? "new"))
  const [studioId, setStudioId] = useState(String(booking?.studio_id ?? ""))
  const [values, setValues] = useState<Record<string, string>>({
    first_name: "", last_name: "", email: "", phone_country_code: "", phone_number: "",
    check_in: booking?.check_in ?? "", check_out: booking?.check_out ?? "",
    guests_count: String(booking?.guests_count ?? 1),
    source: booking?.source ?? "direct", status: booking?.status ?? "pending",
  })
  function field(name: string) {
    return { value: values[name], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setValues(previous => ({ ...previous, [name]: event.target.value })) }
  }
  function setValue(name: string, value: string) {
    setValues(previous => ({ ...previous, [name]: value }))
  }
  const studio = options.studios.find(item => String(item.id) === studioId)
  const { ready: availabilityReady, error: availabilityError, unavailable, refresh: refreshAvailability } = useBookingAvailability(studioId, booking?.id)
  const dateConflict = Boolean(availabilityReady && values.check_in && values.check_out && !isStayAvailable(values.check_in, values.check_out, unavailable))
  const price = studio ? getBookingPrice(studio.base_price, values.check_in, values.check_out, minimumStayOverride) : null
  return (
    <Card>
      <CardHeader><CardTitle>{booking ? "Modifier le séjour" : "Informations de la réservation"}</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="grid gap-6">
          {state.error ? <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{state.error}</p> : null}
          <fieldset disabled={pending} className="grid gap-5 disabled:opacity-60">
            <BookingCustomerFields customers={options.customers} customer={customer} onCustomerChange={setCustomer} values={values} onValueChange={setValue} selectClass={selectClass} />
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium sm:col-span-2">Studio
                <select name="studio_id" required value={studioId} onChange={event => setStudioId(event.target.value)} className={selectClass}>
                  <option value="">Choisir un studio</option>
                  {options.studios.map(item => <option key={item.id} value={item.id}>{item.name} — {item.capacity} voyageurs maximum</option>)}
                </select>
              </label>
              {studioId && !availabilityReady ? <div className="text-sm text-slate-600 sm:col-span-2" role={availabilityError ? "alert" : "status"}>
                {availabilityError ? <>{availabilityError} <Button type="button" variant="link" size="sm" onClick={refreshAvailability}>Réessayer</Button></> : "Chargement des disponibilités…"}
              </div> : null}
              <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm sm:col-span-2">
                <input type="checkbox" name="minimum_stay_override" checked={minimumStayOverride} onChange={event => setMinimumStayOverride(event.target.checked)} className="mt-1" />
                <span><span className="block font-medium">Autoriser exceptionnellement un séjour d’une nuit</span><span className="mt-1 block text-xs text-slate-600">Dérogation administrateur pour cette réservation uniquement, enregistrée dans l’historique.</span></span>
              </label>
              <BookingDateRange
                checkIn={values.check_in}
                checkOut={values.check_out}
                minimumStayOverride={minimumStayOverride}
                disabled={pending || !availabilityReady}
                unavailable={unavailable}
                onChange={(check_in, check_out) => setValues(previous => ({ ...previous, check_in, check_out }))}
              />
              <label className="grid gap-2 text-sm font-medium">Voyageurs<Input name="guests_count" {...field("guests_count")} type="number" required min={1} max={studio?.capacity} step={1} /></label>
              <BookingPriceSummary price={price} currency={studio?.currency ?? "EUR"} minimumStayOverride={minimumStayOverride} />
              <label className="grid gap-2 text-sm font-medium">Canal<select name="source" {...field("source")} className={selectClass}><option value="direct">Direct</option><option value="airbnb">Airbnb</option><option value="booking">Booking.com</option></select></label>
              <label className="grid gap-2 text-sm font-medium">Statut<select name="status" {...field("status")} className={selectClass}><option value="pending">En attente</option><option value="confirmed">Confirmée</option></select></label>
            </div>
            <p className="text-xs leading-5 text-slate-500">{minimumStayOverride ? "Dérogation active : séjour d’au moins 1 nuit." : "Un minimum de 2 nuits est requis."} La disponibilité est vérifiée à l’enregistrement. Une réservation en attente ou confirmée bloque les dates du séjour. Le total est calculé avec le tarif actuel du studio et le nombre de nuits, puis vérifié à l’enregistrement.</p>
            <div className="flex flex-wrap gap-3"><Button type="submit" disabled={pending || !price || !availabilityReady || dateConflict}>{pending ? "Enregistrement…" : booking ? "Enregistrer les modifications" : "Créer la réservation"}</Button><Button variant="outline" asChild><Link href="/admin/bookings">Retour à la liste</Link></Button></div>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  )
}
