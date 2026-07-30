import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getStudioCloudinaryFolderId } from "@/lib/cloudinary/config"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { studioSelect } from "@/lib/studios/query"
import type { Amenity, Studio, StudioGalleryImage } from "@/lib/studios/types"
import {
  StudioForm,
  type StudioAmenityOption,
  type StudioFormInitialValues,
} from "../../new/studio-form"
import { updateStudioAction } from "./actions"

export const metadata: Metadata = {
  title: "Modifier un studio | The Studio",
  description: "Modification d’un studio dans le catalogue The Studio.",
}

type EditStudioPageProps = {
  params: Promise<{ id: string }>
}

function toFormNumber(value: number | string) {
  return String(value ?? "")
}

function getExistingCloudinaryFolderId(
  studio: Studio,
  galleryImages: StudioGalleryImage[]
) {
  const publicIds = [
    studio.image_cover_public_id,
    ...galleryImages.map((image) => image.image_public_id),
  ].filter((publicId): publicId is string => Boolean(publicId))

  for (const publicId of publicIds) {
    const folderId = getStudioCloudinaryFolderId(publicId)

    if (folderId) {
      return folderId
    }
  }

  return `studio-${studio.id}`
}

export default async function EditStudioPage({ params }: EditStudioPageProps) {
  const { id } = await params
  const studioId = Number(id)

  if (!Number.isInteger(studioId) || studioId < 1) {
    notFound()
  }

  const supabase = await createServerSupabaseClient()
  const { data: studioData, error: studioError } = await supabase
    .from("studios")
    .select(studioSelect)
    .eq("id", studioId)
    .single()

  if (studioError || !studioData) {
    notFound()
  }

  const studio = studioData as Studio
  const { data: galleryData, error: galleryError } = await supabase
    .from("studio_gallery_images")
    .select("id, created_at, studio_id, image_public_id, sort_order, alt_text")
    .eq("studio_id", studio.id)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })

  if (galleryError) {
    throw new Error("Impossible de charger la galerie du studio.")
  }

  const { data: amenityData, error: amenityError } = await supabase
    .from("amenities")
    .select("id, created_at, label, icon_name, description")
    .order("label", { ascending: true })

  if (amenityError) {
    throw new Error("Impossible de charger les équipements.")
  }

  const { data: studioAmenityData, error: studioAmenityError } = await supabase
    .from("studio_amenities")
    .select("amenity_id")
    .eq("studio_id", studio.id)

  if (studioAmenityError) {
    throw new Error("Impossible de charger les équipements du studio.")
  }

  const galleryImages = (galleryData ?? []) as StudioGalleryImage[]
  const amenityOptions: StudioAmenityOption[] = ((amenityData ?? []) as Amenity[]).map(
    (amenity) => ({
      id: amenity.id,
      label: amenity.label,
      icon_name: amenity.icon_name,
      description: amenity.description,
    })
  )
  const cloudinaryFolderId = getExistingCloudinaryFolderId(
    studio,
    galleryImages
  )
  const initialValues: StudioFormInitialValues = {
    slug: studio.slug,
    name: studio.name,
    description: studio.description ?? "",
    capacity: toFormNumber(studio.capacity),
    base_price: toFormNumber(studio.base_price),
    cleaning_fee: toFormNumber(studio.cleaning_fee),
    currency: studio.currency,
    city: studio.city ?? "",
    country_code: studio.country_code ?? "",
    pets_allowed: studio.pets_allowed,
    is_published: studio.is_published,
    short_description: studio.short_description ?? "",
    welcome_title: studio.welcome_title ?? "",
    coverImage: studio.image_cover_public_id
      ? {
          image_public_id: studio.image_cover_public_id,
          alt_text: `Vue principale de ${studio.name}`,
        }
      : null,
    galleryImages: galleryImages.map((image) => ({
      image_public_id: image.image_public_id,
      alt_text: image.alt_text ?? "",
    })),
    amenityIds: (studioAmenityData ?? []).map((amenity) => amenity.amenity_id),
  }
  const action = updateStudioAction.bind(null, studio.id)

  return (
    <main className="grid gap-6">
      <section className="flex items-start justify-between gap-4 max-[720px]:grid">
        <div>
          <Badge variant="secondary">Catalogue</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
            Modifier {studio.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Mettez à jour les informations, les tarifs et les images du studio.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/admin/studios">Retour aux studios</Link>
        </Button>
      </section>

      <StudioForm
        action={action}
        amenityOptions={amenityOptions}
        cancelHref="/admin/studios"
        cloudinaryFolderId={cloudinaryFolderId}
        initialValues={initialValues}
        pendingLabel="Enregistrement..."
        submitLabel="Enregistrer"
      />
    </main>
  )
}
