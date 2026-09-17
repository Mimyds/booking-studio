"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { cancelBookingAction } from "./actions"

export function CancelBookingForm({ id, version }: { id: number; version: number }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [state, action, pending] = useActionState(cancelBookingAction.bind(null, id, version), {})
  return (
    <section className="rounded-2xl border border-rose-200 bg-white p-6">
      <h2 className="font-bold">Annuler cette réservation</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">L’annulation libère les dates et conserve la réservation dans l’historique. Aucun remboursement n’est effectué automatiquement. La réservation annulée ne pourra plus être modifiée.</p>
      {!open ? <Button variant="destructive" className="mt-4" onClick={() => setOpen(true)}>Annuler la réservation</Button> : (
        <form action={action} className="mt-4 grid gap-4">
          {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
          <fieldset disabled={pending} className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">Motif de l’annulation<textarea name="reason" value={reason} onChange={event => setReason(event.target.value)} required minLength={3} maxLength={1000} rows={3} className="rounded-lg border border-slate-200 p-3" /></label>
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" required className="mt-1" />Je confirme l’annulation de la réservation #{id}.</label>
            <div className="flex flex-wrap gap-3"><Button variant="destructive" type="submit" disabled={pending}>{pending ? "Annulation…" : "Confirmer l’annulation"}</Button><Button variant="outline" type="button" onClick={() => setOpen(false)}>Conserver la réservation</Button></div>
          </fieldset>
        </form>
      )}
    </section>
  )
}
