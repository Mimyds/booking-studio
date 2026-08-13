"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type {
  Experience,
  ExperienceOrderBy,
  ExperiencesFilters,
  ExperiencesQueryOptions,
} from "@/lib/experiences/types"

export type { Experience, ExperienceOrderBy }

export type UseExperiencesFilters = ExperiencesFilters

export type UseExperiencesOptions = ExperiencesQueryOptions & {
  endpoint?: string
}

export type UseExperiencesResult = {
  experiences: Experience[]
  error: Error | null
  isLoading: boolean
  refetch: () => Promise<void>
}

function buildOptionsKey(options: UseExperiencesOptions) {
  return JSON.stringify({
    endpoint: options.endpoint ?? "/api/admin/experiences",
    filters: options.filters ?? {},
    orderBy: options.orderBy ?? "title",
    ascending: options.ascending ?? true,
    pagination: options.pagination ?? null,
  })
}

function buildExperiencesUrl(options: UseExperiencesOptions) {
  const params = new URLSearchParams()
  const filters = options.filters ?? {}

  if (filters.id !== undefined) {
    params.set("id", String(filters.id))
  }

  if (filters.ids?.length) {
    params.set("ids", filters.ids.join(","))
  }

  if (filters.isActive !== undefined) {
    params.set("isActive", String(filters.isActive))
  }

  if (filters.search) {
    params.set("search", filters.search)
  }

  if (options.orderBy) {
    params.set("orderBy", options.orderBy)
  }

  if (options.ascending !== undefined) {
    params.set("ascending", String(options.ascending))
  }

  if (options.pagination) {
    params.set("from", String(options.pagination.from))
    params.set("to", String(options.pagination.to))
  }

  const queryString = params.toString()
  const endpoint = options.endpoint ?? "/api/admin/experiences"

  return queryString ? `${endpoint}?${queryString}` : endpoint
}

export function useExperiences(
  options: UseExperiencesOptions = {}
): UseExperiencesResult {
  const optionsKey = useMemo(() => buildOptionsKey(options), [options])
  const normalizedOptions = useMemo(
    () => JSON.parse(optionsKey) as UseExperiencesOptions,
    [optionsKey]
  )
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchExperiences = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(buildExperiencesUrl(normalizedOptions), {
        headers: {
          accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Les expériences n’ont pas pu être chargées.")
      }

      const payload = (await response.json()) as { experiences?: Experience[] }

      setExperiences(payload.experiences ?? [])
    } catch (fetchError) {
      setExperiences([])
      setError(
        fetchError instanceof Error
          ? fetchError
          : new Error("Les expériences n’ont pas pu être chargées.")
      )
    } finally {
      setIsLoading(false)
    }
  }, [normalizedOptions])

  useEffect(() => {
    void fetchExperiences()
  }, [fetchExperiences])

  return {
    experiences,
    error,
    isLoading,
    refetch: fetchExperiences,
  }
}
