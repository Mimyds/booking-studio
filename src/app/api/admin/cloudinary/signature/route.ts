import { getCurrentAdmin } from "@/lib/admin/auth"
import { isManagedCloudinaryFolder } from "@/lib/cloudinary/config"
import {
  getCloudinarySignature,
  validateCloudinarySignatureParams,
  type CloudinarySignatureParams,
} from "@/lib/cloudinary/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const paramsToSign = (body?.paramsToSign ?? {}) as CloudinarySignatureParams
  const validation = validateCloudinarySignatureParams(
    paramsToSign,
    isManagedCloudinaryFolder
  )

  if ("error" in validation) {
    return Response.json({ error: validation.error }, { status: 400 })
  }

  const signed = getCloudinarySignature(paramsToSign)

  if ("error" in signed) {
    return Response.json({ error: signed.error }, { status: 500 })
  }

  return Response.json({ signature: signed.signature })
}
