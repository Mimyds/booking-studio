import { describe, expect, it } from "vitest"
import {
  parseStudioForm,
  slugifyStudioName,
} from "@/lib/studios/form"

describe("slugifyStudioName", () => {
  it("creates a URL-safe slug from a studio name", () => {
    expect(slugifyStudioName("  Studio Créole & Mer  ")).toBe(
      "studio-creole-mer"
    )
  })
})

describe("parseStudioForm", () => {
  it("parses a valid studio form", () => {
    const formData = new FormData()
    formData.set("name", "Studio Créole")
    formData.set("slug", "studio-creole")
    formData.set("capacity", "2")
    formData.set("base_price", "125.50")
    formData.set("cleaning_fee", "30")
    formData.set("currency", "eur")
    formData.set("country_code", "mq")
    formData.set("pets_allowed", "on")

    const result = parseStudioForm(formData)

    expect(result.errors).toEqual({})
    expect(result.payload).toMatchObject({
      name: "Studio Créole",
      slug: "studio-creole",
      capacity: 2,
      base_price: 125.5,
      cleaning_fee: 30,
      currency: "EUR",
      country_code: "MQ",
      pets_allowed: true,
    })
  })

  it("returns errors for invalid required values", () => {
    const result = parseStudioForm(new FormData())

    expect(result.errors).toMatchObject({
      name: expect.any(String),
      slug: expect.any(String),
      capacity: expect.any(String),
      base_price: expect.any(String),
      cleaning_fee: expect.any(String),
      currency: expect.any(String),
    })
  })
})
