import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { fetchExperiences } from "@/lib/experiences/query"
import type {
  Experience,
  ExperienceOrderBy,
  ExperiencesFilters,
} from "@/lib/experiences/types"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const experienceOrderColumns = [
  "created_at",
  "title",
] satisfies ExperienceOrderBy[]

type StudioExperienceJoin = {
  experience_id: number
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

function getOrderBy(searchParams: URLSearchParams): ExperienceOrderBy {
  const orderBy = searchParams.get("orderBy")

  if (experienceOrderColumns.includes(orderBy as ExperienceOrderBy)) {
    return orderBy as ExperienceOrderBy
  }

  return "title"
}

function getFilters(searchParams: URLSearchParams): ExperiencesFilters {
  const ids = searchParams
    .getAll("ids")
    .flatMap((value) => value.split(","))
    .map((value) => Number(value))
    .filter(Number.isFinite)

  return {
    id: getNumberParam(searchParams, "id"),
    ids: ids.length > 0 ? ids : undefined,
    isActive: getBooleanParam(searchParams, "isActive"),
    search: searchParams.get("search") ?? undefined,
  }
}

function getStudioName(row: StudioExperienceJoin) {
  const studio = Array.isArray(row.studios) ? row.studios[0] : row.studios

  return typeof studio?.name === "string" ? studio.name : null
}

async function attachStudioUsage(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  experiences: Experience[]
) {
  if (experiences.length === 0) {
    return experiences
  }

  const experienceIds = experiences.map((experience) => experience.id)
  const { data, error } = await supabase
    .from("studio_experiences")
    .select("experience_id, studios(name)")
    .in("experience_id", experienceIds)

  if (error) {
    console.error("Admin experiences studio usage API error:", error)

    return experiences.map((experience) => ({
      ...experience,
      studio_count: 0,
      studio_names: [],
    }))
  }

  const usageByExperienceId = new Map<number, string[]>()

  for (const row of (data ?? []) as StudioExperienceJoin[]) {
    const studioName = getStudioName(row)

    if (!studioName) {
      continue
    }

    const currentNames = usageByExperienceId.get(row.experience_id) ?? []

    usageByExperienceId.set(row.experience_id, [
      ...currentNames,
      studioName,
    ])
  }

  return experiences.map((experience) => {
    const studioNames = (
      usageByExperienceId.get(experience.id) ?? []
    ).toSorted((a, b) => a.localeCompare(b, "fr"))

    return {
      ...experience,
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
  const { experiences, error } = await fetchExperiences(supabase, {
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
    console.error("Admin experiences API error:", error)

    return NextResponse.json(
      { error: "Failed to fetch experiences" },
      { status: 500 }
    )
  }

  const experiencesWithUsage = await attachStudioUsage(supabase, experiences)

  return NextResponse.json({ experiences: experiencesWithUsage })
}
