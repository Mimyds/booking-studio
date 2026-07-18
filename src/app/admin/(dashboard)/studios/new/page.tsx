import Link from "next/link"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StudioForm } from "./studio-form"

export const metadata: Metadata = {
  title: "Nouveau studio | The Studio",
  description: "Création d’un studio dans le catalogue The Studio.",
}

export default function NewStudioPage() {
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

      <StudioForm />
    </main>
  )
}
