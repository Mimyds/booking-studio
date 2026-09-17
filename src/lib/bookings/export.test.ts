import { describe, expect, it } from "vitest"
import { bookingsCsv, type ExportBooking } from "./export"

const booking: ExportBooking = {
  id: 42,
  created_at: "2026-09-17T10:00:00Z",
  source: "direct",
  status: "confirmed",
  check_in: "2026-10-01",
  check_out: "2026-10-03",
  guests_count: 2,
  total_price: "241.50",
  minimum_stay_override: false,
  customers: { first_name: "Anne", last_name: 'De "Test"', email: "anne@example.com", phone_country_code: "+596", phone_number: "696000000" },
  studios: { name: "Studio; Jardin", currency: "EUR" },
}

describe("bookings CSV", () => {
  it("exports customer and stay details with French spreadsheet formatting", () => {
    const csv = bookingsCsv([booking])
    expect(csv.startsWith("\uFEFF")).toBe(true)
    expect(csv).toContain('"Anne De ""Test"""')
    expect(csv).toContain('"Studio; Jardin"')
    expect(csv).toContain('"2";"2";"Direct";"Confirmée";"241,50";"EUR";"Non"')
    expect(csv).toContain("\r\n")
  })

  it("neutralizes spreadsheet formulas from database text", () => {
    const csv = bookingsCsv([{ ...booking, customers: { ...booking.customers!, first_name: "=HYPERLINK(\"https://example.test\")", last_name: "Test" } }])
    expect(csv).toContain(`"'=HYPERLINK(""https://example.test"") Test"`)
  })

  it("includes headings even when there are no reservations", () => {
    expect(bookingsCsv([])).toContain("Référence")
  })
})
