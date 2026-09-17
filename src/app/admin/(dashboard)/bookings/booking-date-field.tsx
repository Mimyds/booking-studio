"use client"

import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { UnavailableRange } from "@/lib/bookings/availability"
import { isBookingDateDisabled, selectBookingDate, type BookingDateFieldName } from "@/lib/bookings/date-selection"

export type DateField = BookingDateFieldName

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

const fieldLabels = {
  check_in: { title: "Arrivée", prompt: "Choisir l’arrivée", aria: "Choisir la date de l’arrivée" },
  check_out: { title: "Départ", prompt: "Choisir le départ", aria: "Choisir la date de départ" },
}

function DateFieldFooter({ arrival, minimumNights, onClear }: { arrival: boolean; minimumNights: number; onClear: () => void }) {
  const hint = arrival ? "Dates grisées : nuits occupées" : `${minimumNights} nuit${minimumNights > 1 ? "s" : ""} minimum`
  return <div className="flex items-center justify-between gap-3 border-t p-3">
    <span className="text-xs text-muted-foreground">{hint}</span>
    <Button type="button" size="sm" variant="ghost" onClick={onClear}>Effacer</Button>
  </div>
}

export function BookingDateField({ field, id, checkIn, checkOut, minimumStayOverride, minimumNights, disabled, invalid, unavailable, selected, openField, setOpenField, onChange }: Props) {
  const arrival = field === "check_in"
  const value = arrival ? checkIn : checkOut
  const labels = fieldLabels[field]
  const fieldDisabled = disabled || (!arrival && !checkIn)
  const selectionOptions = { field, checkIn, checkOut, minimumStayOverride, minimumNights, unavailable }

  function blockedDate(date: Date) {
    return isBookingDateDisabled(date, selectionOptions)
  }

  function selectDate(date: Date) {
    const selection = selectBookingDate(date, selectionOptions)
    if (!selection) return
    onChange(selection.checkIn, selection.checkOut)
    setOpenField(null)
  }

  function clearDate() {
    onChange(arrival ? "" : checkIn, "")
    setOpenField(null)
  }

  return (
    <Field data-invalid={invalid} data-disabled={fieldDisabled}>
      <FieldLabel htmlFor={`${id}-${field}`}>{labels.title}</FieldLabel>
      <Popover open={openField === field && !disabled} onOpenChange={open => setOpenField(open ? field : null)}>
        <PopoverTrigger asChild>
          <Button id={`${id}-${field}`} type="button" variant="outline" className="w-full justify-start" disabled={fieldDisabled} aria-invalid={invalid} aria-describedby={`${id}-description`}>
            <CalendarDays data-icon="inline-start" />
            {value ? format(parseISO(value), "d MMM yyyy", { locale: fr }) : labels.prompt}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] p-0" aria-label={labels.aria}>
          <div className="max-h-[70vh] overflow-y-auto">
            <Calendar mode="range" locale={fr} weekStartsOn={1} selected={selected} defaultMonth={value ? parseISO(value) : selected?.from} onDayClick={selectDate} numberOfMonths={2} disabled={disabled || blockedDate} autoFocus />
          </div>
          <DateFieldFooter arrival={arrival} minimumNights={minimumNights} onClear={clearDate} />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
