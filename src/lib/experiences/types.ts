export type Experience = {
  id: number
  created_at: string
  title: string
  description: string | null
  external_url: string | null
  is_active: boolean
  cover_image_public_id: string | null
  thumbnail_image_public_id: string | null
  studio_count?: number
  studio_names?: string[]
}

export type ExperienceOrderBy = "created_at" | "title"

export type ExperiencesFilters = {
  id?: number
  ids?: number[]
  isActive?: boolean
  search?: string
}

export type ExperiencesQueryOptions = {
  filters?: ExperiencesFilters
  pagination?: {
    from: number
    to: number
  }
  orderBy?: ExperienceOrderBy
  ascending?: boolean
}
