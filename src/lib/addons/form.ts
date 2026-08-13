import { isManagedAddonCloudinaryPublicId } from "@/lib/cloudinary/config"

export type AddonFormPayload = {
  name: string
  description: string | null
  price: number
  is_active: boolean
  cloudinary_url: string | null
  cloudinary_public_id: string | null
}

export type AddonFormErrors = Partial<
  Record<
    | "name"
    | "description"
    | "price"
    | "is_active"
    | "cloudinary_public_id"
    | "cloudinary_url",
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
  const value = getText(formData, name).replace(",", ".")

  return value === "" ? Number.NaN : Number(value)
}

export function parseAddonForm(formData: FormData): {
  payload: AddonFormPayload
  errors: AddonFormErrors
} {
  const payload: AddonFormPayload = {
    name: getText(formData, "name"),
    description: getOptionalText(formData, "description"),
    price: getNumber(formData, "price"),
    is_active: formData.get("is_active") === "on",
    cloudinary_url: getOptionalText(formData, "cloudinary_url"),
    cloudinary_public_id: getOptionalText(formData, "cloudinary_public_id"),
  }
  const errors: AddonFormErrors = {}

  if (!payload.name) {
    errors.name = "Le nom de l’add-on est requis."
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    errors.price = "Le prix doit être un nombre positif ou nul."
  }

  if (
    payload.cloudinary_public_id &&
    !isManagedAddonCloudinaryPublicId(payload.cloudinary_public_id)
  ) {
    errors.cloudinary_public_id = "L’image de l’add-on est invalide."
  }

  return { payload, errors }
}
