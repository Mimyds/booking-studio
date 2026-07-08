"use client"

import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseConfig } from "@/lib/supabase/config"

export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig()

  return createBrowserClient(supabaseUrl, supabaseKey)
}
