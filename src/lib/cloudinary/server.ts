import crypto from "crypto"
import {
  getAddonCloudinaryFolderPaths,
  getExperienceCloudinaryFolderPaths,
  isManagedCloudinaryFolder,
  isManagedCloudinaryPublicId,
} from "@/lib/cloudinary/config"

type CloudinaryAdminConfig = {
  apiKey: string
  apiSecret: string
  cloudName: string
}

type CloudinarySignatureValue = string | number | string[]
export type CloudinarySignatureParams = Record<
  string,
  CloudinarySignatureValue | null | undefined
>

const allowedSignatureParams = new Set([
  "context",
  "folder",
  "metadata",
  "public_id",
  "source",
  "tags",
  "timestamp",
])

function getCloudinaryAdminConfig(): CloudinaryAdminConfig | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey =
    process.env.CLOUDINARY_API_KEY ?? process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return null
  }

  return { apiKey, apiSecret, cloudName }
}

export function buildCloudinarySignatureString(
  params: CloudinarySignatureParams
) {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.join(",")] as const
      }

      return [key, String(value)] as const
    })
    .sort(([a], [b]) => a.localeCompare(b))

  return entries.map(([key, value]) => `${key}=${value}`).join("&")
}

export function signCloudinaryParams(
  params: CloudinarySignatureParams,
  apiSecret: string
) {
  return crypto
    .createHash("sha1")
    .update(buildCloudinarySignatureString(params) + apiSecret)
    .digest("hex")
}

export function validateCloudinarySignatureParams(
  params: CloudinarySignatureParams,
  isAllowedFolder: (folder: string) => boolean
) {
  const keys = Object.keys(params)
  const invalidKey = keys.find((key) => !allowedSignatureParams.has(key))

  if (invalidKey) {
    return { error: `Unsupported Cloudinary signature parameter: ${invalidKey}` }
  }

  const folder = typeof params.folder === "string" ? params.folder.trim() : ""

  if (!folder || !isAllowedFolder(folder)) {
    return { error: "Invalid Cloudinary upload folder." }
  }

  const timestamp = Number(params.timestamp)
  const now = Math.floor(Date.now() / 1000)

  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > 600) {
    return { error: "Invalid Cloudinary upload timestamp." }
  }

  return { folder }
}

export function getCloudinarySignature(params: CloudinarySignatureParams) {
  const config = getCloudinaryAdminConfig()

  if (!config) {
    return { error: "Missing Cloudinary server configuration." }
  }

  return {
    signature: signCloudinaryParams(params, config.apiSecret),
  }
}

export async function destroyCloudinaryAsset(publicId: string) {
  const config = getCloudinaryAdminConfig()

  if (!config) {
    return { ok: false, error: "Missing Cloudinary server configuration." }
  }

  if (!isManagedCloudinaryPublicId(publicId)) {
    return { ok: false, error: "Invalid Cloudinary public_id." }
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signature = signCloudinaryParams(
    { public_id: publicId, timestamp },
    config.apiSecret
  )
  const formData = new URLSearchParams({
    api_key: config.apiKey,
    public_id: publicId,
    signature,
    timestamp: String(timestamp),
  })
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
    {
      method: "POST",
      body: formData,
    }
  )
  const result = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    return { ok: false, error: "Cloudinary asset deletion failed.", result }
  }

  return { ok: true, result }
}

export async function destroyCloudinaryFolder(folder: string) {
  const config = getCloudinaryAdminConfig()
  const normalizedFolder = folder.trim()

  if (!config) {
    return { ok: false, error: "Missing Cloudinary server configuration." }
  }

  if (!isManagedCloudinaryFolder(normalizedFolder)) {
    return { ok: false, error: "Invalid Cloudinary folder." }
  }

  const credentials = Buffer.from(
    `${config.apiKey}:${config.apiSecret}`
  ).toString("base64")
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/folders/${encodeURIComponent(
      normalizedFolder
    )}`,
    {
      method: "DELETE",
      headers: {
        authorization: `Basic ${credentials}`,
      },
    }
  )
  const result = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    return { ok: false, error: "Cloudinary folder deletion failed.", result }
  }

  return { ok: true, result }
}

export async function destroyAddonCloudinaryFolders(publicId: string | null) {
  if (!publicId) {
    return []
  }

  const folders = getAddonCloudinaryFolderPaths(publicId)
  const results = []

  for (const folder of folders) {
    const result = await destroyCloudinaryFolder(folder)

    results.push({ folder, result })
  }

  return results
}

export async function destroyExperienceCloudinaryFolders(
  publicIds: Array<string | null>
) {
  const managedPublicIds = publicIds.filter(
    (publicId): publicId is string => Boolean(publicId)
  )

  if (managedPublicIds.length === 0) {
    return []
  }

  const folders = getExperienceCloudinaryFolderPaths(managedPublicIds)
  const results = []

  for (const folder of folders) {
    const result = await destroyCloudinaryFolder(folder)

    results.push({ folder, result })
  }

  return results
}

export async function destroyCloudinaryAssets(publicIds: Array<string | null>) {
  const uniquePublicIds = Array.from(
    new Set(publicIds.filter((publicId): publicId is string => Boolean(publicId)))
  )

  const results = await Promise.allSettled(
    uniquePublicIds.map((publicId) => destroyCloudinaryAsset(publicId))
  )

  return results.map((result, index) => ({
    publicId: uniquePublicIds[index],
    result,
  }))
}
