import { describe, expect, it } from "vitest"
import {
  cloudinaryFolders,
  isManagedCloudinaryFolder,
  isManagedCloudinaryPublicId,
} from "@/lib/cloudinary/config"

describe("cloudinaryFolders", () => {
  it("builds studio folders from slugs", () => {
    expect(cloudinaryFolders.studioCover("Studio Jasmin")).toBe(
      "booking-studio/studios/studio-jasmin/cover"
    )
    expect(cloudinaryFolders.studioGallery("studio-jasmin")).toBe(
      "booking-studio/studios/studio-jasmin/gallery"
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
