import Link from "next/link"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StudiosList } from "./studios-list"

export const metadata: Metadata = {
  title: "Studios admin | The Studio",
  description: "Gestion du catalogue de studios The Studio.",
}

export const dynamic = "force-dynamic"

export default function AdminStudiosPage() {
  return (
    <main className="grid gap-6">
      <section className="flex items-start justify-between gap-4 max-[720px]:grid">
        <div>
          <Badge variant="secondary">Catalogue</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
            Studios
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Gérez les fiches studios, les tarifs de base et l’accès au
            calendrier de disponibilité.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/studios/new">Nouveau studio</Link>
        </Button>
      </section>

      <StudiosList />
    </main>
  )
}
