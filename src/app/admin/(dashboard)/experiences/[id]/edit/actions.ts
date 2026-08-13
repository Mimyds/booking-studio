"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/admin/auth"
import {
  destroyCloudinaryAssets,
  destroyExperienceCloudinaryFolders,
} from "@/lib/cloudinary/server"
import {
  parseExperienceForm,
  type ExperienceFormErrors,
} from "@/lib/experiences/form"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type UpdateExperienceActionState = {
  error?: string
  errors?: ExperienceFormErrors
}

function getExperienceId(formData: FormData) {
  const experienceId = Number(formData.get("id"))

  return Number.isInteger(experienceId) && experienceId > 0 ? experienceId : null
}

function getRemovedPublicIds(previousPublicIds: string[], nextPublicIds: string[]) {
  const nextPublicIdsSet = new Set(nextPublicIds)

  return previousPublicIds.filter((publicId) => !nextPublicIdsSet.has(publicId))
}

async function cleanupRemovedExperienceImages(publicIds: string[]) {
  if (publicIds.length === 0) {
    return
  }

  const assetResults = await destroyCloudinaryAssets(publicIds)
  const assetFailures = assetResults.filter(({ result }) => {
    if (result.status === "rejected") {
      return true
    }

    return !result.value.ok
  })

  if (assetFailures.length > 0) {
    console.error("[update-experience] Cloudinary cleanup failed", assetFailures)
  }

  const folderResults = await destroyExperienceCloudinaryFolders(publicIds)
  const folderFailures = folderResults.filter(({ result }) => !result.ok)

  if (folderFailures.length > 0) {
    console.error(
      "[update-experience] Cloudinary folder cleanup failed",
      folderFailures
    )
  }
}

export async function updateExperienceAction(
  _previousState: UpdateExperienceActionState,
  formData: FormData
): Promise<UpdateExperienceActionState> {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return { error: "Votre session a expiré. Reconnectez-vous pour continuer." }
  }

  const experienceId = getExperienceId(formData)

  if (!experienceId) {
    return { error: "Identifiant expérience invalide." }
  }

  const { payload, errors } = parseExperienceForm(formData)

  if (Object.keys(errors).length > 0) {
    return {
      error: "Certains champs doivent être corrigés.",
      errors,
    }
  }

  const supabase = await createServerSupabaseClient()
  const { data: existingExperience, error: existingExperienceError } =
    await supabase
      .from("experiences")
      .select("id, cover_image_public_id, thumbnail_image_public_id")
      .eq("id", experienceId)
      .maybeSingle()

  if (existingExperienceError) {
    console.error("[update-experience] Supabase select failed", {
      code: existingExperienceError.code,
      message: existingExperienceError.message,
    })

    return { error: "L’expérience n’a pas pu être chargée." }
  }

  if (!existingExperience) {
    return { error: "L’expérience est introuvable." }
  }

  const previousPublicIds = [
    existingExperience.cover_image_public_id,
    existingExperience.thumbnail_image_public_id,
  ].filter((publicId): publicId is string => Boolean(publicId))
  const nextPublicIds = [
    payload.cover_image_public_id,
    payload.thumbnail_image_public_id,
  ].filter((publicId): publicId is string => Boolean(publicId))
  const removedPublicIds = getRemovedPublicIds(previousPublicIds, nextPublicIds)
  const { data: experience, error } = await supabase
    .from("experiences")
    .update(payload)
    .eq("id", experienceId)
    .select("id")
    .maybeSingle()

  if (error) {
    console.error("[update-experience] Supabase update failed", {
      code: error.code,
      message: error.message,
    })

    return {
      error: "L’expérience n’a pas pu être modifiée. Réessayez dans un instant.",
    }
  }

  if (!experience) {
    return { error: "L’expérience est introuvable." }
  }

  await cleanupRemovedExperienceImages(removedPublicIds)

  revalidatePath("/admin/experiences")
  revalidatePath(`/admin/experiences/${experienceId}/edit`)
  redirect("/admin/experiences")
}
