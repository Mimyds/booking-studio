import { describe, expect, it } from "vitest"
import { isBookingDateDisabled, selectBookingDate } from "./date-selection"

const unavailable = [{ from: "2026-09-17", to: "2026-09-24" }]
const date = (day: number) => new Date(2026, 8, day)

describe("admin booking date selection", () => {
  it("leaves a free arrival day selectable even when a two-night stay is impossible", () => {
    const options = { field: "check_in" as const, checkIn: "", checkOut: "", minimumStayOverride: false, minimumNights: 2, unavailable }
    expect(isBookingDateDisabled(date(16), options)).toBe(false)
    expect(isBookingDateDisabled(date(17), options)).toBe(true)
    expect(selectBookingDate(date(16), options)).toEqual({ checkIn: "2026-09-16", checkOut: "" })
  })

  it("allows departure before an occupied night and rejects a stay through it", () => {
    const options = { field: "check_out" as const, checkIn: "2026-09-13", checkOut: "", minimumStayOverride: false, minimumNights: 2, unavailable }
    expect(selectBookingDate(date(16), options)).toEqual({ checkIn: "2026-09-13", checkOut: "2026-09-16" })
    expect(selectBookingDate(date(17), options)).toEqual({ checkIn: "2026-09-13", checkOut: "2026-09-17" })
    expect(selectBookingDate(date(18), options)).toBeNull()
  })
})
