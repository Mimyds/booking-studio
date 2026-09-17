export const MIN_BOOKING_NIGHTS = 2
const DAY_MS = 86_400_000

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value))
    && new Date(value).toISOString().slice(0, 10) === value
}

export function getStayNights(checkIn: string, checkOut: string) {
  if (!isDate(checkIn) || !isDate(checkOut)) return null
  return (Date.parse(checkOut) - Date.parse(checkIn)) / DAY_MS
}

export function getMinimumCheckout(checkIn: string, minimumStayOverride = false) {
  if (!isDate(checkIn)) return undefined
  return new Date(Date.parse(checkIn) + (minimumStayOverride ? 1 : MIN_BOOKING_NIGHTS) * DAY_MS).toISOString().slice(0, 10)
}
