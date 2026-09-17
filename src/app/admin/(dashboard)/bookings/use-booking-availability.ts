"use client"

import { useEffect, useState } from "react"
import type { UnavailableRange } from "@/lib/bookings/availability"

type Availability = { studioId: string; unavailable: UnavailableRange[]; error?: string }

export function useBookingAvailability(studioId: string, bookingId?: number) {
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!studioId) return
    const controller = new AbortController()
    const params = new URLSearchParams({ studioId })
    if (bookingId) params.set("bookingId", String(bookingId))
    fetch(`/api/admin/bookings/availability?${params}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error ?? "Impossible de charger les disponibilités.")
        return result as { unavailable: UnavailableRange[] }
      })
      .then(result => setAvailability({ studioId, unavailable: result.unavailable }))
      .catch(error => {
        if (!controller.signal.aborted) setAvailability({ studioId, unavailable: [], error: error instanceof Error ? error.message : "Impossible de charger les disponibilités." })
      })
    return () => controller.abort()
  }, [studioId, bookingId, refreshKey])

  const ready = Boolean(studioId && availability?.studioId === studioId && !availability.error)
  const error = availability?.studioId === studioId ? availability.error : undefined
  return {
    ready,
    error,
    unavailable: ready ? availability?.unavailable ?? [] : [],
    refresh: () => setRefreshKey(value => value + 1),
  }
}
