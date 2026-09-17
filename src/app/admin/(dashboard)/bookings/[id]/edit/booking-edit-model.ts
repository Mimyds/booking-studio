import type { BookingValues } from "@/lib/bookings/form"

export type EditedBooking = BookingValues & {
  customers: { first_name: string; last_name: string; email: string } | null
  studios: { name: string; currency: string } | null
}

export type BookingEvent = {
  id: number
  created_at: string
  actor_email: string | null
  action: string
  reason: string | null
  previous_data: Record<string, unknown> | null
  current_data: Record<string, unknown> | null
}

export const actions: Record<string, string> = {
  create: "Réservation créée", update: "Réservation modifiée", cancel: "Réservation annulée",
}
