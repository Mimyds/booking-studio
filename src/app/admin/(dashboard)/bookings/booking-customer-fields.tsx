"use client"

import { Input } from "@/components/ui/input"
import type { BookingOptions } from "@/lib/bookings/form"

type Props = {
  customers: BookingOptions["customers"]
  customer: string
  onCustomerChange: (customer: string) => void
  values: Record<string, string>
  onValueChange: (name: string, value: string) => void
  selectClass: string
}

export function BookingCustomerFields({ customers, customer, onCustomerChange, values, onValueChange, selectClass }: Props) {
  return <>
    <label className="grid gap-2 text-sm font-medium">Client
      <select name="customer_id" value={customer} onChange={event => onCustomerChange(event.target.value)} className={selectClass}>
        <option value="new">Nouveau client</option>
        {customers.map(item => <option key={item.id} value={item.id}>{item.first_name} {item.last_name} — {item.email}</option>)}
      </select>
    </label>
    {customer === "new" ? <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm">Prénom<Input name="first_name" value={values.first_name} onChange={event => onValueChange("first_name", event.target.value)} required maxLength={254} autoComplete="given-name" /></label>
      <label className="grid gap-2 text-sm">Nom<Input name="last_name" value={values.last_name} onChange={event => onValueChange("last_name", event.target.value)} required maxLength={254} autoComplete="family-name" /></label>
      <label className="grid gap-2 text-sm sm:col-span-2">E-mail<Input name="email" value={values.email} onChange={event => onValueChange("email", event.target.value)} type="email" required maxLength={254} autoComplete="email" /></label>
      <label className="grid gap-2 text-sm">Indicatif téléphonique<Input name="phone_country_code" value={values.phone_country_code} onChange={event => onValueChange("phone_country_code", event.target.value)} required placeholder="+596" autoComplete="tel-country-code" /></label>
      <label className="grid gap-2 text-sm">Téléphone<Input name="phone_number" value={values.phone_number} onChange={event => onValueChange("phone_number", event.target.value)} type="tel" required maxLength={30} autoComplete="tel-national" /></label>
    </div> : null}
  </>
}
