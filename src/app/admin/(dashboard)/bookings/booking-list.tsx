import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { bookingSources, bookingStatuses, type BookingListItem } from "./booking-list-model"

type ListProps = {
  bookings: BookingListItem[]
  error: boolean
  page: number
  totalPages: number
  total: number
  offset: number
  status: string
  source: string
  pageHref: (page: number) => string
}

const dateOptions = { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" } as const
const columns = ["Référence", "Client", "Studio", "Séjour", "Voyageurs", "Canal", "Statut", "Montant", "Actions"]
const displayDate = (value: string) => formatDate(value, dateOptions)

function BookingFilters({ status, source }: Pick<ListProps, "status" | "source">) {
  return <form action="/admin/bookings" className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <label className="grid flex-1 gap-2 text-sm font-medium">Statut
      <select name="status" defaultValue={status} className="h-10 min-w-40 rounded-lg border border-slate-200 bg-white px-3">
        <option value="">Tous les statuts</option>
        {Object.entries(bookingStatuses).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
      </select>
    </label>
    <label className="grid flex-1 gap-2 text-sm font-medium">Canal de réservation
      <select name="source" defaultValue={source} className="h-10 min-w-40 rounded-lg border border-slate-200 bg-white px-3">
        <option value="">Tous les canaux</option>
        {Object.entries(bookingSources).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    <Button type="submit">Filtrer</Button>
    {status || source ? <Button variant="ghost" asChild><Link href="/admin/bookings">Réinitialiser</Link></Button> : null}
  </form>
}

function BookingRow({ booking }: { booking: BookingListItem }) {
  return <tr className="hover:bg-slate-50/70">
    <th scope="row" className="whitespace-nowrap px-4 py-5 font-semibold">#{booking.id}<span className="mt-1 block text-xs font-normal text-slate-500">{displayDate(booking.created_at)}</span></th>
    <td className="px-4 py-5"><p className="font-medium">{booking.customers ? `${booking.customers.first_name} ${booking.customers.last_name}` : `Client #${booking.customer_id}`}</p><p className="mt-1 text-xs text-slate-500">{booking.customers?.email ?? "Coordonnées indisponibles"}</p></td>
    <td className="px-4 py-5 font-medium">{booking.studios?.name ?? `Studio #${booking.studio_id}`}</td>
    <td className="whitespace-nowrap px-4 py-5"><p>Du {displayDate(booking.check_in)}</p><p className="mt-1 text-xs text-slate-500">au {displayDate(booking.check_out)}</p></td>
    <td className="px-4 py-5">{booking.guests_count}</td>
    <td className="whitespace-nowrap px-4 py-5">{bookingSources[booking.source] ?? booking.source}</td>
    <td className="px-4 py-5"><Badge className={bookingStatuses[booking.status]?.className}>{bookingStatuses[booking.status]?.label ?? booking.status}</Badge></td>
    <td className="whitespace-nowrap px-4 py-5 text-right font-semibold">{formatCurrency(booking.total_price, booking.studios?.currency ?? "EUR")}</td>
    <td className="px-4 py-5"><Button variant="outline" size="sm" asChild><Link href={`/admin/bookings/${booking.id}/edit`}>{booking.status === "cancelled" ? "Consulter" : "Gérer"}<span className="sr-only"> la réservation #{booking.id}</span></Link></Button></td>
  </tr>
}

function BookingTable({ bookings, page, totalPages }: Pick<ListProps, "bookings" | "page" | "totalPages">) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200" tabIndex={0} role="region" aria-label="Liste des réservations">
    <table className="w-full text-left text-sm">
      <caption className="sr-only">Réservations, page {page} sur {totalPages}</caption>
      <thead className="whitespace-nowrap bg-slate-50 text-xs text-slate-500"><tr>{columns.map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{bookings.map(booking => <BookingRow key={booking.id} booking={booking} />)}</tbody>
    </table>
  </div>
}

function BookingPagination({ bookings, page, totalPages, offset, total, pageHref }: Pick<ListProps, "bookings" | "page" | "totalPages" | "offset" | "total" | "pageHref">) {
  return <nav aria-label="Pagination des réservations" className="mt-5 flex flex-wrap items-center justify-between gap-3">
    <p className="text-sm text-slate-500">{offset + 1}–{offset + bookings.length} sur {total} · Page {page} sur {totalPages}</p>
    <div className="flex gap-2">
      {page > 1 ? <Button variant="outline" asChild><Link href={pageHref(page - 1)}>Précédent</Link></Button> : <Button variant="outline" disabled>Précédent</Button>}
      {page < totalPages ? <Button variant="outline" asChild><Link href={pageHref(page + 1)}>Suivant</Link></Button> : <Button variant="outline" disabled>Suivant</Button>}
    </div>
  </nav>
}

function BookingResults(props: ListProps) {
  if (props.error) return <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
    <p>Impossible de charger les réservations. Veuillez réessayer.</p>
    <Button variant="outline" asChild className="mt-4"><Link href={props.pageHref(props.page)}>Réessayer</Link></Button>
  </div>
  if (!props.bookings.length) return <div className="rounded-2xl bg-slate-50 px-6 py-16 text-center">
    <p className="font-bold">Aucune réservation{props.status || props.source ? " trouvée" : " pour le moment"}.</p>
    <p className="mt-2 text-sm text-slate-500">{props.status || props.source ? "Modifiez les filtres pour retrouver vos réservations." : "Les réservations apparaîtront ici dès leur création."}</p>
  </div>
  return <>
    <BookingTable bookings={props.bookings} page={props.page} totalPages={props.totalPages} />
    <BookingPagination {...props} />
  </>
}

export function BookingList(props: ListProps) {
  return <Card className="min-w-0">
    <CardHeader>
      <CardTitle>Toutes les réservations</CardTitle>
      <CardDescription>{props.error ? "La liste est momentanément indisponible." : `${props.total} réservation${props.total > 1 ? "s" : ""}${props.status || props.source ? " correspondant aux filtres" : " au total"} · Les plus récentes en premier.`}</CardDescription>
    </CardHeader>
    <CardContent className="min-w-0">
      <BookingFilters status={props.status} source={props.source} />
      <BookingResults {...props} />
    </CardContent>
  </Card>
}
