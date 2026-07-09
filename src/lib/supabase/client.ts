"use client"

import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseBrowserConfig } from "@/lib/supabase/config"

export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseBrowserConfig()

  return createBrowserClient(supabaseUrl, supabaseKey)
}
