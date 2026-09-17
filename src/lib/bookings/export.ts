export type ExportBooking = {
  id: number
  created_at: string
  source: string
  status: string
  check_in: string
  check_out: string
  guests_count: number
  total_price: number | string
  minimum_stay_override: boolean
  customers: {
    first_name: string
    last_name: string
    email: string
    phone_country_code: string
    phone_number: string
  } | null
  studios: { name: string; currency: string } | null
}

const headings = [
  "Référence", "Créée le", "Client", "E-mail", "Téléphone", "Studio",
  "Arrivée", "Départ", "Nuits", "Voyageurs", "Canal", "Statut",
  "Montant total", "Devise", "Dérogation 2 nuits",
]

function cell(value: string | number | null | undefined) {
  let content = String(value ?? "")
  // Spreadsheet programs can execute formulas embedded in downloaded CSVs.
  if (/^\s*[=+\-@]/u.test(content) || /^[\t\r\n]/u.test(content)) {
    content = `'${content}`
  }
  return `"${content.replaceAll('"', '""')}"`
}

function row(values: Array<string | number | null | undefined>) {
  return `${values.map(cell).join(";")}\r\n`
}

export function bookingsCsv(bookings: ExportBooking[]) {
  const rows = bookings.map((booking) => {
    const customer = booking.customers
    const studio = booking.studios
    const nights = Math.round(
      (Date.parse(booking.check_out) - Date.parse(booking.check_in)) / 86_400_000
    )
    return row([
      booking.id,
      booking.created_at,
      customer ? `${customer.first_name} ${customer.last_name}`.trim() : "",
      customer?.email,
      customer ? `${customer.phone_country_code} ${customer.phone_number}`.trim() : "",
      studio?.name,
      booking.check_in,
      booking.check_out,
      nights,
      booking.guests_count,
      ({ direct: "Direct", airbnb: "Airbnb", booking: "Booking.com" } as Record<string, string>)[booking.source] ?? booking.source,
      ({ pending: "En attente", confirmed: "Confirmée", cancelled: "Annulée" } as Record<string, string>)[booking.status] ?? booking.status,
      String(booking.total_price).replace(".", ","),
      studio?.currency ?? "EUR",
      booking.minimum_stay_override ? "Oui" : "Non",
    ])
  })
  return `\uFEFF${row(headings)}${rows.join("")}`
}
