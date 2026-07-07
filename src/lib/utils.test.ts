import { describe, expect, it } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("flex", false, null, undefined, "items-center")).toBe(
      "flex items-center"
    )
  })

  it("merges conflicting Tailwind classes", () => {
    expect(cn("px-2 py-2", "px-4")).toBe("py-2 px-4")
  })
})
