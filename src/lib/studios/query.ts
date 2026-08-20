import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  Amenity,
  Studio,
  StudioDetail,
  StudioDetailExperience,
  StudioGalleryImage,
  StudiosQueryOptions,
} from "@/lib/studios/types"

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
  is_published,
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

  if (filters.isPublished !== undefined) {
    query = query.eq("is_published", filters.isPublished)
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

type StudioAmenityRow = {
  id: number
  amenities: Amenity | Amenity[] | null
}

type StudioExperienceJoin = {
  id: number
  experiences:
    | Omit<StudioDetailExperience, "studio_experience_id">
    | Omit<StudioDetailExperience, "studio_experience_id">[]
    | null
}

function firstRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value
}

export async function fetchStudioDetailBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<{ detail: StudioDetail | null; error: unknown }> {
  const { data: studioData, error: studioError } = await supabase
    .from("studios")
    .select(studioSelect)
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (studioError || !studioData) {
    return { detail: null, error: studioError }
  }

  const studio = studioData as Studio
  const [galleryResult, amenitiesResult, experiencesResult] =
    await Promise.all([
      supabase
        .from("studio_gallery_images")
        .select("id, created_at, studio_id, image_public_id, sort_order, alt_text")
        .eq("studio_id", studio.id)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
      supabase
        .from("studio_amenities")
        .select(
          "id, amenities(id, created_at, label, icon_name, description)"
        )
        .eq("studio_id", studio.id)
        .order("id", { ascending: true }),
      supabase
        .from("studio_experiences")
        .select(
          "id, experiences(id, created_at, title, description, external_url, is_active, cover_image_public_id, thumbnail_image_public_id)"
        )
        .eq("studio_id", studio.id)
        .order("id", { ascending: true }),
    ])

  const amenities = ((amenitiesResult.data ?? []) as StudioAmenityRow[])
    .map((row) => {
      const amenity = firstRelation(row.amenities)

      return amenity
        ? {
            ...amenity,
            studio_amenity_id: row.id,
          }
        : null
    })
    .filter((amenity): amenity is StudioDetail["amenities"][number] =>
      Boolean(amenity)
    )

  const experiences = (
    (experiencesResult.data ?? []) as StudioExperienceJoin[]
  )
    .map((row) => {
      const experience = firstRelation(row.experiences)

      return experience?.is_active
        ? {
            ...experience,
            studio_experience_id: row.id,
          }
        : null
    })
    .filter(
      (experience): experience is StudioDetailExperience =>
        Boolean(experience)
    )

  return {
    detail: {
      studio,
      galleryImages: (galleryResult.data ?? []) as StudioGalleryImage[],
      amenities,
      experiences,
    },
    error:
      galleryResult.error ?? amenitiesResult.error ?? experiencesResult.error,
  }
}
