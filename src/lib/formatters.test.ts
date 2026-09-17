import { describe, expect, it } from "vitest"
import { formatCurrency, formatDate, formatNumber } from "./formatters"

describe("French formatters", () => {
  it("keeps currency, rounding and number formats independent", () => {
    expect(formatCurrency(12.5, "EUR")).toContain("12,50")
    expect(formatCurrency(12.5, "EUR", 0)).toContain("13")
    expect(formatCurrency(12.5, "USD")).toContain("$US")
    expect(formatNumber(1234)).toMatch(/1.234/)
  })

  it("uses the requested timezone for booking history", () => {
    const date = "2026-09-17T02:00:00.000Z"
    expect(formatDate(date, { day: "numeric", month: "long", timeZone: "UTC" })).toContain("17")
    expect(formatDate(date, { day: "numeric", month: "long", timeZone: "America/Martinique" })).toContain("16")
  })
})
