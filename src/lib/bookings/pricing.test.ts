import { describe, expect, it } from "vitest"
import { getBookingPrice } from "./pricing"

describe("booking pricing", () => {
  it("multiplies the selected studio rate by the number of nights", () => {
    expect(getBookingPrice("80.50", "2026-11-01", "2026-11-04")).toEqual({ nights: 3, nightlyRate: 80.5, total: 241.5 })
    expect(getBookingPrice(120, "2026-11-01", "2026-11-04")?.total).toBe(360)
    expect(getBookingPrice(120, "2026-11-01", "2026-11-03")?.total).toBe(240)
  })
  it("counts nights across months and daylight-saving transitions", () => {
    expect(getBookingPrice(100, "2026-03-28", "2026-03-30")?.nights).toBe(2)
    expect(getBookingPrice(100, "2028-02-28", "2028-03-01")?.nights).toBe(2)
  })
  it("rounds monetary amounts and allows a zero rate", () => {
    expect(getBookingPrice("99.99", "2026-11-01", "2026-11-04")?.total).toBe(299.97)
    expect(getBookingPrice(0, "2026-11-01", "2026-11-04")?.total).toBe(0)
  })
  it.each([["2026-11-02", "2026-11-03"], ["", "2026-11-03"], ["2026-02-30", "2026-03-04"], ["2026-11-03", "2026-11-03"], ["2026-11-04", "2026-11-03"]])("does not price invalid dates %s to %s", (arrival, departure) => expect(getBookingPrice(100, arrival, departure)).toBeNull())
  it("prices one night with an admin override but never zero nights", () => {
    expect(getBookingPrice(80.5, "2026-11-01", "2026-11-02", true)?.total).toBe(80.5)
    expect(getBookingPrice(80.5, "2026-11-01", "2026-11-01", true)).toBeNull()
    expect(getBookingPrice(80.5, "2026-11-01", "2026-11-02")).toBeNull()
  })
  it("rejects invalid rates", () => {
    expect(getBookingPrice(-1, "2026-11-01", "2026-11-04")).toBeNull()
    expect(getBookingPrice("invalid", "2026-11-01", "2026-11-04")).toBeNull()
  })
})
