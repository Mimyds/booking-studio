export type Addon = {
  id: number
  created_at: string
  name: string
  description: string | null
  price: number | string
  is_active: boolean
  cloudinary_url: string | null
  cloudinary_public_id: string | null
  studio_count?: number
  studio_names?: string[]
}

export type AddonOrderBy = "created_at" | "name" | "price"

export type AddonsFilters = {
  id?: number
  ids?: number[]
  isActive?: boolean
  maxPrice?: number
  minPrice?: number
  search?: string
}

export type AddonsQueryOptions = {
  filters?: AddonsFilters
  pagination?: {
    from: number
    to: number
  }
  orderBy?: AddonOrderBy
  ascending?: boolean
}
