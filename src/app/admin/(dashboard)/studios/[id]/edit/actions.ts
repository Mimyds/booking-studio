"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { destroyCloudinaryAssets } from "@/lib/cloudinary/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { parseStudioForm } from "@/lib/studios/form"
import type { CreateStudioActionState } from "../../new/actions"

function getRemovedPublicIds(previousPublicIds: string[], nextPublicIds: string[]) {
  const nextPublicIdsSet = new Set(nextPublicIds)

  return previousPublicIds.filter((publicId) => !nextPublicIdsSet.has(publicId))
}

function getAddedIds(previousIds: number[], nextIds: number[]) {
  const previousIdsSet = new Set(previousIds)

  return nextIds.filter((id) => !previousIdsSet.has(id))
}

function getRemovedIds(previousIds: number[], nextIds: number[]) {
  const nextIdsSet = new Set(nextIds)

  return previousIds.filter((id) => !nextIdsSet.has(id))
}

export async function updateStudioAction(
  studioId: number,
  _previousState: CreateStudioActionState,
  formData: FormData
): Promise<CreateStudioActionState> {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return { error: "Votre session a expiré. Reconnectez-vous pour continuer." }
  }

  if (!Number.isInteger(studioId) || studioId < 1) {
    return { error: "Le studio est introuvable." }
  }

  const { payload, galleryImages, amenityIds, addonIds, errors } =
    parseStudioForm(formData)

  if (Object.keys(errors).length > 0) {
    return {
      error: "Certains champs doivent être corrigés.",
      errors,
    }
  }

  const supabase = await createServerSupabaseClient()
  const { data: existingStudio, error: existingStudioError } = await supabase
    .from("studios")
    .select("id, slug, image_cover_public_id")
    .eq("id", studioId)
    .maybeSingle()

  if (existingStudioError || !existingStudio) {
    return { error: "Le studio est introuvable." }
  }

  const { data: existingGalleryData, error: existingGalleryError } =
    await supabase
      .from("studio_gallery_images")
      .select("image_public_id")
      .eq("studio_id", studioId)

  if (existingGalleryError) {
    console.error("[update-studio] Gallery select failed", {
      code: existingGalleryError.code,
      message: existingGalleryError.message,
    })

    return {
      error: "Les images de galerie n’ont pas pu être chargées.",
    }
  }

  const { data: existingAmenityData, error: existingAmenityError } =
    await supabase
      .from("studio_amenities")
      .select("amenity_id")
      .eq("studio_id", studioId)

  if (existingAmenityError) {
    console.error("[update-studio] Amenities select failed", {
      code: existingAmenityError.code,
      message: existingAmenityError.message,
    })

    return {
      error: "Les équipements du studio n’ont pas pu être chargés.",
    }
  }

  const { data: existingAddonData, error: existingAddonError } = await supabase
    .from("studio_addons")
    .select("addon_id")
    .eq("studio_id", studioId)

  if (existingAddonError) {
    console.error("[update-studio] Add-ons select failed", {
      code: existingAddonError.code,
      message: existingAddonError.message,
    })

    return {
      error: "Les add-ons du studio n’ont pas pu être chargés.",
    }
  }

  const previousPublicIds = [
    existingStudio.image_cover_public_id,
    ...(existingGalleryData ?? []).map((image) => image.image_public_id),
  ].filter((publicId): publicId is string => Boolean(publicId))
  const nextPublicIds = [
    payload.image_cover_public_id,
    ...galleryImages.map((image) => image.image_public_id),
  ].filter((publicId): publicId is string => Boolean(publicId))

  const { data: updatedStudios, error: studioUpdateError } = await supabase
    .from("studios")
    .update(payload)
    .eq("id", studioId)
    .select("id")

  if (studioUpdateError) {
    console.error("[update-studio] Supabase update failed", {
      code: studioUpdateError.code,
      message: studioUpdateError.message,
    })

    await destroyCloudinaryAssets(
      getRemovedPublicIds(nextPublicIds, previousPublicIds)
    )

    if (studioUpdateError.code === "23505") {
      return {
        error: "Ce slug est déjà utilisé par un autre studio.",
        errors: { slug: "Choisissez un slug unique." },
      }
    }

    return {
      error: "Le studio n’a pas pu être mis à jour. Réessayez dans un instant.",
    }
  }

  if (!updatedStudios || updatedStudios.length === 0) {
    console.error("[update-studio] Supabase update returned no rows", {
      studioId,
    })

    await destroyCloudinaryAssets(
      getRemovedPublicIds(nextPublicIds, previousPublicIds)
    )

    return {
      error:
        "Le studio n’a pas pu être mis à jour. Vérifiez les permissions Supabase de modification.",
    }
  }

  if (galleryImages.length > 0) {
    const { error: galleryUpsertError } = await supabase
      .from("studio_gallery_images")
      .upsert(
        galleryImages.map((image) => ({
          ...image,
          studio_id: studioId,
        })),
        { onConflict: "studio_id,image_public_id" }
      )

    if (galleryUpsertError) {
      console.error("[update-studio] Gallery upsert failed", {
        code: galleryUpsertError.code,
        message: galleryUpsertError.message,
      })

      await destroyCloudinaryAssets(
        getRemovedPublicIds(nextPublicIds, previousPublicIds)
      )

      return {
        error: "Les images de galerie n’ont pas pu être mises à jour.",
      }
    }
  }

  const nextGalleryPublicIds = galleryImages.map((image) => image.image_public_id)
  const previousGalleryPublicIds = (existingGalleryData ?? []).map(
    (image) => image.image_public_id
  )
  const removedGalleryPublicIds = getRemovedPublicIds(
    previousGalleryPublicIds,
    nextGalleryPublicIds
  )
  const removedCoverPublicIds = existingStudio.image_cover_public_id
    ? getRemovedPublicIds(
        [existingStudio.image_cover_public_id],
        payload.image_cover_public_id ? [payload.image_cover_public_id] : []
      )
    : []

  if (removedGalleryPublicIds.length > 0) {
    const { error: galleryDeleteError } = await supabase
      .from("studio_gallery_images")
      .delete()
      .eq("studio_id", studioId)
      .in("image_public_id", removedGalleryPublicIds)

    if (galleryDeleteError) {
      console.error("[update-studio] Gallery delete failed", {
        code: galleryDeleteError.code,
        message: galleryDeleteError.message,
      })

      return {
        error: "Les images retirées n’ont pas pu être supprimées.",
      }
    }
  }

  const previousAmenityIds = (existingAmenityData ?? []).map(
    (amenity) => amenity.amenity_id
  )
  const addedAmenityIds = getAddedIds(previousAmenityIds, amenityIds)
  const removedAmenityIds = getRemovedIds(previousAmenityIds, amenityIds)

  if (removedAmenityIds.length > 0) {
    const { error: amenityDeleteError } = await supabase
      .from("studio_amenities")
      .delete()
      .eq("studio_id", studioId)
      .in("amenity_id", removedAmenityIds)

    if (amenityDeleteError) {
      console.error("[update-studio] Amenities delete failed", {
        code: amenityDeleteError.code,
        message: amenityDeleteError.message,
      })

      return {
        error: "Les équipements retirés n’ont pas pu être enregistrés.",
      }
    }
  }

  if (addedAmenityIds.length > 0) {
    const { error: amenityInsertError } = await supabase
      .from("studio_amenities")
      .insert(
        addedAmenityIds.map((amenityId) => ({
          studio_id: studioId,
          amenity_id: amenityId,
        }))
      )

    if (amenityInsertError) {
      console.error("[update-studio] Amenities insert failed", {
        code: amenityInsertError.code,
        message: amenityInsertError.message,
      })

      return {
        error: "Les équipements ajoutés n’ont pas pu être enregistrés.",
      }
    }
  }

  const previousAddonIds = (existingAddonData ?? []).map((addon) => addon.addon_id)
  const addedAddonIds = getAddedIds(previousAddonIds, addonIds)
  const removedAddonIds = getRemovedIds(previousAddonIds, addonIds)

  if (removedAddonIds.length > 0) {
    const { error: addonDeleteError } = await supabase
      .from("studio_addons")
      .delete()
      .eq("studio_id", studioId)
      .in("addon_id", removedAddonIds)

    if (addonDeleteError) {
      console.error("[update-studio] Add-ons delete failed", {
        code: addonDeleteError.code,
        message: addonDeleteError.message,
      })

      return {
        error: "Les add-ons retirés n’ont pas pu être enregistrés.",
      }
    }
  }

  if (addedAddonIds.length > 0) {
    const { error: addonInsertError } = await supabase
      .from("studio_addons")
      .insert(
        addedAddonIds.map((addonId) => ({
          studio_id: studioId,
          addon_id: addonId,
        }))
      )

    if (addonInsertError) {
      console.error("[update-studio] Add-ons insert failed", {
        code: addonInsertError.code,
        message: addonInsertError.message,
      })

      return {
        error: "Les add-ons ajoutés n’ont pas pu être enregistrés.",
      }
    }
  }

  await destroyCloudinaryAssets([
    ...removedCoverPublicIds,
    ...removedGalleryPublicIds,
  ])

  revalidatePath("/admin/studios")
  revalidatePath("/studios")
  revalidatePath(`/studios/${payload.slug}`)
  revalidatePath(`/studios/${existingStudio.slug}`)
  redirect("/admin/studios")
}
