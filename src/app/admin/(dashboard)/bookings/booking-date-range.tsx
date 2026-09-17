"use client"

import { useId, useState } from "react"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getMinimumCheckout, getStayNights, MIN_BOOKING_NIGHTS } from "@/lib/bookings/stay"
import { isStayAvailable, isUnavailableDay, latestCheckoutBeforeBlock, type UnavailableRange } from "@/lib/bookings/availability"

type BookingDateRangeProps = {
  checkIn: string
  checkOut: string
  minimumStayOverride: boolean
  disabled: boolean
  unavailable: UnavailableRange[]
  onChange: (checkIn: string, checkOut: string) => void
}

type DateField = "check_in" | "check_out"

export function BookingDateRange({ checkIn, checkOut, minimumStayOverride, disabled, unavailable, onChange }: BookingDateRangeProps) {
  const id = useId()
  const [openField, setOpenField] = useState<DateField | null>(null)
  const minimumNights = minimumStayOverride ? 1 : MIN_BOOKING_NIGHTS
  const selected: DateRange | undefined = checkIn ? {
    from: parseISO(checkIn),
    to: checkOut ? parseISO(checkOut) : undefined,
  } : undefined
  const nights = getStayNights(checkIn, checkOut)
  const conflict = Boolean(checkIn && checkOut && !isStayAvailable(checkIn, checkOut, unavailable))
  const invalid = (nights !== null && nights < minimumNights) || conflict
  const earliestCheckout = getMinimumCheckout(checkIn, minimumStayOverride)
  const noValidDeparture = Boolean(checkIn && !checkOut && earliestCheckout && !isStayAvailable(checkIn, earliestCheckout, unavailable))

  function selectDate(field: DateField, date: Date) {
    const value = format(date, "yyyy-MM-dd")
    if (field === "check_in") {
      if (isUnavailableDay(value, unavailable)) return
      const validCheckout = checkOut && (getStayNights(value, checkOut) ?? 0) >= minimumNights && isStayAvailable(value, checkOut, unavailable)
      onChange(value, validCheckout ? checkOut : "")
    } else if (checkIn && (getStayNights(checkIn, value) ?? 0) >= minimumNights && isStayAvailable(checkIn, value, unavailable)) {
      onChange(checkIn, value)
    } else return
    setOpenField(null)
  }

  function dateField(field: DateField) {
    const arrival = field === "check_in"
    const value = arrival ? checkIn : checkOut
    const minimumCheckout = getMinimumCheckout(checkIn, minimumStayOverride)
    const nextBlock = checkIn ? latestCheckoutBeforeBlock(checkIn, unavailable) : undefined
    const blockedDate = (date: Date) => {
      const day = format(date, "yyyy-MM-dd")
      if (!arrival) return Boolean(minimumCheckout && day < minimumCheckout) || Boolean(nextBlock && day > nextBlock) || !isStayAvailable(checkIn, day, unavailable)
      return isUnavailableDay(day, unavailable)
    }
    const label = arrival ? "Arrivée" : "Départ"
    return (
      <Field key={field} data-invalid={invalid} data-disabled={disabled || (!arrival && !checkIn)}>
        <FieldLabel htmlFor={`${id}-${field}`}>{label}</FieldLabel>
        <Popover open={openField === field && !disabled} onOpenChange={open => setOpenField(open ? field : null)}>
          <PopoverTrigger asChild>
            <Button id={`${id}-${field}`} type="button" variant="outline" className="w-full justify-start" disabled={disabled || (!arrival && !checkIn)} aria-invalid={invalid} aria-describedby={`${id}-description`}>
              <CalendarDays data-icon="inline-start" />
              {value ? format(parseISO(value), "d MMM yyyy", { locale: fr }) : `Choisir ${arrival ? "l’arrivée" : "le départ"}`}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] p-0" aria-label={`Choisir la date de ${arrival ? "l’arrivée" : "départ"}`}>
            <div className="max-h-[70vh] overflow-y-auto">
              <Calendar
                mode="range"
                locale={fr}
                weekStartsOn={1}
                selected={selected}
                defaultMonth={value ? parseISO(value) : selected?.from}
                onDayClick={date => selectDate(field, date)}
                numberOfMonths={2}
                disabled={disabled || blockedDate}
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t p-3">
              <span className="text-xs text-muted-foreground">{arrival ? "Dates grisées : nuits occupées" : `${minimumNights} nuit${minimumNights > 1 ? "s" : ""} minimum`}</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => { onChange(arrival ? "" : checkIn, ""); setOpenField(null) }}>Effacer</Button>
            </div>
          </PopoverContent>
        </Popover>
      </Field>
    )
  }

  return (
    <FieldGroup className="gap-2 sm:col-span-2">
      <input type="hidden" name="check_in" value={checkIn} />
      <input type="hidden" name="check_out" value={checkOut} />
      <div className="grid gap-5 sm:grid-cols-2">
        {dateField("check_in")}
        {dateField("check_out")}
      </div>
      <FieldDescription id={`${id}-description`} aria-live="polite">
        {conflict ? "Les dates sélectionnées ne sont plus disponibles. Choisissez un autre séjour."
          : invalid ? `Choisissez un séjour d’au moins ${minimumNights} nuit${minimumNights > 1 ? "s" : ""}.`
          : noValidDeparture ? `Cette arrivée ne permet pas un séjour de ${minimumNights} nuit${minimumNights > 1 ? "s" : ""} avant les dates occupées. Choisissez une arrivée plus tôt${minimumStayOverride ? "." : " ou activez la dérogation pour une nuit."}`
          : nights !== null ? `${nights} nuit${nights > 1 ? "s" : ""}`
            : checkIn ? "Sélectionnez maintenant la date de départ."
              : "Sélectionnez la date d’arrivée, puis la date de départ."}
      </FieldDescription>
    </FieldGroup>
  )
}
