import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Expériences admin | The Studio",
  description: "Gestion des expériences The Studio.",
}

export default function AdminExperiencesPage() {
  return (
    <main className="grid gap-6">
      <section>
        <Badge variant="secondary">Catalogue</Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
          Expériences
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          La liste des expériences sera intégrée dans une prochaine étape.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Catalogue expériences</CardTitle>
          <CardDescription>Module à implémenter après.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Aucun écran de gestion n’est encore disponible pour les expériences.
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
