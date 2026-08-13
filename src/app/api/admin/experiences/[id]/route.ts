import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/admin/auth"
import {
  destroyCloudinaryAssets,
  destroyExperienceCloudinaryFolders,
} from "@/lib/cloudinary/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type AdminExperienceRouteContext = {
  params: Promise<{ id: string }>
}

function getExperienceId(value: string) {
  const experienceId = Number(value)

  return Number.isInteger(experienceId) && experienceId > 0 ? experienceId : null
}

function logCloudinaryDeletionFailures(
  results: Awaited<ReturnType<typeof destroyCloudinaryAssets>>
) {
  const failures = results.filter(({ result }) => {
    if (result.status === "rejected") {
      return true
    }

    return !result.value.ok
  })

  if (failures.length > 0) {
    console.error("[delete-experience] Cloudinary cleanup failed", failures)
  }
}

function logCloudinaryFolderDeletionFailures(
  results: Awaited<ReturnType<typeof destroyExperienceCloudinaryFolders>>
) {
  const failures = results.filter(({ result }) => !result.ok)

  if (failures.length > 0) {
    console.error(
      "[delete-experience] Cloudinary folder cleanup failed",
      failures
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: AdminExperienceRouteContext
) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const experienceId = getExperienceId(id)

  if (!experienceId) {
    return NextResponse.json(
      { error: "Identifiant expérience invalide." },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabaseClient()
  const { data: experience, error: experienceError } = await supabase
    .from("experiences")
    .select("id, cover_image_public_id, thumbnail_image_public_id")
    .eq("id", experienceId)
    .maybeSingle()

  if (experienceError) {
    console.error("[delete-experience] Experience select failed", {
      code: experienceError.code,
      message: experienceError.message,
    })

    return NextResponse.json(
      { error: "L’expérience n’a pas pu être chargée." },
      { status: 500 }
    )
  }

  if (!experience) {
    return NextResponse.json(
      { error: "L’expérience est introuvable." },
      { status: 404 }
    )
  }

  const { data: deletedExperience, error: deleteError } = await supabase
    .from("experiences")
    .delete()
    .eq("id", experienceId)
    .select("id")
    .maybeSingle()

  if (deleteError) {
    console.error("[delete-experience] Supabase delete failed", {
      code: deleteError.code,
      message: deleteError.message,
    })

    if (deleteError.code === "23503") {
      return NextResponse.json(
        {
          error:
            "Cette expérience ne peut pas être supprimée car elle est liée à des données existantes.",
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "L’expérience n’a pas pu être supprimée." },
      { status: 500 }
    )
  }

  if (!deletedExperience) {
    return NextResponse.json(
      {
        error:
          "L’expérience n’a pas pu être supprimée. Vérifiez les permissions Supabase de suppression.",
      },
      { status: 403 }
    )
  }

  const publicIds = [
    experience.cover_image_public_id,
    experience.thumbnail_image_public_id,
  ]
  const cleanupResults = await destroyCloudinaryAssets(publicIds)
  const folderCleanupResults = await destroyExperienceCloudinaryFolders(publicIds)

  logCloudinaryDeletionFailures(cleanupResults)
  logCloudinaryFolderDeletionFailures(folderCleanupResults)

  return NextResponse.json({ ok: true })
}
