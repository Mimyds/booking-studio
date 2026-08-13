"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { parseAddonForm, type AddonFormErrors } from "@/lib/addons/form"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type UpdateAddonActionState = {
  error?: string
  errors?: AddonFormErrors
}

function getAddonId(formData: FormData) {
  const addonId = Number(formData.get("id"))

  return Number.isInteger(addonId) && addonId > 0 ? addonId : null
}

export async function updateAddonAction(
  _previousState: UpdateAddonActionState,
  formData: FormData
): Promise<UpdateAddonActionState> {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return { error: "Votre session a expiré. Reconnectez-vous pour continuer." }
  }

  const addonId = getAddonId(formData)

  if (!addonId) {
    return { error: "Identifiant add-on invalide." }
  }

  const { payload, errors } = parseAddonForm(formData)

  if (Object.keys(errors).length > 0) {
    return {
      error: "Certains champs doivent être corrigés.",
      errors,
    }
  }

  const supabase = await createServerSupabaseClient()
  const { data: addon, error } = await supabase
    .from("addons")
    .update(payload)
    .eq("id", addonId)
    .select("id")
    .maybeSingle()

  if (error) {
    console.error("[update-addon] Supabase update failed", {
      code: error.code,
      message: error.message,
    })

    return {
      error: "L’add-on n’a pas pu être modifié. Réessayez dans un instant.",
    }
  }

  if (!addon) {
    return { error: "L’add-on est introuvable." }
  }

  revalidatePath("/admin/add-ons")
  revalidatePath(`/admin/add-ons/${addonId}/edit`)
  redirect("/admin/add-ons")
}
