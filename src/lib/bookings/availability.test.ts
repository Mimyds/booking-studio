import { describe, expect, it } from "vitest"
import { isStayAvailable, isUnavailableDay, latestCheckoutBeforeBlock } from "./availability"

const ranges = [
  { from: "2026-10-10", to: "2026-10-13" },
  { from: "2026-10-20", to: "2026-10-22" },
]

describe("booking calendar availability", () => {
  it("blocks occupied nights while allowing checkout on a new arrival", () => {
    expect(isUnavailableDay("2026-10-10", ranges)).toBe(true)
    expect(isUnavailableDay("2026-10-12", ranges)).toBe(true)
    expect(isUnavailableDay("2026-10-13", ranges)).toBe(false)
    expect(isStayAvailable("2026-10-08", "2026-10-10", ranges)).toBe(true)
    expect(isStayAvailable("2026-10-08", "2026-10-11", ranges)).toBe(false)
    expect(isStayAvailable("2026-10-13", "2026-10-20", ranges)).toBe(true)
  })

  it("limits checkout to the next blocked arrival", () => {
    expect(latestCheckoutBeforeBlock("2026-10-14", ranges)).toBe("2026-10-20")
    expect(latestCheckoutBeforeBlock("2026-10-23", ranges)).toBeUndefined()
  })
})
