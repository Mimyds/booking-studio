import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  Experience,
  ExperiencesQueryOptions,
} from "@/lib/experiences/types"

export const experienceSelect = `
  id,
  created_at,
  title,
  description,
  external_url,
  is_active,
  cover_image_public_id,
  thumbnail_image_public_id
`

function normalizeSearch(value: string) {
  return value.trim().replaceAll(",", " ")
}

export async function fetchExperiences(
  supabase: SupabaseClient,
  options: ExperiencesQueryOptions = {}
) {
  const filters = options.filters ?? {}
  const orderBy = options.orderBy ?? "title"
  const ascending = options.ascending ?? true

  let query = supabase
    .from("experiences")
    .select(experienceSelect)
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

  if (filters.search?.trim()) {
    const search = normalizeSearch(filters.search)

    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,external_url.ilike.%${search}%`
    )
  }

  if (options.pagination) {
    query = query.range(options.pagination.from, options.pagination.to)
  }

  const { data, error } = await query

  return {
    experiences: (data ?? []) as Experience[],
    error,
  }
}
