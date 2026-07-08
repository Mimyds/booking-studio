import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Dashboard admin | The Studio",
  description: "Tableau de bord d’administration The Studio.",
}

export const dynamic = "force-dynamic"

type DashboardKpis = {
  studios_count?: number | null
  upcoming_bookings?: number | null
  monthly_bookings?: number | null
  monthly_revenue?: number | string | null
}

type UpcomingArrival = {
  booking_id: number
  check_in: string
  first_name: string | null
  last_name: string | null
  studio_name: string | null
}

type RecentBooking = {
  booking_id: number
  created_at: string
  total_price: number | string | null
  studio_name: string | null
}

type PaymentAlert = {
  payment_id: number
  booking_id: number
  amount: number | string | null
  status: string
}

async function getDashboardData() {
  const supabase = await createServerSupabaseClient()

  const [kpis, upcomingArrivals, recentBookings, paymentAlerts] =
    await Promise.all([
      supabase.from("dashboard_kpis").select("*").single(),
      supabase.from("dashboard_upcoming_arrivals").select("*").limit(4),
      supabase.from("dashboard_recent_bookings").select("*").limit(4),
      supabase.from("dashboard_payments_alerts").select("*").limit(4),
    ])

  return {
    kpis: (kpis.data ?? {}) as DashboardKpis,
    upcomingArrivals: (upcomingArrivals.data ?? []) as UpcomingArrival[],
    recentBookings: (recentBookings.data ?? []) as RecentBooking[],
    paymentAlerts: (paymentAlerts.data ?? []) as PaymentAlert[],
  }
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("fr-FR").format(value ?? 0)
}

function formatCurrency(value: number | string | null | undefined) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value ?? 0))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export default async function AdminDashboardPage() {
  const { kpis, upcomingArrivals, recentBookings, paymentAlerts } =
    await getDashboardData()

  const cards: Array<{
    label: string
    value: string
    hint: string
    icon: string
    iconClassName: string
    glowClassName: string
  }> = [
    {
      label: "Studios",
      value: formatNumber(kpis.studios_count),
      hint: "Inventaire publié",
      icon: "ST",
      iconClassName: "bg-indigo-50 text-indigo-600",
      glowClassName: "after:bg-indigo-500/15",
    },
    {
      label: "Arrivées à venir",
      value: formatNumber(kpis.upcoming_bookings),
      hint: "Séjours confirmés",
      icon: "IN",
      iconClassName: "bg-cyan-50 text-cyan-600",
      glowClassName: "after:bg-cyan-500/15",
    },
    {
      label: "Réservations du mois",
      value: formatNumber(kpis.monthly_bookings),
      hint: "Créées ce mois-ci",
      icon: "BK",
      iconClassName: "bg-green-50 text-green-600",
      glowClassName: "after:bg-green-500/15",
    },
    {
      label: "Revenus du mois",
      value: formatCurrency(kpis.monthly_revenue),
      hint: "Réservations confirmées",
      icon: "€",
      iconClassName: "bg-orange-50 text-orange-600",
      glowClassName: "after:bg-orange-500/15",
    },
  ]

  return (
    <main className="grid gap-6">
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-700 p-[clamp(1.5rem,3vw,2.25rem)] text-white shadow-2xl shadow-indigo-950/30 after:absolute after:-bottom-40 after:-right-24 after:size-[22rem] after:rounded-full after:bg-sky-400/25 after:blur-xl">
        <div className="relative z-10 grid grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] gap-6 max-[1180px]:grid-cols-1">
          <div>
            <Badge variant="secondary">Admin workspace</Badge>
            <h1 className="mt-3 max-w-3xl text-[clamp(2.15rem,5vw,4.3rem)] font-extrabold leading-[0.95] tracking-[-0.065em]">
              Pilotez vos studios en temps réel.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200/90 md:text-base">
              Suivez les revenus, les réservations, les arrivées et les alertes
              de paiement depuis un espace conçu comme une plateforme SaaS
              moderne.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary">Nouvelle réservation</Button>
              <Button variant="outline">Voir le planning</Button>
            </div>
          </div>

          <div className="self-stretch rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-200/75">
              Revenus du mois
            </p>
            <p className="mt-4 text-[clamp(2rem,4vw,3.2rem)] font-extrabold tracking-[-0.05em]">
              {formatCurrency(kpis.monthly_revenue)}
            </p>
            <div className="mt-4 flex justify-between gap-4 text-sm text-slate-200/80">
              <span>{formatNumber(kpis.monthly_bookings)} réservation(s)</span>
              <span>{formatNumber(kpis.studios_count)} studio(s)</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-4 max-[1180px]:grid-cols-2 max-[640px]:grid-cols-1">
        {cards.map((card) => (
          <Card
            key={card.label}
            className={`relative min-h-[10.25rem] overflow-hidden after:absolute after:-bottom-16 after:-right-12 after:size-32 after:rounded-full ${card.glowClassName}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardDescription>{card.label}</CardDescription>
                <div
                  className={`grid size-11 place-items-center rounded-2xl font-extrabold ${card.iconClassName}`}
                >
                  {card.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mt-5 text-3xl font-extrabold tracking-tight">
                {card.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] gap-4 max-[1180px]:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Arrivées à venir</CardTitle>
            <CardDescription>
              Les prochains séjours confirmés à préparer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingArrivals.length > 0 ? (
              <div className="grid gap-3">
                {upcomingArrivals.map((arrival) => (
                  <div
                    key={arrival.booking_id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"
                  >
                    <div>
                      <p className="text-sm font-bold">
                        {arrival.first_name} {arrival.last_name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {arrival.studio_name ?? "Studio"} ·{" "}
                        {formatDate(arrival.check_in)}
                      </p>
                    </div>
                    <Badge variant="secondary">Confirmée</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid min-h-48 place-items-center rounded-3xl bg-slate-50 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(148,163,184,0.08)_12px,rgba(148,163,184,0.08)_13px)] text-center text-slate-500">
                <p>Aucune arrivée confirmée à venir.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Les prochains modules à connecter au dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-bold">Réservations récentes</p>
                  <span className="text-xs text-slate-500">
                    {recentBookings.length} élément(s)
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  Ouvrir
                </Button>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-bold">Alertes paiement</p>
                  <span className="text-xs text-slate-500">
                    {paymentAlerts.length} alerte(s)
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  Traiter
                </Button>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-bold">Catalogue studios</p>
                  <span className="text-xs text-slate-500">
                    Tarifs, galerie, disponibilité
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  Gérer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
