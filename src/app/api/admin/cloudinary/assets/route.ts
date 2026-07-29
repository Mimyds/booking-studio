import { getCurrentAdmin } from "@/lib/admin/auth"
import { destroyCloudinaryAsset } from "@/lib/cloudinary/server"

export const runtime = "nodejs"

export async function DELETE(request: Request) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const publicId = typeof body?.publicId === "string" ? body.publicId.trim() : ""

  if (!publicId) {
    return Response.json({ error: "Missing publicId." }, { status: 400 })
  }

  const result = await destroyCloudinaryAsset(publicId)

  if (!result.ok) {
    return Response.json(
      { error: result.error, details: result.result ?? null },
      { status: 400 }
    )
  }

  return Response.json({ ok: true, result: result.result })
}
