"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BookingOptions, BookingValues } from "@/lib/bookings/form"
import { BookingCustomerFields } from "./booking-customer-fields"
import { BookingStayFields } from "./booking-stay-fields"
import { useBookingForm } from "./use-booking-form"

const selectClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"

export function BookingForm({ options, booking }: { options: BookingOptions; booking?: BookingValues }) {
  const form = useBookingForm(options, booking)
  const { state, action, pending, minimumStayOverride, setMinimumStayOverride, customer, setCustomer,
    studioId, setStudioId, values, setValue, setDates, availability, dateConflict, price } = form
  return (
    <Card>
      <CardHeader><CardTitle>{booking ? "Modifier le séjour" : "Informations de la réservation"}</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="grid gap-6">
          {state.error ? <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{state.error}</p> : null}
          <fieldset disabled={pending} className="grid gap-5 disabled:opacity-60">
            <BookingCustomerFields customers={options.customers} customer={customer} onCustomerChange={setCustomer} values={values} onValueChange={setValue} selectClass={selectClass} />
            <BookingStayFields studios={options.studios} studioId={studioId} onStudioChange={setStudioId} availabilityReady={availability.ready} availabilityError={availability.error} refreshAvailability={availability.refresh} minimumStayOverride={minimumStayOverride} onOverrideChange={setMinimumStayOverride} unavailable={availability.unavailable} pending={pending} values={values} onValueChange={setValue} onDateChange={setDates} price={price} selectClass={selectClass} />
            <p className="text-xs leading-5 text-slate-500">{minimumStayOverride ? "Dérogation active : séjour d’au moins 1 nuit." : "Un minimum de 2 nuits est requis."} La disponibilité est vérifiée à l’enregistrement. Une réservation en attente ou confirmée bloque les dates du séjour. Le total est calculé avec le tarif actuel du studio et le nombre de nuits, puis vérifié à l’enregistrement.</p>
            <div className="flex flex-wrap gap-3"><Button type="submit" disabled={pending || !price || !availability.ready || dateConflict}>{pending ? "Enregistrement…" : booking ? "Enregistrer les modifications" : "Créer la réservation"}</Button><Button variant="outline" asChild><Link href="/admin/bookings">Retour à la liste</Link></Button></div>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  )
}
