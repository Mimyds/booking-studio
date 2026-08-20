export type Studio = {
  id: number
  created_at: string
  slug: string
  name: string
  description: string | null
  capacity: number
  base_price: number | string
  cleaning_fee: number | string
  currency: string
  city: string | null
  country_code: string | null
  pets_allowed: boolean
  is_published: boolean
  updated_at: string
  image_cover_public_id: string | null
  short_description: string | null
  welcome_title: string | null
}

export type StudioGalleryImage = {
  id: number
  created_at: string
  studio_id: number
  image_public_id: string
  sort_order: number
  alt_text: string | null
}

export type Amenity = {
  id: number
  created_at: string
  label: string
  icon_name: string | null
  description: string | null
}

export type StudioAmenity = {
  id: number
  created_at: string
  studio_id: number
  amenity_id: number
}

export type StudioDetailAmenity = Amenity & {
  studio_amenity_id: number
}

export type StudioDetailExperience = {
  id: number
  created_at: string
  title: string
  description: string | null
  external_url: string | null
  is_active: boolean
  cover_image_public_id: string | null
  thumbnail_image_public_id: string | null
  studio_experience_id: number
}

export type StudioDetail = {
  studio: Studio
  galleryImages: StudioGalleryImage[]
  amenities: StudioDetailAmenity[]
  experiences: StudioDetailExperience[]
}

export type StudioOrderBy =
  | "created_at"
  | "name"
  | "base_price"
  | "capacity"
  | "updated_at"

export type StudiosFilters = {
  id?: number
  ids?: number[]
  slug?: string
  city?: string
  countryCode?: string
  petsAllowed?: boolean
  isPublished?: boolean
  minCapacity?: number
  maxBasePrice?: number
  search?: string
}

export type StudiosQueryOptions = {
  filters?: StudiosFilters
  pagination?: {
    from: number
    to: number
  }
  orderBy?: StudioOrderBy
  ascending?: boolean
}
