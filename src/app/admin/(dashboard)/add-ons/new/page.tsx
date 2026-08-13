import Link from "next/link"
import type { Metadata } from "next"
import { randomUUID } from "node:crypto"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddonForm } from "./addon-form"

export const metadata: Metadata = {
  title: "Nouvel add-on | The Studio",
  description: "Création d’un add-on dans le catalogue The Studio.",
}

export default function NewAddonPage() {
  const cloudinaryFolderId = randomUUID()

  return (
    <main className="grid gap-6">
      <section className="flex items-start justify-between gap-4 max-[720px]:grid">
        <div>
          <Badge variant="secondary">Catalogue</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
            Créer un add-on
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Ajoutez une option complémentaire et son image Cloudinary.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/admin/add-ons">Retour aux add-ons</Link>
        </Button>
      </section>

      <AddonForm cloudinaryFolderId={cloudinaryFolderId} />
    </main>
  )
}
