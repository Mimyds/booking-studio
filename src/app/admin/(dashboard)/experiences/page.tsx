import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { ExperiencesList } from "./experiences-list"

export const metadata: Metadata = {
  title: "Expériences admin | The Studio",
  description: "Gestion des expériences The Studio.",
}

export const dynamic = "force-dynamic"

export default function AdminExperiencesPage() {
  return (
    <main className="grid gap-6">
      <section className="flex items-start justify-between gap-4 max-[720px]:grid">
        <div>
          <Badge variant="secondary">Catalogue</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
            Expériences
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Gérez les expériences proposées avec les studios et leurs visuels
            Cloudinary.
          </p>
        </div>
      </section>

      <ExperiencesList />
    </main>
  )
}
