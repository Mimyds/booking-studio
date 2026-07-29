"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { parseStudioForm, type StudioFormErrors } from "@/lib/studios/form"

export type CreateStudioActionState = {
  error?: string
  errors?: StudioFormErrors
}

export async function createStudioAction(
  _previousState: CreateStudioActionState,
  formData: FormData
): Promise<CreateStudioActionState> {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return { error: "Votre session a expiré. Reconnectez-vous pour continuer." }
  }

  const { payload, galleryImages, errors } = parseStudioForm(formData)

  if (Object.keys(errors).length > 0) {
    return {
      error: "Certains champs doivent être corrigés.",
      errors,
    }
  }

  const supabase = await createServerSupabaseClient()
  const { data: studio, error } = await supabase
    .from("studios")
    .insert([payload])
    .select("id")
    .single()

  if (error) {
    console.error("[create-studio] Supabase insert failed", {
      code: error.code,
      message: error.message,
    })

    if (error.code === "23505") {
      return {
        error: "Ce slug est déjà utilisé par un autre studio.",
        errors: { slug: "Choisissez un slug unique." },
      }
    }

    return {
      error: "Le studio n’a pas pu être créé. Réessayez dans un instant.",
    }
  }

  if (galleryImages.length > 0) {
    const { error: galleryError } = await supabase
      .from("studio_gallery_images")
      .insert(
        galleryImages.map((image) => ({
          ...image,
          studio_id: studio.id,
        }))
      )

    if (galleryError) {
      console.error("[create-studio] Gallery insert failed", {
        code: galleryError.code,
        message: galleryError.message,
      })

      const { error: rollbackError } = await supabase
        .from("studios")
        .delete()
        .eq("id", studio.id)

      if (rollbackError) {
        console.error("[create-studio] Studio rollback failed", {
          code: rollbackError.code,
          message: rollbackError.message,
        })
      }

      return {
        error:
          "Les images de galerie n’ont pas pu être enregistrées. Le studio n’a pas été créé.",
      }
    }
  }

  revalidatePath("/admin/studios")
  revalidatePath("/studios")
  redirect("/admin/studios")
}
