import type { SupabaseClient } from "@supabase/supabase-js"
import type { Addon, AddonsQueryOptions } from "@/lib/addons/types"

export const addonSelect = `
  id,
  created_at,
  name,
  description,
  price,
  is_active,
  cloudinary_url,
  cloudinary_public_id
`

function normalizeSearch(value: string) {
  return value.trim().replaceAll(",", " ")
}

export async function fetchAddons(
  supabase: SupabaseClient,
  options: AddonsQueryOptions = {}
) {
  const filters = options.filters ?? {}
  const orderBy = options.orderBy ?? "name"
  const ascending = options.ascending ?? true

  let query = supabase
    .from("addons")
    .select(addonSelect)
    .order(orderBy, { ascending })

  if (filters.id !== undefined) {
    query = query.eq("id", filters.id)
  }

  if (filters.ids?.length) {
    query = query.in("id", filters.ids)
  }

  if (filters.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive)
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice)
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice)
  }

  if (filters.search?.trim()) {
    const search = normalizeSearch(filters.search)
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (options.pagination) {
    query = query.range(options.pagination.from, options.pagination.to)
  }

  const { data, error } = await query

  return {
    addons: (data ?? []) as Addon[],
    error,
  }
}
