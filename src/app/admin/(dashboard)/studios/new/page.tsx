import Link from "next/link"
import type { Metadata } from "next"
import { randomUUID } from "node:crypto"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Addon } from "@/lib/addons/types"
import type { Experience } from "@/lib/experiences/types"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Amenity } from "@/lib/studios/types"
import {
  StudioForm,
  type StudioAddonOption,
  type StudioAmenityOption,
  type StudioExperienceOption,
} from "./studio-form"

export const metadata: Metadata = {
  title: "Nouveau studio | The Studio",
  description: "Création d’un studio dans le catalogue The Studio.",
}

export default async function NewStudioPage() {
  const cloudinaryFolderId = randomUUID()
  const supabase = await createServerSupabaseClient()
  const { data: amenityData, error: amenityError } = await supabase
    .from("amenities")
    .select("id, created_at, label, icon_name, description")
    .order("label", { ascending: true })

  if (amenityError) {
    throw new Error("Impossible de charger les équipements.")
  }

  const { data: addonData, error: addonError } = await supabase
    .from("addons")
    .select(
      "id, created_at, name, description, price, is_active, cloudinary_url, cloudinary_public_id"
    )
    .order("name", { ascending: true })

  if (addonError) {
    throw new Error("Impossible de charger les add-ons.")
  }

  const { data: experienceData, error: experienceError } = await supabase
    .from("experiences")
    .select(
      "id, created_at, title, description, external_url, is_active, cover_image_public_id, thumbnail_image_public_id"
    )
    .order("title", { ascending: true })

  if (experienceError) {
    throw new Error("Impossible de charger les expériences.")
  }

  const amenityOptions: StudioAmenityOption[] = (
    (amenityData ?? []) as Amenity[]
  ).map((amenity) => ({
    id: amenity.id,
    label: amenity.label,
    icon_name: amenity.icon_name,
    description: amenity.description,
  }))
  const addonOptions: StudioAddonOption[] = ((addonData ?? []) as Addon[]).map(
    (addon) => ({
      id: addon.id,
      name: addon.name,
      description: addon.description,
      price: addon.price,
      is_active: addon.is_active,
    })
  )
  const experienceOptions: StudioExperienceOption[] = (
    (experienceData ?? []) as Experience[]
  ).map((experience) => ({
    id: experience.id,
    title: experience.title,
    description: experience.description,
    external_url: experience.external_url,
    is_active: experience.is_active,
  }))

  return (
    <main className="grid gap-6">
      <section className="flex items-start justify-between gap-4 max-[720px]:grid">
        <div>
          <Badge variant="secondary">Catalogue</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
            Créer un studio
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Ajoutez les informations essentielles du studio. Les équipements,
            expériences et autres options pourront être configurés ensuite.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/admin/studios">Retour aux studios</Link>
        </Button>
      </section>

      <StudioForm
        addonOptions={addonOptions}
        amenityOptions={amenityOptions}
        cloudinaryFolderId={cloudinaryFolderId}
        experienceOptions={experienceOptions}
      />
    </main>
  )
}
