const cloudinaryRootFolder = "booking-studio"

function normalizeFolderSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const cloudinaryFolders = {
  addonImage(folderId: string) {
    return `${cloudinaryRootFolder}/add-ons/${normalizeFolderSegment(folderId)}/image`
  },
  experienceCover(folderId: string) {
    return `${cloudinaryRootFolder}/experiences/${normalizeFolderSegment(folderId)}/cover`
  },
  experienceThumbnail(folderId: string) {
    return `${cloudinaryRootFolder}/experiences/${normalizeFolderSegment(folderId)}/thumbnail`
  },
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
  const normalizedFolder = folder.trim()

  return (
    /^booking-studio\/studios\/[a-z0-9]+(?:-[a-z0-9]+)*\/(?:cover|gallery)$/.test(
      normalizedFolder
    ) ||
    /^booking-studio\/add-ons\/[a-z0-9]+(?:-[a-z0-9]+)*\/image$/.test(
      normalizedFolder
    ) ||
    /^booking-studio\/add-ons\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      normalizedFolder
    ) ||
    /^booking-studio\/experiences\/[a-z0-9]+(?:-[a-z0-9]+)*\/(?:cover|thumbnail)$/.test(
      normalizedFolder
    ) ||
    /^booking-studio\/experiences\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      normalizedFolder
    )
  )
}

export function isManagedStudioCloudinaryPublicId(publicId: string) {
  return /^booking-studio\/studios\/[a-z0-9]+(?:-[a-z0-9]+)*\/(?:cover|gallery)\/[^/]+$/.test(
    publicId.trim()
  )
}

export function isManagedAddonCloudinaryPublicId(publicId: string) {
  return /^booking-studio\/add-ons\/[a-z0-9]+(?:-[a-z0-9]+)*\/image\/[^/]+$/.test(
    publicId.trim()
  )
}

export function isManagedExperienceCloudinaryPublicId(publicId: string) {
  return /^booking-studio\/experiences\/[a-z0-9]+(?:-[a-z0-9]+)*\/(?:cover|thumbnail)\/[^/]+$/.test(
    publicId.trim()
  )
}

export function isManagedCloudinaryPublicId(publicId: string) {
  return (
    isManagedStudioCloudinaryPublicId(publicId) ||
    isManagedAddonCloudinaryPublicId(publicId) ||
    isManagedExperienceCloudinaryPublicId(publicId)
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

export function getAddonCloudinaryFolderId(publicId: string) {
  const match = publicId
    .trim()
    .match(
      /^booking-studio\/add-ons\/([a-z0-9]+(?:-[a-z0-9]+)*)\/image\/[^/]+$/
    )

  return match?.[1] ?? null
}

export function getExperienceCloudinaryFolderId(publicId: string) {
  const match = publicId
    .trim()
    .match(
      /^booking-studio\/experiences\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(?:cover|thumbnail)\/[^/]+$/
    )

  return match?.[1] ?? null
}

export function getAddonCloudinaryFolderPaths(publicId: string) {
  const folderId = getAddonCloudinaryFolderId(publicId)

  if (!folderId) {
    return []
  }

  const addonFolder = `${cloudinaryRootFolder}/add-ons/${folderId}`

  return [`${addonFolder}/image`, addonFolder]
}

export function getExperienceCloudinaryFolderPaths(publicIds: string[]) {
  const folderIds = new Set<string>()

  for (const publicId of publicIds) {
    const folderId = getExperienceCloudinaryFolderId(publicId)

    if (folderId) {
      folderIds.add(folderId)
    }
  }

  return Array.from(folderIds).flatMap((folderId) => {
    const experienceFolder = `${cloudinaryRootFolder}/experiences/${folderId}`

    return [
      `${experienceFolder}/cover`,
      `${experienceFolder}/thumbnail`,
      experienceFolder,
    ]
  })
}

export function isPublicIdInFolder(publicId: string, folder: string) {
  return publicId.trim().startsWith(`${folder}/`)
}
