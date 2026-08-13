"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { parseAddonForm, type AddonFormErrors } from "@/lib/addons/form"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type CreateAddonActionState = {
  error?: string
  errors?: AddonFormErrors
}

export type AddonActionState = CreateAddonActionState

export async function createAddonAction(
  _previousState: CreateAddonActionState,
  formData: FormData
): Promise<CreateAddonActionState> {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return { error: "Votre session a expiré. Reconnectez-vous pour continuer." }
  }

  const { payload, errors } = parseAddonForm(formData)

  if (Object.keys(errors).length > 0) {
    return {
      error: "Certains champs doivent être corrigés.",
      errors,
    }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from("addons")
    .insert([payload])
    .select("id")
    .single()

  if (error) {
    console.error("[create-addon] Supabase insert failed", {
      code: error.code,
      message: error.message,
    })

    return {
      error: "L’add-on n’a pas pu être créé. Réessayez dans un instant.",
    }
  }

  revalidatePath("/admin/add-ons")
  redirect("/admin/add-ons")
}
