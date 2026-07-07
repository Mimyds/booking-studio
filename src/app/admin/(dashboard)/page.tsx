import type { Metadata } from "next"
import type { CSSProperties } from "react"
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
import styles from "./dashboard.module.css"

export const metadata: Metadata = {
  title: "Dashboard admin | The Studio",
  description: "Tableau de bord d’administration The Studio.",
}

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

type KpiTone = CSSProperties & Record<`--${string}`, string>

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
    tone: KpiTone
  }> = [
    {
      label: "Studios",
      value: formatNumber(kpis.studios_count),
      hint: "Inventaire publié",
      icon: "ST",
      tone: {
        "--kpi-bg": "#eef2ff",
        "--kpi-color": "#4f46e5",
        "--kpi-glow": "rgba(79, 70, 229, 0.14)",
      },
    },
    {
      label: "Arrivées à venir",
      value: formatNumber(kpis.upcoming_bookings),
      hint: "Séjours confirmés",
      icon: "IN",
      tone: {
        "--kpi-bg": "#ecfeff",
        "--kpi-color": "#0891b2",
        "--kpi-glow": "rgba(8, 145, 178, 0.14)",
      },
    },
    {
      label: "Réservations du mois",
      value: formatNumber(kpis.monthly_bookings),
      hint: "Créées ce mois-ci",
      icon: "BK",
      tone: {
        "--kpi-bg": "#f0fdf4",
        "--kpi-color": "#16a34a",
        "--kpi-glow": "rgba(22, 163, 74, 0.14)",
      },
    },
    {
      label: "Revenus du mois",
      value: formatCurrency(kpis.monthly_revenue),
      hint: "Réservations confirmées",
      icon: "€",
      tone: {
        "--kpi-bg": "#fff7ed",
        "--kpi-color": "#ea580c",
        "--kpi-glow": "rgba(234, 88, 12, 0.16)",
      },
    },
  ]

  return (
    <main className={styles.dashboard}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div>
            <Badge variant="secondary">Admin workspace</Badge>
            <h1 className={styles.heroTitle}>Pilotez vos studios en temps réel.</h1>
            <p className={styles.heroDescription}>
              Suivez les revenus, les réservations, les arrivées et les alertes
              de paiement depuis un espace conçu comme une plateforme SaaS
              moderne.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary">Nouvelle réservation</Button>
              <Button variant="outline">Voir le planning</Button>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <p className={styles.heroPanelLabel}>Revenus du mois</p>
            <p className={styles.heroPanelValue}>
              {formatCurrency(kpis.monthly_revenue)}
            </p>
            <div className={styles.heroPanelFooter}>
              <span>{formatNumber(kpis.monthly_bookings)} réservation(s)</span>
              <span>{formatNumber(kpis.studios_count)} studio(s)</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.kpiGrid}>
        {cards.map((card) => (
          <Card
            key={card.label}
            className={styles.kpiCard}
            style={card.tone}
          >
            <CardHeader>
              <div className={styles.kpiTopline}>
                <CardDescription>{card.label}</CardDescription>
                <div className={styles.kpiIcon}>{card.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={styles.kpiValue}>{card.value}</p>
              <p className={styles.kpiHint}>{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className={styles.panelGrid}>
        <Card>
          <CardHeader>
            <CardTitle>Arrivées à venir</CardTitle>
            <CardDescription>
              Les prochains séjours confirmés à préparer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingArrivals.length > 0 ? (
              <div className={styles.list}>
                {upcomingArrivals.map((arrival) => (
                  <div key={arrival.booking_id} className={styles.listItem}>
                    <div>
                      <p className={styles.listItemTitle}>
                        {arrival.first_name} {arrival.last_name}
                      </p>
                      <p className={styles.listItemMeta}>
                        {arrival.studio_name ?? "Studio"} ·{" "}
                        {formatDate(arrival.check_in)}
                      </p>
                    </div>
                    <Badge variant="secondary">Confirmée</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
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
            <div className={styles.actionGrid}>
              <div className={styles.actionCard}>
                <div>
                  <p className={styles.listItemTitle}>Réservations récentes</p>
                  <span>{recentBookings.length} élément(s)</span>
                </div>
                <Button variant="ghost" size="sm">
                  Ouvrir
                </Button>
              </div>
              <div className={styles.actionCard}>
                <div>
                  <p className={styles.listItemTitle}>Alertes paiement</p>
                  <span>{paymentAlerts.length} alerte(s)</span>
                </div>
                <Button variant="ghost" size="sm">
                  Traiter
                </Button>
              </div>
              <div className={styles.actionCard}>
                <div>
                  <p className={styles.listItemTitle}>Catalogue studios</p>
                  <span>Tarifs, galerie, disponibilité</span>
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
