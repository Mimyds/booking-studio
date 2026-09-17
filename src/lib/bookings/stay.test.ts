import { expect, it } from "vitest"
import { getMinimumCheckout, getStayNights } from "./stay"

it("sets the earliest departure two calendar days after arrival", () => {
  expect(getMinimumCheckout("2026-10-01")).toBe("2026-10-03")
  expect(getMinimumCheckout("2026-12-31")).toBe("2027-01-02")
  expect(getMinimumCheckout("2028-02-28")).toBe("2028-03-01")
  expect(getMinimumCheckout("")).toBeUndefined()
})
it("counts nights independently of daylight saving", () => {
  expect(getStayNights("2026-03-28", "2026-03-30")).toBe(2)
  expect(getStayNights("2026-02-30", "2026-03-04")).toBeNull()
})

it("relaxes the departure date only when explicitly requested", () => {
  expect(getMinimumCheckout("2026-10-01", true)).toBe("2026-10-02")
  expect(getMinimumCheckout("2026-10-01")).toBe("2026-10-03")
})
