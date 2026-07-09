import type { SupabaseClient } from "@supabase/supabase-js"
import type { Studio, StudiosQueryOptions } from "@/lib/studios/types"

export const studioSelect = `
  id,
  created_at,
  slug,
  name,
  description,
  capacity,
  base_price,
  cleaning_fee,
  currency,
  city,
  country_code,
  pets_allowed,
  updated_at,
  image_cover_public_id,
  short_description,
  welcome_title
`

function normalizeSearch(value: string) {
  return value.trim().replaceAll(",", " ")
}

export async function fetchStudios(
  supabase: SupabaseClient,
  options: StudiosQueryOptions = {}
) {
  const filters = options.filters ?? {}
  const orderBy = options.orderBy ?? "name"
  const ascending = options.ascending ?? true

  let query = supabase
    .from("studios")
    .select(studioSelect)
    .order(orderBy, { ascending })

  if (filters.id !== undefined) {
    query = query.eq("id", filters.id)
  }

  if (filters.ids?.length) {
    query = query.in("id", filters.ids)
  }

  if (filters.slug) {
    query = query.eq("slug", filters.slug)
  }

  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`)
  }

  if (filters.countryCode) {
    query = query.eq("country_code", filters.countryCode)
  }

  if (filters.petsAllowed !== undefined) {
    query = query.eq("pets_allowed", filters.petsAllowed)
  }

  if (filters.minCapacity !== undefined) {
    query = query.gte("capacity", filters.minCapacity)
  }

  if (filters.maxBasePrice !== undefined) {
    query = query.lte("base_price", filters.maxBasePrice)
  }

  if (filters.search?.trim()) {
    const search = normalizeSearch(filters.search)
    query = query.or(
      `name.ilike.%${search}%,slug.ilike.%${search}%,city.ilike.%${search}%`
    )
  }

  if (options.pagination) {
    query = query.range(options.pagination.from, options.pagination.to)
  }

  const { data, error } = await query

  return {
    studios: (data ?? []) as Studio[],
    error,
  }
}
