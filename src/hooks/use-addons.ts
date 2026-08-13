"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type {
  Addon,
  AddonOrderBy,
  AddonsFilters,
  AddonsQueryOptions,
} from "@/lib/addons/types"

export type { Addon, AddonOrderBy }

export type UseAddonsFilters = AddonsFilters

export type UseAddonsOptions = AddonsQueryOptions & {
  enabled?: boolean
  endpoint?: "/api/admin/add-ons"
}

export type UseAddonsResult = {
  addons: Addon[]
  error: Error | null
  isLoading: boolean
  refetch: () => Promise<void>
}

function buildOptionsKey(options: UseAddonsOptions) {
  return JSON.stringify({
    enabled: options.enabled ?? true,
    endpoint: options.endpoint ?? "/api/admin/add-ons",
    filters: options.filters ?? {},
    pagination: options.pagination ?? null,
    orderBy: options.orderBy ?? "name",
    ascending: options.ascending ?? true,
  })
}

function buildAddonsUrl(options: UseAddonsOptions) {
  const searchParams = new URLSearchParams()
  const filters = options.filters ?? {}
  const endpoint = options.endpoint ?? "/api/admin/add-ons"
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

  if (filters.isActive !== undefined) {
    searchParams.set("isActive", String(filters.isActive))
  }

  if (filters.minPrice !== undefined) {
    searchParams.set("minPrice", String(filters.minPrice))
  }

  if (filters.maxPrice !== undefined) {
    searchParams.set("maxPrice", String(filters.maxPrice))
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

export function useAddons(options: UseAddonsOptions = {}): UseAddonsResult {
  const optionsKey = buildOptionsKey(options)
  const normalizedOptions = useMemo(
    () => JSON.parse(optionsKey) as UseAddonsOptions,
    [optionsKey]
  )
  const [addons, setAddons] = useState<Addon[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(options.enabled ?? true)

  const fetchAddons = useCallback(async () => {
    if (normalizedOptions.enabled === false) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(buildAddonsUrl(normalizedOptions), {
        headers: {
          accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Impossible de récupérer les add-ons.")
      }

      const payload = (await response.json()) as { addons?: Addon[] }

      setAddons(payload.addons ?? [])
    } catch (fetchError) {
      setAddons([])
      setError(
        fetchError instanceof Error
          ? fetchError
          : new Error("Impossible de récupérer les add-ons.")
      )
    } finally {
      setIsLoading(false)
    }
  }, [normalizedOptions])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchAddons()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchAddons])

  return {
    addons,
    error,
    isLoading,
    refetch: fetchAddons,
  }
}
