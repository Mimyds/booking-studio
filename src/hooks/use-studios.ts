"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type {
  Studio,
  StudioOrderBy,
  StudiosFilters,
  StudiosQueryOptions,
} from "@/lib/studios/types"

export type { Studio, StudioOrderBy }

export type UseStudiosFilters = StudiosFilters

export type UseStudiosOptions = StudiosQueryOptions & {
  enabled?: boolean
  endpoint?: "/api/studios" | "/api/admin/studios"
}

export type UseStudiosResult = {
  studios: Studio[]
  error: Error | null
  isLoading: boolean
  refetch: () => Promise<void>
}

function buildOptionsKey(options: UseStudiosOptions) {
  return JSON.stringify({
    enabled: options.enabled ?? true,
    endpoint: options.endpoint ?? "/api/studios",
    filters: options.filters ?? {},
    pagination: options.pagination ?? null,
    orderBy: options.orderBy ?? "name",
    ascending: options.ascending ?? true,
  })
}

function buildStudiosUrl(options: UseStudiosOptions) {
  const searchParams = new URLSearchParams()
  const filters = options.filters ?? {}
  const endpoint = options.endpoint ?? "/api/studios"
  const orderBy = options.orderBy ?? "name"
  const ascending = options.ascending ?? true

  searchParams.set("orderBy", orderBy)
  searchParams.set("ascending", String(ascending))

  if (filters.id !== undefined) {
    searchParams.set("id", String(filters.id))
  }

  if (filters.ids?.length) {
    searchParams.set("ids", filters.ids.join(","))
  }

  if (filters.slug) {
    searchParams.set("slug", filters.slug)
  }

  if (filters.city) {
    searchParams.set("city", filters.city)
  }

  if (filters.countryCode) {
    searchParams.set("countryCode", filters.countryCode)
  }

  if (filters.petsAllowed !== undefined) {
    searchParams.set("petsAllowed", String(filters.petsAllowed))
  }

  if (filters.isPublished !== undefined) {
    searchParams.set("isPublished", String(filters.isPublished))
  }

  if (filters.minCapacity !== undefined) {
    searchParams.set("minCapacity", String(filters.minCapacity))
  }

  if (filters.maxBasePrice !== undefined) {
    searchParams.set("maxBasePrice", String(filters.maxBasePrice))
  }

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim())
  }

  if (options.pagination) {
    searchParams.set("from", String(options.pagination.from))
    searchParams.set("to", String(options.pagination.to))
  }

  return `${endpoint}?${searchParams.toString()}`
}

export function useStudios(options: UseStudiosOptions = {}): UseStudiosResult {
  const optionsKey = buildOptionsKey(options)
  const normalizedOptions = useMemo(
    () => JSON.parse(optionsKey) as UseStudiosOptions,
    [optionsKey]
  )
  const [studios, setStudios] = useState<Studio[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(options.enabled ?? true)

  const fetchStudios = useCallback(async () => {
    if (normalizedOptions.enabled === false) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(buildStudiosUrl(normalizedOptions), {
        headers: {
          accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Impossible de récupérer les studios.")
      }

      const payload = (await response.json()) as { studios?: Studio[] }

      setStudios(payload.studios ?? [])
    } catch (fetchError) {
      setStudios([])
      setError(
        fetchError instanceof Error
          ? fetchError
          : new Error("Impossible de récupérer les studios.")
      )
    } finally {
      setIsLoading(false)
    }
  }, [normalizedOptions])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchStudios()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchStudios])

  return {
    studios,
    error,
    isLoading,
    refetch: fetchStudios,
  }
}
