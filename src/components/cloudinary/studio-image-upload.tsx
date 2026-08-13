"use client"

import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react"
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react"
import { CldImage, type CloudinaryUploadWidgetInfo } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { cloudinaryUploadOptions } from "@/lib/cloudinary/config"

const SIGNATURE_ENDPOINT = "/api/admin/cloudinary/signature"
const ASSET_ENDPOINT = "/api/admin/cloudinary/assets"

const LazyCldUploadWidget = lazy(async () => {
  const { CldUploadWidget } = await import("next-cloudinary")

  return { default: CldUploadWidget }
})

export type StudioImageValue = {
  image_public_id: string
  alt_text: string
  cloudinary_url?: string | null
}

type StudioImageUploadProps = {
  folder: string
  images: StudioImageValue[]
  label: string
  maxFiles: number
  multiple?: boolean
  onAltTextChange?: (publicId: string, altText: string) => void
  onRemove: (publicId: string) => void
  onUpload: (image: StudioImageValue) => void
}

type WidgetTriggerProps = {
  autoOpen: boolean
  disabled: boolean
  isLoading?: boolean
  label: string
  open: () => void
}

function WidgetTrigger({
  autoOpen,
  disabled,
  isLoading,
  label,
  open,
}: WidgetTriggerProps) {
  const hasOpened = useRef(false)

  useEffect(() => {
    if (autoOpen && !isLoading && !hasOpened.current) {
      hasOpened.current = true
      open()
    }
  }, [autoOpen, isLoading, open])

  return (
    <Button
      type="button"
      variant="outline"
      onClick={(event) => {
        event.preventDefault()
        open()
      }}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        <ImagePlus aria-hidden="true" />
      )}
      {isLoading ? "Chargement..." : label}
    </Button>
  )
}

function getUploadInfo(
  info: string | CloudinaryUploadWidgetInfo | undefined
) {
  return typeof info === "object" && info?.public_id ? info : null
}

async function deleteCloudinaryAsset(publicId: string) {
  const response = await fetch(ASSET_ENDPOINT, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  })

  if (!response.ok) {
    const result = await response.json().catch(() => null)
    throw new Error(result?.error || "L’image n’a pas pu être supprimée.")
  }
}

export function StudioImageUpload({
  folder,
  images,
  label,
  maxFiles,
  multiple = false,
  onAltTextChange,
  onRemove,
  onUpload,
}: StudioImageUploadProps) {
  const [isWidgetActivated, setIsWidgetActivated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingPublicIds, setDeletingPublicIds] = useState<Set<string>>(
    () => new Set()
  )
  const limitReached = images.length >= maxFiles
  const uploadLabel = images.length > 0 ? "Ajouter une image" : label

  async function handleRemove(publicId: string) {
    setDeletingPublicIds((current) => new Set(current).add(publicId))

    try {
      await deleteCloudinaryAsset(publicId)
      onRemove(publicId)
      setError(null)
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "L’image n’a pas pu être supprimée."
      )
    } finally {
      setDeletingPublicIds((current) => {
        const next = new Set(current)
        next.delete(publicId)
        return next
      })
    }
  }

  const widgetProps: ComponentProps<typeof LazyCldUploadWidget> = {
    signatureEndpoint: SIGNATURE_ENDPOINT,
    options: {
      clientAllowedFormats: [...cloudinaryUploadOptions.allowedFormats],
      folder,
      maxFileSize: cloudinaryUploadOptions.maxFileSize,
      maxFiles: Math.max(maxFiles - images.length, 1),
      multiple,
      resourceType: "image",
      sources: [...cloudinaryUploadOptions.sources],
    },
    onError: (uploadError) => {
      setError(
        (typeof uploadError === "string"
          ? uploadError
          : uploadError?.statusText) || "L’image n’a pas pu être envoyée."
      )
    },
    onSuccess: (results) => {
      const info = getUploadInfo(results.info)

      if (!info) {
        return
      }

      const cloudinaryUrl =
        "secure_url" in info && typeof info.secure_url === "string"
          ? info.secure_url
          : null

      setError(null)
      onUpload({
        image_public_id: info.public_id,
        alt_text: info.original_filename ?? "",
        cloudinary_url: cloudinaryUrl,
      })
    },
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className="mt-1 text-xs text-slate-500">
            {images.length}/{maxFiles} image{maxFiles > 1 ? "s" : ""}
          </p>
        </div>

        {isWidgetActivated ? (
          <Suspense
            fallback={
              <Button type="button" variant="outline" disabled>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                Chargement...
              </Button>
            }
          >
            <LazyCldUploadWidget {...widgetProps}>
              {({ open, isLoading }) => (
                <WidgetTrigger
                  autoOpen
                  disabled={limitReached}
                  isLoading={isLoading}
                  label={uploadLabel}
                  open={open}
                />
              )}
            </LazyCldUploadWidget>
          </Suspense>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={limitReached}
            onClick={() => setIsWidgetActivated(true)}
          >
            <ImagePlus aria-hidden="true" />
            {uploadLabel}
          </Button>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 max-[720px]:grid-cols-2 max-[480px]:grid-cols-1">
          {images.map((image) => {
            const isDeleting = deletingPublicIds.has(image.image_public_id)

            return (
              <article
                key={image.image_public_id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              >
                <CldImage
                  src={image.image_public_id}
                  alt={image.alt_text || label}
                  width={640}
                  height={420}
                  crop="fill"
                  gravity="auto"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="grid gap-2 p-3">
                  {onAltTextChange ? (
                    <label className="grid gap-1 text-xs font-medium text-slate-600">
                      Texte alternatif
                      <input
                        value={image.alt_text}
                        onChange={(event) =>
                          onAltTextChange(
                            image.image_public_id,
                            event.target.value
                          )
                        }
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                      />
                    </label>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => void handleRemove(image.image_public_id)}
                  >
                    {isDeleting ? (
                      <LoaderCircle className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 aria-hidden="true" />
                    )}
                    {isDeleting ? "Suppression..." : "Retirer"}
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
          Aucune image sélectionnée.
        </div>
      )}
    </div>
  )
}
