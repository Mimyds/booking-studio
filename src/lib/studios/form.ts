import { isManagedStudioCloudinaryPublicId } from "@/lib/cloudinary/config"

export type StudioFormPayload = {
  slug: string
  name: string
  description: string | null
  capacity: number
  base_price: number
  cleaning_fee: number
  currency: string
  city: string | null
  country_code: string | null
  pets_allowed: boolean
  is_published: boolean
  image_cover_public_id: string | null
  short_description: string | null
  welcome_title: string | null
}

export type StudioGalleryImageInput = {
  image_public_id: string
  alt_text: string | null
  sort_order: number
}

export type StudioFormErrors = Partial<
  Record<
    | "slug"
    | "name"
    | "description"
    | "capacity"
    | "base_price"
    | "cleaning_fee"
    | "currency"
    | "city"
    | "country_code"
    | "image_cover_public_id"
    | "gallery_images"
    | "amenity_ids"
    | "addon_ids"
    | "experience_ids"
    | "short_description"
    | "welcome_title",
    string
  >
>

function getText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim()
}

function getOptionalText(formData: FormData, name: string) {
  return getText(formData, name) || null
}

function getNumber(formData: FormData, name: string) {
  const value = getText(formData, name)
  return value === "" ? Number.NaN : Number(value)
}

export function slugifyStudioName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function parseStudioGalleryImages(value: FormDataEntryValue | null) {
  if (!value) {
    return { galleryImages: [] as StudioGalleryImageInput[] }
  }

  try {
    const parsedValue = JSON.parse(String(value))

    if (!Array.isArray(parsedValue) || parsedValue.length > 12) {
      return { galleryImages: [], error: "La galerie est invalide." }
    }

    const publicIds = new Set<string>()
    const galleryImages = parsedValue.map((image, sortOrder) => {
      const publicId =
        typeof image?.image_public_id === "string"
          ? image.image_public_id.trim()
          : ""
      const altText =
        typeof image?.alt_text === "string" ? image.alt_text.trim() : ""

      if (!publicId || publicIds.has(publicId)) {
        throw new Error("Invalid gallery image")
      }

      publicIds.add(publicId)

      return {
        image_public_id: publicId,
        alt_text: altText || null,
        sort_order: sortOrder,
      }
    })

    return { galleryImages }
  } catch {
    return { galleryImages: [], error: "La galerie est invalide." }
  }
}

export function parseStudioAmenityIds(formData: FormData) {
  const rawAmenityIds = formData.getAll("amenity_ids")
  const amenityIds = rawAmenityIds
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0)
  const uniqueAmenityIds = Array.from(new Set(amenityIds))

  if (amenityIds.length !== rawAmenityIds.length) {
    return {
      amenityIds: uniqueAmenityIds,
      error: "Les équipements sont invalides.",
    }
  }

  return { amenityIds: uniqueAmenityIds }
}

export function parseStudioAddonIds(formData: FormData) {
  const rawAddonIds = formData.getAll("addon_ids")
  const addonIds = rawAddonIds
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0)
  const uniqueAddonIds = Array.from(new Set(addonIds))

  if (addonIds.length !== rawAddonIds.length) {
    return {
      addonIds: uniqueAddonIds,
      error: "Les add-ons sont invalides.",
    }
  }

  return { addonIds: uniqueAddonIds }
}

export function parseStudioExperienceIds(formData: FormData) {
  const rawExperienceIds = formData.getAll("experience_ids")
  const experienceIds = rawExperienceIds
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0)
  const uniqueExperienceIds = Array.from(new Set(experienceIds))

  if (experienceIds.length !== rawExperienceIds.length) {
    return {
      experienceIds: uniqueExperienceIds,
      error: "Les expériences sont invalides.",
    }
  }

  return { experienceIds: uniqueExperienceIds }
}

export function parseStudioForm(formData: FormData): {
  payload: StudioFormPayload
  galleryImages: StudioGalleryImageInput[]
  amenityIds: number[]
  addonIds: number[]
  experienceIds: number[]
  errors: StudioFormErrors
} {
  const { galleryImages, error: galleryError } = parseStudioGalleryImages(
    formData.get("gallery_images")
  )
  const { amenityIds, error: amenityIdsError } = parseStudioAmenityIds(formData)
  const { addonIds, error: addonIdsError } = parseStudioAddonIds(formData)
  const { experienceIds, error: experienceIdsError } =
    parseStudioExperienceIds(formData)
  const payload: StudioFormPayload = {
    slug: getText(formData, "slug").toLowerCase(),
    name: getText(formData, "name"),
    description: getOptionalText(formData, "description"),
    capacity: getNumber(formData, "capacity"),
    base_price: getNumber(formData, "base_price"),
    cleaning_fee: getNumber(formData, "cleaning_fee"),
    currency: getText(formData, "currency").toUpperCase(),
    city: getOptionalText(formData, "city"),
    country_code: getOptionalText(formData, "country_code")?.toUpperCase() ?? null,
    pets_allowed: formData.get("pets_allowed") === "on",
    is_published: formData.get("is_published") === "on",
    image_cover_public_id: getOptionalText(
      formData,
      "image_cover_public_id"
    ),
    short_description: getOptionalText(formData, "short_description"),
    welcome_title: getOptionalText(formData, "welcome_title"),
  }
  const errors: StudioFormErrors = {}

  if (!payload.name) {
    errors.name = "Le nom du studio est requis."
  }

  if (!payload.slug) {
    errors.slug = "Le slug est requis."
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
    errors.slug = "Utilisez uniquement des lettres, chiffres et tirets."
  }

  if (!Number.isInteger(payload.capacity) || payload.capacity < 1) {
    errors.capacity = "La capacité doit être un nombre entier supérieur à 0."
  }

  if (!Number.isFinite(payload.base_price) || payload.base_price < 0) {
    errors.base_price = "Le tarif doit être un nombre positif ou nul."
  }

  if (!Number.isFinite(payload.cleaning_fee) || payload.cleaning_fee < 0) {
    errors.cleaning_fee = "Les frais doivent être un nombre positif ou nul."
  }

  if (!/^[A-Z]{3}$/.test(payload.currency)) {
    errors.currency = "Utilisez un code devise à 3 lettres, par exemple EUR."
  }

  if (payload.country_code && !/^[A-Z]{2}$/.test(payload.country_code)) {
    errors.country_code = "Utilisez un code pays à 2 lettres, par exemple MQ."
  }

  if (
    payload.image_cover_public_id &&
    !isManagedStudioCloudinaryPublicId(payload.image_cover_public_id)
  ) {
    errors.image_cover_public_id = "L’image de couverture est invalide."
  }

  const hasInvalidGalleryFolder = galleryImages.some(
    (image) => !isManagedStudioCloudinaryPublicId(image.image_public_id)
  )

  if (galleryError) {
    errors.gallery_images = galleryError
  } else if (hasInvalidGalleryFolder) {
    errors.gallery_images = "La galerie contient une image invalide."
  }

  if (amenityIdsError) {
    errors.amenity_ids = amenityIdsError
  }

  if (addonIdsError) {
    errors.addon_ids = addonIdsError
  }

  if (experienceIdsError) {
    errors.experience_ids = experienceIdsError
  }

  return { payload, galleryImages, amenityIds, addonIds, experienceIds, errors }
}
