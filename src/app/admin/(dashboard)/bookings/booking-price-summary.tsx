import { formatCurrency } from "@/lib/formatters"
import type { getBookingPrice } from "@/lib/bookings/pricing"

export function BookingPriceSummary({ price, currency, minimumStayOverride }: { price: ReturnType<typeof getBookingPrice>; currency: string; minimumStayOverride: boolean }) {
  const money = (amount: number) => formatCurrency(amount, currency)
  return <div className="grid gap-2 text-sm" aria-live="polite" aria-atomic="true">
    <span className="font-medium">Montant total</span>
    <output className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-semibold">{price ? money(price.total) : "—"}</output>
    <p className="text-xs text-slate-500">{price ? `${price.nights} nuit${price.nights > 1 ? "s" : ""} × ${money(price.nightlyRate)} / nuit` : minimumStayOverride ? "Sélectionnez un studio et un séjour d’au moins 1 nuit." : "Sélectionnez un studio et un séjour d’au moins 2 nuits."}</p>
  </div>
}
