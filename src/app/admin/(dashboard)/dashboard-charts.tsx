"use client"

import { useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type RevenueOverTime = {
  month: string
  revenue: number | string | null
}

type BookingsOverTime = {
  month: string
  count: number | string | null
}

type BookingsByStudio = {
  studio: string | null
  count: number | string | null
}

type BookingsBySource = {
  source: string | null
  count: number | string | null
}

type RankingItem = {
  label: string
  count: number
}

type ChartKey = "revenue" | "monthlyBookings" | "studioBookings" | "sources"

type AnalyticsChartSwitcherProps = {
  revenueOverTime: RevenueOverTime[]
  bookingsOverTime: BookingsOverTime[]
  bookingsByStudio: BookingsByStudio[]
  bookingsBySource: BookingsBySource[]
}

const chartOptions: Array<{
  value: ChartKey
  label: string
}> = [
  {
    value: "revenue",
    label: "Revenus mensuels",
  },
  {
    value: "monthlyBookings",
    label: "Réservations mensuelles",
  },
  {
    value: "studioBookings",
    label: "Réservations par studio",
  },
  {
    value: "sources",
    label: "Sources des réservations",
  },
]

const revenueChartConfig = {
  revenue: {
    label: "Revenus",
    color: "#7c3aed",
  },
} satisfies ChartConfig

const monthlyBookingsChartConfig = {
  count: {
    label: "Réservations",
    color: "#06b6d4",
  },
} satisfies ChartConfig

const studioChartConfig = {
  count: {
    label: "Réservations",
    color: "#6366f1",
  },
} satisfies ChartConfig

const sourceChartConfig = {
  count: {
    label: "Réservations",
    color: "#10b981",
  },
} satisfies ChartConfig

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0)
}

function formatCurrency(value: number | string | null | undefined) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(toNumber(value))
}

function formatMonth(value: string) {
  const date = new Date(`${value}-01T00:00:00.000Z`)

  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(date)
}

function formatBookingSource(value: string | null) {
  const labels: Record<string, string> = {
    airbnb: "Airbnb",
    booking: "Booking.com",
    direct: "Direct",
    manual: "Manuelle",
  }

  return value ? labels[value] ?? value : "Non renseignée"
}

function EmptyChart() {
  return (
    <div className="grid min-h-64 place-items-center rounded-3xl bg-slate-50 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(148,163,184,0.08)_12px,rgba(148,163,184,0.08)_13px)] text-center text-sm text-slate-500">
      Aucune donnée disponible pour le moment.
    </div>
  )
}

function hasValues(data: Array<{ count?: number; revenue?: number }>) {
  return data.some((item) => (item.count ?? item.revenue ?? 0) > 0)
}

export function RevenueChart({ data }: { data: RevenueOverTime[] }) {
  const chartData = data.map((item) => ({
    month: formatMonth(item.month),
    revenue: toNumber(item.revenue),
  }))

  if (!chartData.length || !hasValues(chartData)) {
    return <EmptyChart />
  }

  return (
    <ChartContainer config={revenueChartConfig} className="h-72 w-full">
      <AreaChart accessibilityLayer data={chartData} margin={{ left: 0, right: 12 }}>
        <CartesianGrid vertical={false} strokeDasharray="6 8" />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickLine={false}
          tickMargin={10}
        />
        <YAxis
          axisLine={false}
          tickFormatter={(value) => formatCurrency(Number(value))}
          tickLine={false}
          tickMargin={10}
          width={72}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
              indicator="line"
            />
          }
        />
        <Area
          dataKey="revenue"
          fill="var(--color-revenue)"
          fillOpacity={0.18}
          stroke="var(--color-revenue)"
          strokeWidth={3}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function MonthlyBookingsChart({ data }: { data: BookingsOverTime[] }) {
  const chartData = data.map((item) => ({
    month: formatMonth(item.month),
    count: toNumber(item.count),
  }))

  if (!chartData.length || !hasValues(chartData)) {
    return <EmptyChart />
  }

  return (
    <ChartContainer
      config={monthlyBookingsChartConfig}
      className="h-72 w-full"
    >
      <BarChart accessibilityLayer data={chartData} margin={{ left: 0, right: 12 }}>
        <CartesianGrid vertical={false} strokeDasharray="6 8" />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickLine={false}
          tickMargin={10}
        />
        <YAxis axisLine={false} tickLine={false} tickMargin={10} width={32} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[12, 12, 12, 12]} />
      </BarChart>
    </ChartContainer>
  )
}

function RankingChart({
  data,
  config,
  colors,
}: {
  data: RankingItem[]
  config: ChartConfig
  colors: string[]
}) {
  if (!data.length || !hasValues(data)) {
    return <EmptyChart />
  }

  return (
    <ChartContainer config={config} className="h-72 w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ bottom: 0, left: 0, right: 16, top: 0 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="6 8" />
        <XAxis axisLine={false} hide tickLine={false} type="number" />
        <YAxis
          axisLine={false}
          dataKey="label"
          tickLine={false}
          tickMargin={10}
          type="category"
          width={112}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Bar dataKey="count" radius={[0, 12, 12, 0]}>
          {data.map((item, index) => (
            <Cell
              fill={colors[index % colors.length]}
              key={`${item.label}-${item.count}`}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function StudioReservationsChart({ data }: { data: BookingsByStudio[] }) {
  const chartData = data.map((item) => ({
    label: item.studio ?? "Studio",
    count: toNumber(item.count),
  }))

  return (
    <RankingChart
      config={studioChartConfig}
      colors={["#6366f1", "#818cf8", "#a5b4fc", "#c4b5fd"]}
      data={chartData}
    />
  )
}

export function BookingSourcesChart({ data }: { data: BookingsBySource[] }) {
  const chartData = data.map((item) => ({
    label: formatBookingSource(item.source),
    count: toNumber(item.count),
  }))

  return (
    <RankingChart
      config={sourceChartConfig}
      colors={["#10b981", "#34d399", "#6ee7b7", "#99f6e4"]}
      data={chartData}
    />
  )
}

export function AnalyticsChartSwitcher({
  revenueOverTime,
  bookingsOverTime,
  bookingsByStudio,
  bookingsBySource,
}: AnalyticsChartSwitcherProps) {
  const [selectedChart, setSelectedChart] = useState<ChartKey>("revenue")

  return (
    <div className="grid gap-5">
      <div className="flex justify-end">
        <Select
          value={selectedChart}
          onValueChange={(value) => setSelectedChart(value as ChartKey)}
        >
          <SelectTrigger className="w-[18rem] max-[720px]:w-full">
            <SelectValue placeholder="Choisir un graphique" />
          </SelectTrigger>
          <SelectContent>
            {chartOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedChart === "revenue" ? (
        <RevenueChart data={revenueOverTime} />
      ) : null}
      {selectedChart === "monthlyBookings" ? (
        <MonthlyBookingsChart data={bookingsOverTime} />
      ) : null}
      {selectedChart === "studioBookings" ? (
        <StudioReservationsChart data={bookingsByStudio} />
      ) : null}
      {selectedChart === "sources" ? (
        <BookingSourcesChart data={bookingsBySource} />
      ) : null}
    </div>
  )
}
