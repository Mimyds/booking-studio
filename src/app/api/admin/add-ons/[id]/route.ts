import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/admin/auth"
import {
  destroyAddonCloudinaryFolders,
  destroyCloudinaryAssets,
} from "@/lib/cloudinary/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type AdminAddonRouteContext = {
  params: Promise<{ id: string }>
}

function getAddonId(value: string) {
  const addonId = Number(value)

  return Number.isInteger(addonId) && addonId > 0 ? addonId : null
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
    console.error("[delete-addon] Cloudinary cleanup failed", failures)
  }
}

function logCloudinaryFolderDeletionFailures(
  results: Awaited<ReturnType<typeof destroyAddonCloudinaryFolders>>
) {
  const failures = results.filter(({ result }) => !result.ok)

  if (failures.length > 0) {
    console.error("[delete-addon] Cloudinary folder cleanup failed", failures)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: AdminAddonRouteContext
) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const addonId = getAddonId(id)

  if (!addonId) {
    return NextResponse.json(
      { error: "Identifiant add-on invalide." },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabaseClient()
  const { data: addon, error: addonError } = await supabase
    .from("addons")
    .select("id, cloudinary_public_id")
    .eq("id", addonId)
    .maybeSingle()

  if (addonError) {
    console.error("[delete-addon] Add-on select failed", {
      code: addonError.code,
      message: addonError.message,
    })

    return NextResponse.json(
      { error: "L’add-on n’a pas pu être chargé." },
      { status: 500 }
    )
  }

  if (!addon) {
    return NextResponse.json(
      { error: "L’add-on est introuvable." },
      { status: 404 }
    )
  }

  const { data: deletedAddon, error: deleteError } = await supabase
    .from("addons")
    .delete()
    .eq("id", addonId)
    .select("id")
    .maybeSingle()

  if (deleteError) {
    console.error("[delete-addon] Supabase delete failed", {
      code: deleteError.code,
      message: deleteError.message,
    })

    if (deleteError.code === "23503") {
      return NextResponse.json(
        {
          error:
            "Cet add-on ne peut pas être supprimé car il est lié à des réservations, promotions ou studios.",
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "L’add-on n’a pas pu être supprimé." },
      { status: 500 }
    )
  }

  if (!deletedAddon) {
    return NextResponse.json(
      {
        error:
          "L’add-on n’a pas pu être supprimé. Vérifiez les permissions Supabase de suppression.",
      },
      { status: 403 }
    )
  }

  const cleanupResults = await destroyCloudinaryAssets([
    addon.cloudinary_public_id,
  ])
  const folderCleanupResults = await destroyAddonCloudinaryFolders(
    addon.cloudinary_public_id
  )

  logCloudinaryDeletionFailures(cleanupResults)
  logCloudinaryFolderDeletionFailures(folderCleanupResults)

  return NextResponse.json({ ok: true })
}
