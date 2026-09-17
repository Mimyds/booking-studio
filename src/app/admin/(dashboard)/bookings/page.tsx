import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Réservations admin | The Studio",
  description: "Consultez toutes les réservations de vos studios.",
}

export const dynamic = "force-dynamic"

const PAGE_SIZE = 25
const statuses = {
  pending: { label: "En attente", className: "bg-amber-50 text-amber-800" },
  confirmed: { label: "Confirmée", className: "bg-emerald-50 text-emerald-800" },
  cancelled: { label: "Annulée", className: "bg-rose-50 text-rose-800" },
}
const sources = { direct: "Direct", airbnb: "Airbnb", booking: "Booking.com" }

type Booking = {
  id: number
  created_at: string
  customer_id: number
  studio_id: number
  source: keyof typeof sources
  status: keyof typeof statuses
  check_in: string
  check_out: string
  guests_count: number
  total_price: number | string
  customers: { first_name: string; last_name: string; email: string } | null
  studios: { name: string; currency: string } | null
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(value))
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (!(await getCurrentAdmin())) redirect("/admin/login")

  const params = await searchParams
  const status = typeof params.status === "string" && Object.hasOwn(statuses, params.status) ? params.status : ""
  const source = typeof params.source === "string" && Object.hasOwn(sources, params.source) ? params.source : ""
  const requestedPage = typeof params.page === "string" ? Number(params.page) : 1
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= 1_000_000 ? requestedPage : 1
  const offset = (page - 1) * PAGE_SIZE
  const supabase = await createServerSupabaseClient()
  let query = supabase.from("bookings").select(
    "*, customers(first_name, last_name, email), studios(name, currency)",
    { count: "exact" }
  )
  if (status) query = query.eq("status", status)
  if (source) query = query.eq("source", source)

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)
  const bookings = (data ?? []) as unknown as Booking[]
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function pageHref(nextPage: number) {
    const queryParams = new URLSearchParams()
    if (status) queryParams.set("status", status)
    if (source) queryParams.set("source", source)
    queryParams.set("page", String(nextPage))
    return `/admin/bookings?${queryParams}`
  }

  if (!error && page > totalPages) redirect(pageHref(totalPages))

  return (
    <main className="grid min-w-0 gap-6">
      <section>
        <Badge variant="secondary">Gestion des séjours</Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">Réservations</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Retrouvez toutes les réservations, les voyageurs et les séjours de vos studios.</p>
        <Button asChild className="mt-4"><Link href="/admin/bookings/new">Nouvelle réservation</Link></Button>
      </section>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Toutes les réservations</CardTitle>
          <CardDescription>
            {error ? "La liste est momentanément indisponible." : `${total} réservation${total > 1 ? "s" : ""}${status || source ? " correspondant aux filtres" : " au total"} · Les plus récentes en premier.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <form action="/admin/bookings" className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="grid flex-1 gap-2 text-sm font-medium">
              Statut
              <select name="status" defaultValue={status} className="h-10 min-w-40 rounded-lg border border-slate-200 bg-white px-3">
                <option value="">Tous les statuts</option>
                {Object.entries(statuses).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
              </select>
            </label>
            <label className="grid flex-1 gap-2 text-sm font-medium">
              Canal de réservation
              <select name="source" defaultValue={source} className="h-10 min-w-40 rounded-lg border border-slate-200 bg-white px-3">
                <option value="">Tous les canaux</option>
                {Object.entries(sources).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <Button type="submit">Filtrer</Button>
            {status || source ? <Button variant="ghost" asChild><Link href="/admin/bookings">Réinitialiser</Link></Button> : null}
          </form>

          {error ? (
            <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
              <p>Impossible de charger les réservations. Veuillez réessayer.</p>
              <Button variant="outline" asChild className="mt-4"><Link href={pageHref(page)}>Réessayer</Link></Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-6 py-16 text-center">
              <p className="font-bold">Aucune réservation{status || source ? " trouvée" : " pour le moment"}.</p>
              <p className="mt-2 text-sm text-slate-500">{status || source ? "Modifiez les filtres pour retrouver vos réservations." : "Les réservations apparaîtront ici dès leur création."}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-slate-200" tabIndex={0} role="region" aria-label="Liste des réservations">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Réservations, page {page} sur {totalPages}</caption>
                  <thead className="whitespace-nowrap bg-slate-50 text-xs text-slate-500">
                    <tr>{["Référence", "Client", "Studio", "Séjour", "Voyageurs", "Canal", "Statut", "Montant", "Actions"].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-50/70">
                        <th scope="row" className="whitespace-nowrap px-4 py-5 font-semibold">#{booking.id}<span className="mt-1 block text-xs font-normal text-slate-500">{formatDate(booking.created_at)}</span></th>
                        <td className="px-4 py-5"><p className="font-medium">{booking.customers ? `${booking.customers.first_name} ${booking.customers.last_name}` : `Client #${booking.customer_id}`}</p><p className="mt-1 text-xs text-slate-500">{booking.customers?.email ?? "Coordonnées indisponibles"}</p></td>
                        <td className="px-4 py-5 font-medium">{booking.studios?.name ?? `Studio #${booking.studio_id}`}</td>
                        <td className="whitespace-nowrap px-4 py-5"><p>Du {formatDate(booking.check_in)}</p><p className="mt-1 text-xs text-slate-500">au {formatDate(booking.check_out)}</p></td>
                        <td className="px-4 py-5">{booking.guests_count}</td>
                        <td className="whitespace-nowrap px-4 py-5">{sources[booking.source] ?? booking.source}</td>
                        <td className="px-4 py-5"><Badge className={statuses[booking.status]?.className}>{statuses[booking.status]?.label ?? booking.status}</Badge></td>
                        <td className="whitespace-nowrap px-4 py-5 text-right font-semibold">{new Intl.NumberFormat("fr-FR", { style: "currency", currency: booking.studios?.currency ?? "EUR" }).format(Number(booking.total_price))}</td>
                      <td className="px-4 py-5"><Button variant="outline" size="sm" asChild><Link href={`/admin/bookings/${booking.id}/edit`}>{booking.status === "cancelled" ? "Consulter" : "Gérer"}<span className="sr-only"> la réservation #{booking.id}</span></Link></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <nav aria-label="Pagination des réservations" className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">{offset + 1}–{offset + bookings.length} sur {total} · Page {page} sur {totalPages}</p>
                <div className="flex gap-2">
                  {page > 1 ? <Button variant="outline" asChild><Link href={pageHref(page - 1)}>Précédent</Link></Button> : <Button variant="outline" disabled>Précédent</Button>}
                  {page < totalPages ? <Button variant="outline" asChild><Link href={pageHref(page + 1)}>Suivant</Link></Button> : <Button variant="outline" disabled>Suivant</Button>}
                </div>
              </nav>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
