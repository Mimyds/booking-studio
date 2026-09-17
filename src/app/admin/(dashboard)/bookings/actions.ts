"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { parseBookingForm } from "@/lib/bookings/form"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type BookingActionState = { error?: string }

export async function saveBookingAction(id: number | null, version: number | null, _state: BookingActionState, form: FormData): Promise<BookingActionState> {
  if (!(await getCurrentAdmin())) return { error: "Votre session a expiré. Reconnectez-vous." }
  const parsed = parseBookingForm(form, { allowMinimumStayOverride: true })
  if (parsed.error || !parsed.payload) return { error: parsed.error }
  return mutateBooking(id ? "update" : "create", id, version, parsed.payload)
}

export async function cancelBookingAction(id: number, version: number, _state: BookingActionState, form: FormData): Promise<BookingActionState> {
  if (!(await getCurrentAdmin())) return { error: "Votre session a expiré. Reconnectez-vous." }
  const reason = String(form.get("reason") ?? "").trim()
  if (reason.length < 3 || reason.length > 1000) return { error: "Indiquez un motif de 3 à 1 000 caractères." }
  if (form.get("confirm") !== "on") return { error: "Confirmez l’annulation pour continuer." }
  return mutateBooking("cancel", id, version, { reason })
}

async function mutateBooking(action: string, id: number | null, version: number | null, payload: Record<string, string | number | boolean>): Promise<BookingActionState> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.rpc("admin_save_booking", { p_action: action, p_booking_id: id, p_version: version, p_payload: payload })
  if (error) {
    if (error.code === "PGRST202") return { error: "La gestion des réservations doit encore être activée dans la base de données. Contactez le responsable du site." }
    if (error.code === "23P01") return { error: "La disponibilité a changé. Choisissez d’autres dates." }
    if (error.code === "P0001") return { error: error.message }
    console.error("[admin-bookings] Mutation failed", { code: error.code })
    return { error: "La réservation n’a pas pu être enregistrée. Veuillez réessayer." }
  }
  revalidatePath("/admin")
  revalidatePath("/admin/bookings")
  revalidatePath(`/admin/bookings/${data}/edit`)
  redirect(`/admin/bookings/${data}/edit?success=${action}`)
}
