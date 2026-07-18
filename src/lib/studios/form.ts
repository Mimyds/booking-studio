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
  short_description: string | null
  welcome_title: string | null
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

export function parseStudioForm(formData: FormData): {
  payload: StudioFormPayload
  errors: StudioFormErrors
} {
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

  return { payload, errors }
}
