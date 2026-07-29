const cloudinaryRootFolder = "booking-studio"

function normalizeFolderSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const cloudinaryFolders = {
  studioCover(slug: string) {
    return `${cloudinaryRootFolder}/studios/${normalizeFolderSegment(slug)}/cover`
  },
  studioGallery(slug: string) {
    return `${cloudinaryRootFolder}/studios/${normalizeFolderSegment(slug)}/gallery`
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

export function isPublicIdInFolder(publicId: string, folder: string) {
  return publicId.trim().startsWith(`${folder}/`)
}
