import { NextRequest, NextResponse } from "next/server"
import { fetchAddons } from "@/lib/addons/query"
import type { Addon, AddonOrderBy, AddonsFilters } from "@/lib/addons/types"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const addonOrderColumns = ["created_at", "name", "price"] satisfies AddonOrderBy[]

type StudioAddonJoin = {
  addon_id: number
  studios: { name: string | null } | { name: string | null }[] | null
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

function getStudioName(row: StudioAddonJoin) {
  const studio = Array.isArray(row.studios) ? row.studios[0] : row.studios

  return typeof studio?.name === "string" ? studio.name : null
}

async function attachStudioUsage(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  addons: Addon[]
) {
  if (addons.length === 0) {
    return addons
  }

  const addonIds = addons.map((addon) => addon.id)
  const { data, error } = await supabase
    .from("studio_addons")
    .select("addon_id, studios(name)")
    .in("addon_id", addonIds)

  if (error) {
    console.error("Admin add-ons studio usage API error:", error)

    return addons.map((addon) => ({
      ...addon,
      studio_count: 0,
      studio_names: [],
    }))
  }

  const usageByAddonId = new Map<number, string[]>()

  for (const row of (data ?? []) as StudioAddonJoin[]) {
    const studioName = getStudioName(row)

    if (!studioName) {
      continue
    }

    const currentNames = usageByAddonId.get(row.addon_id) ?? []

    usageByAddonId.set(row.addon_id, [...currentNames, studioName])
  }

  return addons.map((addon) => {
    const studioNames = (usageByAddonId.get(addon.id) ?? []).toSorted((a, b) =>
      a.localeCompare(b, "fr")
    )

    return {
      ...addon,
      studio_count: studioNames.length,
      studio_names: studioNames,
    }
  })
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

  const addonsWithUsage = await attachStudioUsage(supabase, addons)

  return NextResponse.json({ addons: addonsWithUsage })
}
