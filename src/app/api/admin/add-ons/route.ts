import { NextRequest, NextResponse } from "next/server"
import { fetchAddons } from "@/lib/addons/query"
import type { Addon, AddonOrderBy, AddonsFilters } from "@/lib/addons/types"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const addonOrderColumns = ["created_at", "name", "price"] satisfies AddonOrderBy[]

type CreateAddonBody = {
  cloudinary_public_id?: unknown
  cloudinary_url?: unknown
  description?: unknown
  is_active?: unknown
  name?: unknown
  price?: unknown
}

function getNumberParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key)

  if (!value) {
    return undefined
  }

  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : undefined
}

function getBooleanParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key)

  if (value === "true") {
    return true
  }

  if (value === "false") {
    return false
  }

  return undefined
}

function getOptionalText(value: unknown) {
  return typeof value === "string" ? value.trim() || null : null
}

function getRequiredText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function getPriceValue(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined
  }

  if (typeof value !== "string") {
    return undefined
  }

  const normalizedValue = value.trim().replace(",", ".")
  const price = Number(normalizedValue)

  return Number.isFinite(price) ? price : undefined
}

function getOrderBy(searchParams: URLSearchParams): AddonOrderBy {
  const orderBy = searchParams.get("orderBy")

  if (addonOrderColumns.includes(orderBy as AddonOrderBy)) {
    return orderBy as AddonOrderBy
  }

  return "name"
}

function getFilters(searchParams: URLSearchParams): AddonsFilters {
  const ids = searchParams
    .getAll("ids")
    .flatMap((value) => value.split(","))
    .map((value) => Number(value))
    .filter(Number.isFinite)

  return {
    id: getNumberParam(searchParams, "id"),
    ids: ids.length > 0 ? ids : undefined,
    isActive: getBooleanParam(searchParams, "isActive"),
    maxPrice: getNumberParam(searchParams, "maxPrice"),
    minPrice: getNumberParam(searchParams, "minPrice"),
    search: searchParams.get("search") ?? undefined,
  }
}

export async function GET(request: NextRequest) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const from = getNumberParam(searchParams, "from")
  const to = getNumberParam(searchParams, "to")
  const supabase = await createServerSupabaseClient()
  const { addons, error } = await fetchAddons(supabase, {
    filters: getFilters(searchParams),
    orderBy: getOrderBy(searchParams),
    ascending: searchParams.get("ascending") !== "false",
    pagination:
      from !== undefined && to !== undefined
        ? {
            from,
            to,
          }
        : undefined,
  })

  if (error) {
    console.error("Admin add-ons API error:", error)

    return NextResponse.json(
      { error: "Failed to fetch add-ons" },
      { status: 500 }
    )
  }

  return NextResponse.json({ addons })
}

export async function POST(request: NextRequest) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as CreateAddonBody
  const name = getRequiredText(body.name)
  const price = getPriceValue(body.price)

  if (!name) {
    return NextResponse.json(
      { error: "Le nom de l’add-on est requis." },
      { status: 400 }
    )
  }

  if (price === undefined || price < 0) {
    return NextResponse.json(
      { error: "Le prix de l’add-on doit être un nombre positif." },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabaseClient()
  const { data: addon, error } = await supabase
    .from("addons")
    .insert([
      {
        name,
        description: getOptionalText(body.description),
        price,
        is_active: typeof body.is_active === "boolean" ? body.is_active : true,
        cloudinary_url: getOptionalText(body.cloudinary_url),
        cloudinary_public_id: getOptionalText(body.cloudinary_public_id),
      },
    ])
    .select("id, created_at, name, description, price, is_active, cloudinary_url, cloudinary_public_id")
    .single()

  if (error) {
    console.error("[create-addon] Supabase insert failed", {
      code: error.code,
      message: error.message,
    })

    return NextResponse.json(
      { error: "L’add-on n’a pas pu être créé." },
      { status: 500 }
    )
  }

  return NextResponse.json({ addon: addon as Addon }, { status: 201 })
}
