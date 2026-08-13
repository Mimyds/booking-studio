import Link from "next/link"
import type { Metadata } from "next"
import { randomUUID } from "node:crypto"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExperienceForm } from "./experience-form"

export const metadata: Metadata = {
  title: "Nouvelle expérience | The Studio",
  description: "Création d’une expérience dans le catalogue The Studio.",
}

export default function NewExperiencePage() {
  const cloudinaryFolderId = randomUUID()

  return (
    <main className="grid gap-6">
      <section className="flex items-start justify-between gap-4 max-[720px]:grid">
        <div>
          <Badge variant="secondary">Catalogue</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
            Créer une expérience
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Ajoutez l’expérience, ses visuels Cloudinary et son lien externe.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/admin/experiences">Retour aux expériences</Link>
        </Button>
      </section>

      <ExperienceForm cloudinaryFolderId={cloudinaryFolderId} />
    </main>
  )
}
