const numberFormatter = new Intl.NumberFormat("fr-FR")
const currencyFormatters = new Map<string, Intl.NumberFormat>()
const dateFormatters = new Map<string, Intl.DateTimeFormat>()

export function formatNumber(value: number | string | null | undefined) {
  return numberFormatter.format(Number(value ?? 0))
}

export function formatCurrency(value: number | string | null | undefined, currency = "EUR", maximumFractionDigits?: number) {
  const key = `${currency}:${maximumFractionDigits ?? "default"}`
  let formatter = currencyFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency, ...(maximumFractionDigits === undefined ? {} : { maximumFractionDigits }) })
    currencyFormatters.set(key, formatter)
  }
  return formatter.format(Number(value ?? 0))
}

export function formatDate(value: string | Date, options: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify(options)
  let formatter = dateFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("fr-FR", options)
    dateFormatters.set(key, formatter)
  }
  return formatter.format(typeof value === "string" ? new Date(value) : value)
}
