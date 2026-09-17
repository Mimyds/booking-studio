import { getStayNights, MIN_BOOKING_NIGHTS } from "./stay"

export type BookingValues = {
  id: number
  version: number
  studio_id: number
  customer_id: number
  check_in: string
  check_out: string
  guests_count: number
  minimum_stay_override: boolean
  total_price: number
  source: string
  status: string
}
export type BookingOptions = {
  studios: { id: number; name: string; capacity: number; currency: string; base_price: number | string }[]
  customers: { id: number; first_name: string; last_name: string; email: string }[]
}

export function parseBookingForm(form: FormData, options: { allowMinimumStayOverride?: boolean } = {}) {
  const text = (key: string) => String(form.get(key) ?? "").trim()
  const overrideRequested = form.get("minimum_stay_override") === "on"
  if (overrideRequested && !options.allowMinimumStayOverride) return { error: "Seul un administrateur peut déroger au minimum de 2 nuits." }
  const positiveId = (key: string) => /^\d+$/.test(text(key)) && Number.isSafeInteger(Number(text(key))) && Number(text(key)) > 0
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
  if (!positiveId("studio_id")) return { error: "Choisissez un studio." }
  if (!validDate(text("check_in")) || !validDate(text("check_out")) || text("check_out") <= text("check_in")) return { error: "Indiquez des dates valides, avec un départ après l’arrivée." }
  if (!overrideRequested && (getStayNights(text("check_in"), text("check_out")) ?? 0) < MIN_BOOKING_NIGHTS) return { error: "Le séjour doit comprendre au moins 2 nuits." }
  if (!positiveId("guests_count")) return { error: "Indiquez un nombre entier de voyageurs supérieur à zéro." }
  if (!["pending", "confirmed"].includes(text("status")) || !["direct", "airbnb", "booking"].includes(text("source"))) return { error: "Choisissez un statut et un canal valides." }
  const payload: Record<string, string | number | boolean> = {
    minimum_stay_override: overrideRequested,
    studio_id: Number(text("studio_id")), check_in: text("check_in"), check_out: text("check_out"),
    guests_count: Number(text("guests_count")), status: text("status"), source: text("source"),
  }
  if (text("customer_id") !== "new") {
    if (!positiveId("customer_id")) return { error: "Choisissez un client." }
    payload.customer_id = Number(text("customer_id"))
  } else {
    if (!text("first_name") || !text("last_name") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text("email")) || !/^\+?\d{1,4}$/.test(text("phone_country_code")) || !/^[\d\s().-]{4,30}$/.test(text("phone_number"))) return { error: "Complétez le nom, le prénom, l’adresse e-mail et le téléphone du nouveau client." }
    for (const key of ["first_name", "last_name", "email", "phone_country_code", "phone_number"]) {
      if (text(key).length > 254) return { error: "Les coordonnées du client sont trop longues." }
      payload[key] = text(key)
    }
  }
  return { payload }
}
