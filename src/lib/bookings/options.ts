import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { BookingOptions } from "./form"

export async function getBookingOptions(): Promise<BookingOptions> {
  const supabase = await createServerSupabaseClient()
  // Read every page so customers and studios beyond the API row limit stay selectable.
  async function load(table: "studios" | "customers", columns: string) {
    const rows: Record<string, unknown>[] = []
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase.from(table).select(columns).order("id").range(offset, offset + 499)
      if (error) throw new Error("Impossible de charger les studios et les clients.")
      rows.push(...(data as unknown as Record<string, unknown>[]))
      if (data.length < 500) break
    }
    return rows
  }
  const [studios, customers] = await Promise.all([
    load("studios", "id, name, capacity, currency, base_price"),
    load("customers", "id, first_name, last_name, email"),
  ])
  return { studios, customers } as unknown as BookingOptions
}
