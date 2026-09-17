import { getStayNights, MIN_BOOKING_NIGHTS } from "./stay"

export function getBookingPrice(basePrice: number | string, checkIn: string, checkOut: string, minimumStayOverride = false) {
  const nights = getStayNights(checkIn, checkOut)
  const nightlyRate = Number(basePrice)
  if (nights === null || nights < (minimumStayOverride ? 1 : MIN_BOOKING_NIGHTS) || !Number.isFinite(nightlyRate) || nightlyRate < 0) return null
  const total = Math.round((nightlyRate * nights + Number.EPSILON) * 100) / 100
  return { nights, nightlyRate, total }
}
