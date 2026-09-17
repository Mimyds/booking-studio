import { format } from "date-fns"
import { isStayAvailable, isUnavailableDay, latestCheckoutBeforeBlock, type UnavailableRange } from "./availability"
import { getMinimumCheckout, getStayNights } from "./stay"

export type BookingDateFieldName = "check_in" | "check_out"

type SelectionOptions = {
  field: BookingDateFieldName
  checkIn: string
  checkOut: string
  minimumStayOverride: boolean
  minimumNights: number
  unavailable: UnavailableRange[]
}

export function isBookingDateDisabled(date: Date, options: SelectionOptions) {
  const day = format(date, "yyyy-MM-dd")
  if (options.field === "check_in") return isUnavailableDay(day, options.unavailable)
  const minimumCheckout = getMinimumCheckout(options.checkIn, options.minimumStayOverride)
  const nextBlock = options.checkIn ? latestCheckoutBeforeBlock(options.checkIn, options.unavailable) : undefined
  return Boolean(minimumCheckout && day < minimumCheckout) || Boolean(nextBlock && day > nextBlock) || !isStayAvailable(options.checkIn, day, options.unavailable)
}

export function selectBookingDate(date: Date, options: SelectionOptions) {
  if (isBookingDateDisabled(date, options)) return null
  const day = format(date, "yyyy-MM-dd")
  if (options.field === "check_out") return { checkIn: options.checkIn, checkOut: day }
  const validCheckout = options.checkOut && (getStayNights(day, options.checkOut) ?? 0) >= options.minimumNights && isStayAvailable(day, options.checkOut, options.unavailable)
  return { checkIn: day, checkOut: validCheckout ? options.checkOut : "" }
}
