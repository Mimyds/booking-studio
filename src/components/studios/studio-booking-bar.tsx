"use client"

import { useRouter } from "next/navigation"
import { CalendarDays, Users } from "lucide-react"
import { useState } from "react"

import { getMinimumCheckout, getStayNights, MIN_BOOKING_NIGHTS } from "@/lib/bookings/stay"
import { cn } from "@/lib/utils"

type StudioBookingBarProps = {
  className?: string
  maxGuests: number
  studioSlug: string
}

function formatDateParam(value: string) {
  return value.trim()
}

export function StudioBookingBar({
  className,
  maxGuests,
  studioSlug,
}: StudioBookingBarProps) {
  const router = useRouter()
  const defaultGuests = Math.min(Math.max(maxGuests, 1), 2).toString()
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [guests, setGuests] = useState(defaultGuests)
  const today = new Date().toISOString().slice(0, 10)
  const guestOptions = Array.from({ length: Math.max(maxGuests, 1) }, (_, index) =>
    index + 1
  )

  function handleCheckInChange(value: string) {
    setCheckIn(value)
    setError(null)

    if (checkOut && value && (getStayNights(value, checkOut) ?? 0) < MIN_BOOKING_NIGHTS) {
      setCheckOut("")
    }
  }

  function handleReserve() {
    if ((getStayNights(checkIn, checkOut) ?? 0) < MIN_BOOKING_NIGHTS) {
      setError("Choisissez des dates pour un séjour d’au moins 2 nuits.")
      return
    }
    setError(null)
    const params = new URLSearchParams()
    const checkInParam = formatDateParam(checkIn)
    const checkOutParam = formatDateParam(checkOut)

    if (checkInParam) {
      params.set("checkIn", checkInParam)
    }

    if (checkOutParam) {
      params.set("checkOut", checkOutParam)
    }

    params.set("guests", guests)
    router.push(`/studios/${studioSlug}/reservation?${params.toString()}`)
  }

  return (
    <div className={cn("w-full bg-white text-neutral-950 shadow-xl", className)}>
      <div className="grid min-h-20 grid-cols-1 divide-y divide-neutral-200 md:grid-cols-[1fr_1fr_1fr_1.05fr] md:divide-x md:divide-y-0">
        <label className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 md:px-6">
          <span className="grid gap-1">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-neutral-500">
              Check-in
            </span>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(event) => handleCheckInChange(event.target.value)}
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-neutral-950 outline-none [color-scheme:light]"
              aria-label="Date d'arrivée"
            />
          </span>
          <CalendarDays className="size-4 shrink-0 text-neutral-500" />
        </label>

        <label className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 md:px-6">
          <span className="grid gap-1">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-neutral-500">
              Check-out
            </span>
            <input
              type="date"
              min={getMinimumCheckout(checkIn || today)}
              value={checkOut}
              onChange={(event) => { setCheckOut(event.target.value); setError(null) }}
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-neutral-950 outline-none [color-scheme:light]"
              aria-label="Date de départ"
            />
          </span>
          <CalendarDays className="size-4 shrink-0 text-neutral-500" />
        </label>

        <label className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 md:px-6">
          <span className="grid gap-1">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-neutral-500">
              Voyageurs
            </span>
            <select
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
              className="w-full min-w-0 appearance-none bg-transparent text-sm font-semibold text-neutral-950 outline-none"
              aria-label="Nombre de voyageurs"
            >
              {guestOptions.map((guestCount) => (
                <option key={guestCount} value={guestCount}>
                  {guestCount} {guestCount === 1 ? "voyageur" : "voyageurs"}
                </option>
              ))}
            </select>
          </span>
          <Users className="size-4 shrink-0 text-neutral-500" />
        </label>

        <button
          type="button"
          onClick={handleReserve}
          className="min-h-20 bg-neutral-900 px-6 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-neutral-500"
        >
          Réserver
        </button>
      </div>
      <p className="px-5 py-2 text-xs text-neutral-500">Séjour minimum : 2 nuits.</p>
      {error ? <p role="alert" className="px-5 pb-3 text-sm text-red-700">{error}</p> : null}
    </div>
  )
}
