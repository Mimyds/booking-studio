const cloudinaryRootFolder = "booking-studio"

function normalizeFolderSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const cloudinaryFolders = {
  studioCover(folderId: string) {
    return `${cloudinaryRootFolder}/studios/${normalizeFolderSegment(folderId)}/cover`
  },
  studioGallery(folderId: string) {
    return `${cloudinaryRootFolder}/studios/${normalizeFolderSegment(folderId)}/gallery`
  },
}

export const cloudinaryUploadOptions = {
  allowedFormats: ["avif", "jpeg", "jpg", "png", "webp"],
  maxFileSize: 10_000_000,
  sources: ["local", "url", "camera"] as const,
}

export function isManagedCloudinaryFolder(folder: string) {
  return /^booking-studio\/studios\/[a-z0-9]+(?:-[a-z0-9]+)*\/(?:cover|gallery)$/.test(
    folder
  )
}

export function isManagedCloudinaryPublicId(publicId: string) {
  return /^booking-studio\/studios\/[a-z0-9]+(?:-[a-z0-9]+)*\/(?:cover|gallery)\/[^/]+$/.test(
    publicId.trim()
  )
}

export function getStudioCloudinaryFolderId(publicId: string) {
  const match = publicId
    .trim()
    .match(
      /^booking-studio\/studios\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(?:cover|gallery)\/[^/]+$/
    )

  return match?.[1] ?? null
}

export function isPublicIdInFolder(publicId: string, folder: string) {
  return publicId.trim().startsWith(`${folder}/`)
}
