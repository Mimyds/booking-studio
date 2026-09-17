"use client"

import { useId, useState } from "react"
import { parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"
import { FieldDescription, FieldGroup } from "@/components/ui/field"
import { isStayAvailable, type UnavailableRange } from "@/lib/bookings/availability"
import { getMinimumCheckout, getStayNights, MIN_BOOKING_NIGHTS } from "@/lib/bookings/stay"
import { BookingDateField, type DateField } from "./booking-date-field"

type BookingDateRangeProps = {
  checkIn: string
  checkOut: string
  minimumStayOverride: boolean
  disabled: boolean
  unavailable: UnavailableRange[]
  onChange: (checkIn: string, checkOut: string) => void
}

function stayDescription({ checkIn, checkOut, minimumNights, minimumStayOverride, unavailable }: Pick<BookingDateRangeProps, "checkIn" | "checkOut" | "minimumStayOverride" | "unavailable"> & { minimumNights: number }) {
  const nights = getStayNights(checkIn, checkOut)
  if (checkIn && checkOut && !isStayAvailable(checkIn, checkOut, unavailable)) return "Les dates sélectionnées ne sont plus disponibles. Choisissez un autre séjour."
  if (nights !== null && nights < minimumNights) return `Choisissez un séjour d’au moins ${minimumNights} nuit${minimumNights > 1 ? "s" : ""}.`
  const earliestCheckout = getMinimumCheckout(checkIn, minimumStayOverride)
  if (checkIn && !checkOut && earliestCheckout && !isStayAvailable(checkIn, earliestCheckout, unavailable)) {
    return `Cette arrivée ne permet pas un séjour de ${minimumNights} nuit${minimumNights > 1 ? "s" : ""} avant les dates occupées. Choisissez une arrivée plus tôt${minimumStayOverride ? "." : " ou activez la dérogation pour une nuit."}`
  }
  if (nights !== null) return `${nights} nuit${nights > 1 ? "s" : ""}`
  return checkIn ? "Sélectionnez maintenant la date de départ." : "Sélectionnez la date d’arrivée, puis la date de départ."
}

export function BookingDateRange({ checkIn, checkOut, minimumStayOverride, disabled, unavailable, onChange }: BookingDateRangeProps) {
  const id = useId()
  const [openField, setOpenField] = useState<DateField | null>(null)
  const minimumNights = minimumStayOverride ? 1 : MIN_BOOKING_NIGHTS
  const selected: DateRange | undefined = checkIn ? { from: parseISO(checkIn), to: checkOut ? parseISO(checkOut) : undefined } : undefined
  const nights = getStayNights(checkIn, checkOut)
  const conflict = Boolean(checkIn && checkOut && !isStayAvailable(checkIn, checkOut, unavailable))
  const invalid = (nights !== null && nights < minimumNights) || conflict

  return (
    <FieldGroup className="gap-2 sm:col-span-2">
      <input type="hidden" name="check_in" value={checkIn} />
      <input type="hidden" name="check_out" value={checkOut} />
      <div className="grid gap-5 sm:grid-cols-2">
        {(["check_in", "check_out"] as const).map(field => (
          <BookingDateField key={field} field={field} id={id} checkIn={checkIn} checkOut={checkOut} minimumStayOverride={minimumStayOverride} minimumNights={minimumNights} disabled={disabled} invalid={invalid} unavailable={unavailable} selected={selected} openField={openField} setOpenField={setOpenField} onChange={onChange} />
        ))}
      </div>
      <FieldDescription id={`${id}-description`} aria-live="polite">
        {stayDescription({ checkIn, checkOut, minimumNights, minimumStayOverride, unavailable })}
      </FieldDescription>
    </FieldGroup>
  )
}
