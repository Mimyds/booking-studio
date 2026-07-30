import Link from "next/link"
import type { Metadata } from "next"
import { randomUUID } from "node:crypto"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Amenity } from "@/lib/studios/types"
import { StudioForm, type StudioAmenityOption } from "./studio-form"

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

  const amenityOptions: StudioAmenityOption[] = (
    (amenityData ?? []) as Amenity[]
  ).map((amenity) => ({
    id: amenity.id,
    label: amenity.label,
    icon_name: amenity.icon_name,
    description: amenity.description,
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
        amenityOptions={amenityOptions}
        cloudinaryFolderId={cloudinaryFolderId}
      />
    </main>
  )
}
