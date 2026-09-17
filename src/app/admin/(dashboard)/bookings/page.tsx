import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { BookingList } from "./booking-list"
import { bookingSources, bookingStatuses, type BookingListItem } from "./booking-list-model"

export const metadata: Metadata = {
  title: "Réservations admin | The Studio",
  description: "Consultez toutes les réservations de vos studios.",
}

export const dynamic = "force-dynamic"
const PAGE_SIZE = 25
type SearchParams = Record<string, string | string[] | undefined>

function readFilters(params: SearchParams) {
  const status = typeof params.status === "string" && Object.hasOwn(bookingStatuses, params.status) ? params.status : ""
  const source = typeof params.source === "string" && Object.hasOwn(bookingSources, params.source) ? params.source : ""
  const requestedPage = typeof params.page === "string" ? Number(params.page) : 1
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= 1_000_000 ? requestedPage : 1
  return { status, source, page }
}

function bookingPageHref(status: string, source: string, page: number) {
  const queryParams = new URLSearchParams()
  if (status) queryParams.set("status", status)
  if (source) queryParams.set("source", source)
  queryParams.set("page", String(page))
  return `/admin/bookings?${queryParams}`
}

async function loadBookings(status: string, source: string, page: number) {
  const offset = (page - 1) * PAGE_SIZE
  const supabase = await createServerSupabaseClient()
  let query = supabase.from("bookings").select("*, customers(first_name, last_name, email), studios(name, currency)", { count: "exact" })
  if (status) query = query.eq("status", status)
  if (source) query = query.eq("source", source)
  const { data, error, count } = await query.order("created_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + PAGE_SIZE - 1)
  const total = count ?? 0
  return { bookings: (data ?? []) as unknown as BookingListItem[], error: Boolean(error), total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)), offset }
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  if (!(await getCurrentAdmin())) redirect("/admin/login")
  const { status, source, page } = readFilters(await searchParams)
  const result = await loadBookings(status, source, page)
  const pageHref = (nextPage: number) => bookingPageHref(status, source, nextPage)
  if (!result.error && page > result.totalPages) redirect(pageHref(result.totalPages))

  return <main className="grid min-w-0 gap-6">
    <section>
      <Badge variant="secondary">Gestion des séjours</Badge>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">Réservations</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Retrouvez toutes les réservations, les voyageurs et les séjours de vos studios.</p>
      <Button asChild className="mt-4"><Link href="/admin/bookings/new">Nouvelle réservation</Link></Button>
    </section>
    <BookingList {...result} page={page} status={status} source={source} pageHref={pageHref} />
  </main>
}
