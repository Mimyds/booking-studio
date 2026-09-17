"use client"

import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { isStayAvailable, isUnavailableDay, latestCheckoutBeforeBlock, type UnavailableRange } from "@/lib/bookings/availability"
import { getMinimumCheckout, getStayNights } from "@/lib/bookings/stay"

export type DateField = "check_in" | "check_out"

type Props = {
  field: DateField
  id: string
  checkIn: string
  checkOut: string
  minimumStayOverride: boolean
  minimumNights: number
  disabled: boolean
  invalid: boolean
  unavailable: UnavailableRange[]
  selected?: DateRange
  openField: DateField | null
  setOpenField: (field: DateField | null) => void
  onChange: (checkIn: string, checkOut: string) => void
}

export function BookingDateField({ field, id, checkIn, checkOut, minimumStayOverride, minimumNights, disabled, invalid, unavailable, selected, openField, setOpenField, onChange }: Props) {
  const arrival = field === "check_in"
  const value = arrival ? checkIn : checkOut
  const minimumCheckout = getMinimumCheckout(checkIn, minimumStayOverride)
  const nextBlock = checkIn ? latestCheckoutBeforeBlock(checkIn, unavailable) : undefined

  function blockedDate(date: Date) {
    const day = format(date, "yyyy-MM-dd")
    if (arrival) return isUnavailableDay(day, unavailable)
    return Boolean(minimumCheckout && day < minimumCheckout) || Boolean(nextBlock && day > nextBlock) || !isStayAvailable(checkIn, day, unavailable)
  }

  function selectDate(date: Date) {
    const day = format(date, "yyyy-MM-dd")
    if (blockedDate(date)) return
    if (arrival) {
      const validCheckout = checkOut && (getStayNights(day, checkOut) ?? 0) >= minimumNights && isStayAvailable(day, checkOut, unavailable)
      onChange(day, validCheckout ? checkOut : "")
    } else {
      onChange(checkIn, day)
    }
    setOpenField(null)
  }

  return (
    <Field data-invalid={invalid} data-disabled={disabled || (!arrival && !checkIn)}>
      <FieldLabel htmlFor={`${id}-${field}`}>{arrival ? "Arrivée" : "Départ"}</FieldLabel>
      <Popover open={openField === field && !disabled} onOpenChange={open => setOpenField(open ? field : null)}>
        <PopoverTrigger asChild>
          <Button id={`${id}-${field}`} type="button" variant="outline" className="w-full justify-start" disabled={disabled || (!arrival && !checkIn)} aria-invalid={invalid} aria-describedby={`${id}-description`}>
            <CalendarDays data-icon="inline-start" />
            {value ? format(parseISO(value), "d MMM yyyy", { locale: fr }) : `Choisir ${arrival ? "l’arrivée" : "le départ"}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] p-0" aria-label={`Choisir la date de ${arrival ? "l’arrivée" : "départ"}`}>
          <div className="max-h-[70vh] overflow-y-auto">
            <Calendar mode="range" locale={fr} weekStartsOn={1} selected={selected} defaultMonth={value ? parseISO(value) : selected?.from} onDayClick={selectDate} numberOfMonths={2} disabled={disabled || blockedDate} autoFocus />
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
