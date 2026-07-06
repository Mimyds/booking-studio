import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nos Studios | The Studio",
  description: "Découvrez nos 4 studios d'exception en Martinique. Choisissez votre hébergement de rêve avec vue mer et prestations haut de gamme.",
}

export default function StudiosPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <h1 className="font-serif text-5xl font-medium">Nos studios</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Découvrez prochainement nos studios d&apos;exception en Martinique.
      </p>
    </main>
  )
}
