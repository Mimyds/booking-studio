"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/admin/auth"
import {
  parseExperienceForm,
  type ExperienceFormErrors,
} from "@/lib/experiences/form"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type CreateExperienceActionState = {
  error?: string
  errors?: ExperienceFormErrors
}

export type ExperienceActionState = CreateExperienceActionState

export async function createExperienceAction(
  _previousState: CreateExperienceActionState,
  formData: FormData
): Promise<CreateExperienceActionState> {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return { error: "Votre session a expiré. Reconnectez-vous pour continuer." }
  }

  const { payload, errors } = parseExperienceForm(formData)

  if (Object.keys(errors).length > 0) {
    return {
      error: "Certains champs doivent être corrigés.",
      errors,
    }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from("experiences")
    .insert([payload])
    .select("id")
    .single()

  if (error) {
    console.error("[create-experience] Supabase insert failed", {
      code: error.code,
      message: error.message,
    })

    return {
      error: "L’expérience n’a pas pu être créée. Réessayez dans un instant.",
    }
  }

  revalidatePath("/admin/experiences")
  redirect("/admin/experiences")
}
