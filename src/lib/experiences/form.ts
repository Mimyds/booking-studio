import { isManagedExperienceCloudinaryPublicId } from "@/lib/cloudinary/config"

export type ExperienceFormPayload = {
  title: string
  description: string | null
  external_url: string | null
  is_active: boolean
  cover_image_public_id: string | null
  thumbnail_image_public_id: string | null
}

export type ExperienceFormErrors = Partial<
  Record<
    | "title"
    | "description"
    | "external_url"
    | "is_active"
    | "cover_image_public_id"
    | "thumbnail_image_public_id",
    string
  >
>

function getText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim()
}

function getOptionalText(formData: FormData, name: string) {
  return getText(formData, name) || null
}

function isValidExternalUrl(value: string) {
  try {
    const url = new URL(value)

    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function parseExperienceForm(formData: FormData): {
  payload: ExperienceFormPayload
  errors: ExperienceFormErrors
} {
  const payload: ExperienceFormPayload = {
    title: getText(formData, "title"),
    description: getOptionalText(formData, "description"),
    external_url: getOptionalText(formData, "external_url"),
    is_active: formData.get("is_active") === "on",
    cover_image_public_id: getOptionalText(formData, "cover_image_public_id"),
    thumbnail_image_public_id: getOptionalText(
      formData,
      "thumbnail_image_public_id"
    ),
  }
  const errors: ExperienceFormErrors = {}

  if (!payload.title) {
    errors.title = "Le titre de l’expérience est requis."
  }

  if (payload.external_url && !isValidExternalUrl(payload.external_url)) {
    errors.external_url = "L’URL externe doit commencer par http:// ou https://."
  }

  if (
    payload.cover_image_public_id &&
    !isManagedExperienceCloudinaryPublicId(payload.cover_image_public_id)
  ) {
    errors.cover_image_public_id = "L’image de couverture est invalide."
  }

  if (
    payload.thumbnail_image_public_id &&
    !isManagedExperienceCloudinaryPublicId(payload.thumbnail_image_public_id)
  ) {
    errors.thumbnail_image_public_id = "La miniature est invalide."
  }

  return { payload, errors }
}
