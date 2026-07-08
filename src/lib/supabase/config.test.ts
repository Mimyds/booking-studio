import { afterEach, describe, expect, it } from "vitest"
import { getSupabaseConfig } from "@/lib/supabase/config"

const originalEnv = process.env

describe("getSupabaseConfig", () => {
  afterEach(() => {
    process.env = originalEnv
  })

  it("returns the public Supabase config", () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    }

    expect(getSupabaseConfig()).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseKey: "publishable-key",
    })
  })

  it("reports the exact missing variables", () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    }

    expect(() => getSupabaseConfig()).toThrow(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    )
  })
})
