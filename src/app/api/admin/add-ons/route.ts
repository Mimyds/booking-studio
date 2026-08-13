import { NextRequest, NextResponse } from "next/server"
import { fetchAddons } from "@/lib/addons/query"
import type { AddonOrderBy, AddonsFilters } from "@/lib/addons/types"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const addonOrderColumns = ["created_at", "name", "price"] satisfies AddonOrderBy[]

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
