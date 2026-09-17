"use client"

import { useActionState, useState } from "react"
import type { BookingOptions, BookingValues } from "@/lib/bookings/form"
import { getBookingPrice } from "@/lib/bookings/pricing"
import { isStayAvailable } from "@/lib/bookings/availability"
import { saveBookingAction } from "./actions"
import { useBookingAvailability } from "./use-booking-availability"

export function useBookingForm(options: BookingOptions, booking?: BookingValues) {
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
  function setValue(name: string, value: string) {
    setValues(previous => ({ ...previous, [name]: value }))
  }
  function setDates(check_in: string, check_out: string) {
    setValues(previous => ({ ...previous, check_in, check_out }))
  }
  const studio = options.studios.find(item => String(item.id) === studioId)
  const availability = useBookingAvailability(studioId, booking?.id)
  const dateConflict = Boolean(availability.ready && values.check_in && values.check_out && !isStayAvailable(values.check_in, values.check_out, availability.unavailable))
  const price = studio ? getBookingPrice(studio.base_price, values.check_in, values.check_out, minimumStayOverride) : null

  return { state, action, pending, minimumStayOverride, setMinimumStayOverride, customer, setCustomer,
    studioId, setStudioId, values, setValue, setDates, availability, dateConflict, price }
}
