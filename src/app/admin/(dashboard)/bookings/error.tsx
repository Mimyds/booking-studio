"use client"
import { Button } from "@/components/ui/button"
export default function BookingsError({ reset }: { reset: () => void }) {
  return <div role="alert" className="rounded-2xl border border-slate-200 bg-white p-6"><p>Impossible de charger les données des réservations.</p><Button onClick={reset} className="mt-4">Réessayer</Button></div>
}
