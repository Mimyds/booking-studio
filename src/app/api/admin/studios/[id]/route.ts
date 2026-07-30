import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { destroyCloudinaryAssets } from "@/lib/cloudinary/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type AdminStudioRouteContext = {
  params: Promise<{ id: string }>
}

function getStudioId(value: string) {
  const studioId = Number(value)

  return Number.isInteger(studioId) && studioId > 0 ? studioId : null
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
    console.error("[delete-studio] Cloudinary cleanup failed", failures)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: AdminStudioRouteContext
) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const studioId = getStudioId(id)

  if (!studioId) {
    return NextResponse.json(
      { error: "Identifiant studio invalide." },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabaseClient()
  const { data: studio, error: studioError } = await supabase
    .from("studios")
    .select("id, image_cover_public_id")
    .eq("id", studioId)
    .maybeSingle()

  if (studioError) {
    console.error("[delete-studio] Studio select failed", {
      code: studioError.code,
      message: studioError.message,
    })

    return NextResponse.json(
      { error: "Le studio n’a pas pu être chargé." },
      { status: 500 }
    )
  }

  if (!studio) {
    return NextResponse.json(
      { error: "Le studio est introuvable." },
      { status: 404 }
    )
  }

  const { data: galleryImages, error: galleryError } = await supabase
    .from("studio_gallery_images")
    .select("image_public_id")
    .eq("studio_id", studioId)

  if (galleryError) {
    console.error("[delete-studio] Gallery select failed", {
      code: galleryError.code,
      message: galleryError.message,
    })

    return NextResponse.json(
      { error: "Les images du studio n’ont pas pu être chargées." },
      { status: 500 }
    )
  }

  const publicIds = [
    studio.image_cover_public_id,
    ...(galleryImages ?? []).map((image) => image.image_public_id),
  ]
  const { data: deletedStudio, error: deleteError } = await supabase
    .from("studios")
    .delete()
    .eq("id", studioId)
    .select("id")
    .maybeSingle()

  if (deleteError) {
    console.error("[delete-studio] Supabase delete failed", {
      code: deleteError.code,
      message: deleteError.message,
    })

    if (deleteError.code === "23503") {
      return NextResponse.json(
        {
          error:
            "Ce studio ne peut pas être supprimé car il est lié à des réservations ou à des disponibilités.",
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Le studio n’a pas pu être supprimé." },
      { status: 500 }
    )
  }

  if (!deletedStudio) {
    console.error("[delete-studio] Supabase delete returned no rows", {
      studioId,
    })

    return NextResponse.json(
      {
        error:
          "Le studio n’a pas pu être supprimé. Vérifiez les permissions Supabase de suppression.",
      },
      { status: 403 }
    )
  }

  const cleanupResults = await destroyCloudinaryAssets(publicIds)

  logCloudinaryDeletionFailures(cleanupResults)

  return NextResponse.json({ ok: true })
}
