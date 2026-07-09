import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { fetchStudios } from "@/lib/studios/query"
import type { StudioOrderBy, StudiosFilters } from "@/lib/studios/types"

const studioOrderColumns = [
  "created_at",
  "name",
  "base_price",
  "capacity",
  "updated_at",
] satisfies StudioOrderBy[]

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

function getOrderBy(searchParams: URLSearchParams): StudioOrderBy {
  const orderBy = searchParams.get("orderBy")

  if (studioOrderColumns.includes(orderBy as StudioOrderBy)) {
    return orderBy as StudioOrderBy
  }

  return "name"
}

function getFilters(searchParams: URLSearchParams): StudiosFilters {
  const ids = searchParams
    .getAll("ids")
    .flatMap((value) => value.split(","))
    .map((value) => Number(value))
    .filter(Number.isFinite)

  return {
    id: getNumberParam(searchParams, "id"),
    ids: ids.length > 0 ? ids : undefined,
    slug: searchParams.get("slug") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    countryCode: searchParams.get("countryCode") ?? undefined,
    petsAllowed: getBooleanParam(searchParams, "petsAllowed"),
    minCapacity: getNumberParam(searchParams, "minCapacity"),
    maxBasePrice: getNumberParam(searchParams, "maxBasePrice"),
    search: searchParams.get("search") ?? undefined,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const from = getNumberParam(searchParams, "from")
  const to = getNumberParam(searchParams, "to")
  const supabase = await createServerSupabaseClient()
  const { studios, error } = await fetchStudios(supabase, {
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
    console.error("Studios API error:", error)

    return NextResponse.json(
      { error: "Failed to fetch studios" },
      { status: 500 }
    )
  }

  return NextResponse.json({ studios })
}
