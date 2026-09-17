"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import type { AnalyticsChartSwitcherProps } from "./dashboard-charts-content"

const LazyCharts = dynamic(
  () => import("./dashboard-charts-content").then((module) => module.AnalyticsChartSwitcher),
  { ssr: false, loading: () => <div className="min-h-64 animate-pulse rounded-3xl bg-slate-50" aria-label="Chargement des graphiques" /> }
)

export function AnalyticsChartSwitcher(props: AnalyticsChartSwitcherProps) {
  const host = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = host.current
    if (!element) return
    if (!("IntersectionObserver" in window)) {
      const timeout = setTimeout(() => setVisible(true), 0)
      return () => clearTimeout(timeout)
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: "200px" })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <div ref={host} className="min-h-64">{visible ? <LazyCharts {...props} /> : <div className="min-h-64 animate-pulse rounded-3xl bg-slate-50" aria-label="Chargement des graphiques" />}</div>
}
