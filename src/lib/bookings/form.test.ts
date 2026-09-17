import { describe, expect, it } from "vitest"
import { parseBookingForm } from "./form"
function form(overrides: Record<string, string | undefined> = {}) {
  const data = new FormData()
  Object.entries({ studio_id: "1", customer_id: "2", check_in: "2026-10-01", check_out: "2026-10-03", guests_count: "2", source: "direct", status: "confirmed", ...overrides }).forEach(([key, value]) => data.set(key, value ?? ""))
  return data
}
describe("admin booking validation", () => {
  it("accepts an existing customer without a client-supplied total", () => expect(parseBookingForm(form()).payload).toMatchObject({ customer_id: 2 }))
  it.each([{ check_out: "2026-10-01" }, { check_in: "2026-02-30" }, { guests_count: "1.5" }, { status: "cancelled" }, { source: "unknown" }, { customer_id: "" }])("rejects invalid input %j", overrides => expect(parseBookingForm(form(overrides)).error).toBeTruthy())
  it("rejects a one-night stay", () => expect(parseBookingForm(form({ check_out: "2026-10-02" })).error).toBe("Le séjour doit comprendre au moins 2 nuits."))
  it("rejects a forged override without admin authorization", () => {
    expect(parseBookingForm(form({ check_out: "2026-10-02", minimum_stay_override: "on" })).error).toContain("Seul un administrateur")
  })
  it("allows one night only with an explicitly authorized override", () => {
    expect(parseBookingForm(form({ check_out: "2026-10-02", minimum_stay_override: "on" }), { allowMinimumStayOverride: true }).payload).toMatchObject({ minimum_stay_override: true })
    expect(parseBookingForm(form({ check_out: "2026-10-02" }), { allowMinimumStayOverride: true }).error).toContain("2 nuits")
    expect(parseBookingForm(form({ check_out: "2026-10-01", minimum_stay_override: "on" }), { allowMinimumStayOverride: true }).error).toBeTruthy()
  })
  it("ignores a tampered total", () => expect(parseBookingForm(form({ total_price: "0.01" })).payload).not.toHaveProperty("total_price"))
  it("accepts a new customer", () => expect(parseBookingForm(form({ customer_id: "new", first_name: "Marie", last_name: "Test", email: "marie@example.com", phone_country_code: "+596", phone_number: "696123456" })).payload).toMatchObject({ first_name: "Marie", email: "marie@example.com" }))
  it("requires contact details for a new customer", () => expect(parseBookingForm(form({ customer_id: "new" })).error).toBeTruthy())
})
