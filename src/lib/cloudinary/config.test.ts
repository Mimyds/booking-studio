import { describe, expect, it } from "vitest"
import {
  cloudinaryFolders,
  getStudioCloudinaryFolderId,
  isManagedCloudinaryFolder,
  isManagedCloudinaryPublicId,
} from "@/lib/cloudinary/config"

describe("cloudinaryFolders", () => {
  it("builds studio folders from stable folder ids", () => {
    expect(cloudinaryFolders.studioCover("studio-42")).toBe(
      "booking-studio/studios/studio-42/cover"
    )
    expect(
      cloudinaryFolders.studioGallery("6598ab8b-ee2e-45e8-1a54-fa569fb0c5")
    ).toBe(
      "booking-studio/studios/6598ab8b-ee2e-45e8-1a54-fa569fb0c5/gallery"
    )
  })
})

describe("isManagedCloudinaryFolder", () => {
  it("allows only managed studio image folders", () => {
    expect(
      isManagedCloudinaryFolder("booking-studio/studios/studio-jasmin/cover")
    ).toBe(true)
    expect(isManagedCloudinaryFolder("booking-studio/studios/raw")).toBe(false)
  })
})

describe("isManagedCloudinaryPublicId", () => {
  it("allows only managed studio image public ids", () => {
    expect(
      isManagedCloudinaryPublicId(
        "booking-studio/studios/studio-jasmin/gallery/image"
      )
    ).toBe(true)
    expect(isManagedCloudinaryPublicId("other-folder/image")).toBe(false)
  })
})

describe("getStudioCloudinaryFolderId", () => {
  it("extracts the stable studio folder id from managed public ids", () => {
    expect(
      getStudioCloudinaryFolderId(
        "booking-studio/studios/8143df67-5bce-4817-883c-9b24033ecc6f/cover/image"
      )
    ).toBe("8143df67-5bce-4817-883c-9b24033ecc6f")
    expect(
      getStudioCloudinaryFolderId(
        "booking-studio/studios/8143df67-5bce-4817-883c-9b24033ecc6f/gallery/image"
      )
    ).toBe("8143df67-5bce-4817-883c-9b24033ecc6f")
    expect(getStudioCloudinaryFolderId("other-folder/image")).toBeNull()
  })
})
