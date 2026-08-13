import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { randomUUID } from "node:crypto"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getExperienceCloudinaryFolderId,
} from "@/lib/cloudinary/config"
import type { Experience } from "@/lib/experiences/types"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  ExperienceForm,
  type ExperienceFormInitialValues,
} from "../../new/experience-form"
import { updateExperienceAction } from "./actions"

type EditExperiencePageProps = {
  params: Promise<{ id: string }>
}

function getExperienceId(value: string) {
  const experienceId = Number(value)

  return Number.isInteger(experienceId) && experienceId > 0 ? experienceId : null
}

function getCloudinaryFolderId(experience: Experience) {
  const publicIds = [
    experience.cover_image_public_id,
    experience.thumbnail_image_public_id,
  ].filter((publicId): publicId is string => Boolean(publicId))

  for (const publicId of publicIds) {
    const folderId = getExperienceCloudinaryFolderId(publicId)

    if (folderId) {
      return folderId
    }
  }

  return randomUUID()
}

export async function generateMetadata({
  params,
}: EditExperiencePageProps): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Modifier expérience ${id} | The Studio`,
    description: "Modification d’une expérience dans le catalogue The Studio.",
  }
}

export default async function EditExperiencePage({
  params,
}: EditExperiencePageProps) {
  const { id } = await params
  const experienceId = getExperienceId(id)

  if (!experienceId) {
    notFound()
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("experiences")
    .select(
      "id, created_at, title, description, external_url, is_active, cover_image_public_id, thumbnail_image_public_id"
    )
    .eq("id", experienceId)
    .maybeSingle()

  if (error) {
    throw new Error("Impossible de charger l’expérience.")
  }

  if (!data) {
    notFound()
  }

  const experience = data as Experience
  const initialValues: ExperienceFormInitialValues = {
    cover_image_public_id: experience.cover_image_public_id ?? "",
    description: experience.description ?? "",
    external_url: experience.external_url ?? "",
    is_active: experience.is_active,
    thumbnail_image_public_id: experience.thumbnail_image_public_id ?? "",
    title: experience.title,
  }

  return (
    <main className="grid gap-6">
      <section className="flex items-start justify-between gap-4 max-[720px]:grid">
        <div>
          <Badge variant="secondary">Catalogue</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
            Modifier l’expérience
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Mettez à jour les informations et les images Cloudinary de
            “{experience.title}”.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/admin/experiences">Retour aux expériences</Link>
        </Button>
      </section>

      <ExperienceForm
        action={updateExperienceAction}
        cloudinaryFolderId={getCloudinaryFolderId(experience)}
        experienceId={experience.id}
        initialValues={initialValues}
        pendingLabel="Modification..."
        submitLabel="Modifier l’expérience"
      />
    </main>
  )
}
