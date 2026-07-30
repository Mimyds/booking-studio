"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { destroyCloudinaryAssets } from "@/lib/cloudinary/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { parseStudioForm, type StudioFormErrors } from "@/lib/studios/form"

export type CreateStudioActionState = {
  error?: string
  errors?: StudioFormErrors
}

async function rollbackCreatedStudio(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  studioId: number
) {
  const { error: rollbackError } = await supabase
    .from("studios")
    .delete()
    .eq("id", studioId)

  if (rollbackError) {
    console.error("[create-studio] Studio rollback failed", {
      code: rollbackError.code,
      message: rollbackError.message,
    })
  }
}

export async function createStudioAction(
  _previousState: CreateStudioActionState,
  formData: FormData
): Promise<CreateStudioActionState> {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return { error: "Votre session a expiré. Reconnectez-vous pour continuer." }
  }

  const { payload, galleryImages, amenityIds, errors } = parseStudioForm(formData)

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
      const { data: existingStudio } = await supabase
        .from("studios")
        .select("id")
        .eq("slug", payload.slug)
        .maybeSingle()

      if (existingStudio) {
        revalidatePath("/admin/studios")
        revalidatePath("/studios")
        redirect("/admin/studios")
      }

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

      await rollbackCreatedStudio(supabase, studio.id)

      await destroyCloudinaryAssets([
        payload.image_cover_public_id,
        ...galleryImages.map((image) => image.image_public_id),
      ])

      return {
        error:
          "Les images de galerie n’ont pas pu être enregistrées. Le studio n’a pas été créé.",
      }
    }
  }

  if (amenityIds.length > 0) {
    const { error: amenityError } = await supabase
      .from("studio_amenities")
      .insert(
        amenityIds.map((amenityId) => ({
          studio_id: studio.id,
          amenity_id: amenityId,
        }))
      )

    if (amenityError) {
      console.error("[create-studio] Amenities insert failed", {
        code: amenityError.code,
        message: amenityError.message,
      })

      await rollbackCreatedStudio(supabase, studio.id)

      await destroyCloudinaryAssets([
        payload.image_cover_public_id,
        ...galleryImages.map((image) => image.image_public_id),
      ])

      return {
        error:
          "Les équipements n’ont pas pu être enregistrés. Le studio n’a pas été créé.",
      }
    }
  }

  revalidatePath("/admin/studios")
  revalidatePath("/studios")
  redirect("/admin/studios")
}
