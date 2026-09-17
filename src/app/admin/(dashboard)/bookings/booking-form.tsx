"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BookingOptions, BookingValues } from "@/lib/bookings/form"
import { BookingDateRange } from "./booking-date-range"
import { getBookingPrice } from "@/lib/bookings/pricing"
import { saveBookingAction } from "./actions"
import { isStayAvailable, type UnavailableRange } from "@/lib/bookings/availability"

const selectClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"

export function BookingForm({ options, booking }: { options: BookingOptions; booking?: BookingValues }) {
  const [state, action, pending] = useActionState(saveBookingAction.bind(null, booking?.id ?? null, booking?.version ?? null), {})
  const [minimumStayOverride, setMinimumStayOverride] = useState(booking?.minimum_stay_override ?? false)
  const [customer, setCustomer] = useState(String(booking?.customer_id ?? "new"))
  const [studioId, setStudioId] = useState(String(booking?.studio_id ?? ""))
  const [availability, setAvailability] = useState<{ studioId: string; unavailable: UnavailableRange[]; error?: string } | null>(null)
  const [availabilityRefresh, setAvailabilityRefresh] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({
    first_name: "", last_name: "", email: "", phone_country_code: "", phone_number: "",
    check_in: booking?.check_in ?? "", check_out: booking?.check_out ?? "",
    guests_count: String(booking?.guests_count ?? 1),
    source: booking?.source ?? "direct", status: booking?.status ?? "pending",
  })
  function field(name: string) {
    return { value: values[name], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setValues(previous => ({ ...previous, [name]: event.target.value })) }
  }
  const studio = options.studios.find(item => String(item.id) === studioId)
  useEffect(() => {
    if (!studioId) return
    const controller = new AbortController()
    const params = new URLSearchParams({ studioId })
    if (booking?.id) params.set("bookingId", String(booking.id))
    fetch(`/api/admin/bookings/availability?${params}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error ?? "Impossible de charger les disponibilités.")
        return result as { unavailable: UnavailableRange[] }
      })
      .then(result => setAvailability({ studioId, unavailable: result.unavailable }))
      .catch(error => {
        if (!controller.signal.aborted) setAvailability({ studioId, unavailable: [], error: error instanceof Error ? error.message : "Impossible de charger les disponibilités." })
      })
    return () => controller.abort()
  }, [studioId, booking?.id, availabilityRefresh])
  const availabilityReady = Boolean(studioId && availability?.studioId === studioId && !availability.error)
  const unavailable = availabilityReady ? availability?.unavailable ?? [] : []
  const dateConflict = Boolean(availabilityReady && values.check_in && values.check_out && !isStayAvailable(values.check_in, values.check_out, unavailable))
  const price = studio ? getBookingPrice(studio.base_price, values.check_in, values.check_out, minimumStayOverride) : null
  const formatMoney = (amount: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: studio?.currency ?? "EUR" }).format(amount)
  return (
    <Card>
      <CardHeader><CardTitle>{booking ? "Modifier le séjour" : "Informations de la réservation"}</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="grid gap-6">
          {state.error ? <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{state.error}</p> : null}
          <fieldset disabled={pending} className="grid gap-5 disabled:opacity-60">
            <label className="grid gap-2 text-sm font-medium">Client
              <select name="customer_id" value={customer} onChange={event => setCustomer(event.target.value)} className={selectClass}>
                <option value="new">Nouveau client</option>
                {options.customers.map(item => <option key={item.id} value={item.id}>{item.first_name} {item.last_name} — {item.email}</option>)}
              </select>
            </label>
            {customer === "new" ? <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">Prénom<Input name="first_name" {...field("first_name")} required maxLength={254} autoComplete="given-name" /></label>
              <label className="grid gap-2 text-sm">Nom<Input name="last_name" {...field("last_name")} required maxLength={254} autoComplete="family-name" /></label>
              <label className="grid gap-2 text-sm sm:col-span-2">E-mail<Input name="email" {...field("email")} type="email" required maxLength={254} autoComplete="email" /></label>
              <label className="grid gap-2 text-sm">Indicatif téléphonique<Input name="phone_country_code" {...field("phone_country_code")} required placeholder="+596" autoComplete="tel-country-code" /></label>
              <label className="grid gap-2 text-sm">Téléphone<Input name="phone_number" {...field("phone_number")} type="tel" required maxLength={30} autoComplete="tel-national" /></label>
            </div> : null}
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium sm:col-span-2">Studio
                <select name="studio_id" required value={studioId} onChange={event => setStudioId(event.target.value)} className={selectClass}>
                  <option value="">Choisir un studio</option>
                  {options.studios.map(item => <option key={item.id} value={item.id}>{item.name} — {item.capacity} voyageurs maximum</option>)}
                </select>
              </label>
              {studioId && !availabilityReady ? <div className="text-sm text-slate-600 sm:col-span-2" role={availability?.studioId === studioId && availability.error ? "alert" : "status"}>
                {availability?.studioId === studioId && availability.error ? <>{availability.error} <Button type="button" variant="link" size="sm" onClick={() => setAvailabilityRefresh(value => value + 1)}>Réessayer</Button></> : "Chargement des disponibilités…"}
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
              <div className="grid gap-2 text-sm" aria-live="polite" aria-atomic="true">
                <span className="font-medium">Montant total</span>
                <output className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-semibold">{price ? formatMoney(price.total) : "—"}</output>
                <p className="text-xs text-slate-500">{price ? `${price.nights} nuit${price.nights > 1 ? "s" : ""} × ${formatMoney(price.nightlyRate)} / nuit` : minimumStayOverride ? "Sélectionnez un studio et un séjour d’au moins 1 nuit." : "Sélectionnez un studio et un séjour d’au moins 2 nuits."}</p>
              </div>
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
