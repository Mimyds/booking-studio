export const bookingStatuses = {
  pending: { label: "En attente", className: "bg-amber-50 text-amber-800" },
  confirmed: { label: "Confirmée", className: "bg-emerald-50 text-emerald-800" },
  cancelled: { label: "Annulée", className: "bg-rose-50 text-rose-800" },
}
export const bookingSources = { direct: "Direct", airbnb: "Airbnb", booking: "Booking.com" }

export type BookingListItem = {
  id: number
  created_at: string
  customer_id: number
  studio_id: number
  source: keyof typeof bookingSources
  status: keyof typeof bookingStatuses
  check_in: string
  check_out: string
  guests_count: number
  total_price: number | string
  customers: { first_name: string; last_name: string; email: string } | null
  studios: { name: string; currency: string } | null
}
