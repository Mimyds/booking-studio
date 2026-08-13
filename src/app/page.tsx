import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "The Studio | Site en construction",
  description:
    "Le site The Studio arrive bientôt avec nos locations de vacances premium en Martinique.",
}

export default function Home() {
  return (
    <main className="relative flex min-h-svh overflow-hidden bg-background text-foreground">
      <Image
        src="/coming-soon-hero.png"
        alt="Terrasse lumineuse avec vue mer en Martinique"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-r from-background via-background/85 to-background/15" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />

      <section className="relative z-10 flex min-h-svh w-full items-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="flex w-full max-w-4xl flex-col gap-12">
          <header>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg border bg-background/80 font-serif text-2xl font-medium shadow-sm backdrop-blur">
                S
              </span>
              <span className="text-sm font-medium uppercase tracking-[0.28em]">
                The Studio
              </span>
            </Link>
          </header>

          <div className="flex max-w-2xl flex-col gap-7">
            <div className="flex flex-col gap-5">
              <h1 className="font-serif text-5xl font-medium leading-[0.95] text-balance sm:text-6xl lg:text-7xl">
                The Studio se prépare.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Notre site est en construction. Nous ouvrons bientôt les portes
                de nos séjours premium en Martinique.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 px-4">
                <Link href="/studios">
                  Découvrir nos studios
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>

          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Locations de vacances premium en Martinique. Réservation directe à
            venir.
          </p>
        </div>
      </section>
    </main>
  )
}
