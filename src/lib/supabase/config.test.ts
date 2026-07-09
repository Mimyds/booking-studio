import { afterEach, describe, expect, it } from "vitest"
import {
  getSupabaseBrowserConfig,
  getSupabaseServerConfig,
} from "@/lib/supabase/config"

const originalEnv = process.env

describe("Supabase config", () => {
  afterEach(() => {
    process.env = originalEnv
  })

  it("returns the browser public Supabase config", () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    }

    expect(getSupabaseBrowserConfig()).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseKey: "publishable-key",
    })
  })

  it("supports the anon key alias for browser config", () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    }

    expect(getSupabaseBrowserConfig()).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseKey: "anon-key",
    })
  })

  it("supports server-only Supabase variable names", () => {
    process.env = {
      ...originalEnv,
      SUPABASE_URL: "https://server.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "server-publishable-key",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    }

    expect(getSupabaseServerConfig()).toEqual({
      supabaseUrl: "https://server.supabase.co",
      supabaseKey: "server-publishable-key",
    })
  })

  it("reports missing browser variables explicitly", () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    }

    expect(() => getSupabaseBrowserConfig()).toThrow(
      "Missing Supabase environment variables for browser URL: NEXT_PUBLIC_SUPABASE_URL"
    )
  })
})
