import type { Metadata } from "next"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import {
  StudioCard,
  type StudioCardModel,
} from "@/components/studios/studio-card"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { fetchStudios } from "@/lib/studios/query"
import type { Studio } from "@/lib/studios/types"

export const metadata: Metadata = {
  title: "Nos Studios | The Studio",
  description:
    "Découvrez nos locations d'exception en Martinique. Chaque studio a été pensé pour vous offrir une expérience unique, entre luxe discret et authenticité caribéenne.",
}

function toStudioCardModel(studio: Studio): StudioCardModel {
  const amount =
    typeof studio.base_price === "string"
      ? Number(studio.base_price)
      : studio.base_price

  return {
    description: studio.short_description ?? studio.description ?? null,
    image: studio.image_cover_public_id
      ? {
          alt: `Vue principale de ${studio.name}`,
          kind: "cloudinary",
          src: studio.image_cover_public_id,
        }
      : null,
    location: studio.city ? `${studio.city}, Martinique` : "Martinique",
    maxGuests: studio.capacity,
    name: studio.name,
    pricePerNight: Number.isFinite(amount) ? amount : null,
    slug: studio.slug,
    tagline: studio.welcome_title ?? studio.short_description ?? null,
  }
}

async function getPublishedStudios() {
  try {
    const supabase = await createServerSupabaseClient()
    const { studios, error } = await fetchStudios(supabase, {
      filters: {
        isPublished: true,
      },
      orderBy: "name",
    })

    if (error) {
      return []
    }

    return studios.map(toStudioCardModel)
  } catch {
    return []
  }
}

export default async function Home() {
  const studios = await getPublishedStudios()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header variant="solid" showBookingCta={false} />

      <main className="flex-1 pt-20 md:pt-24">
        <section className="container mx-auto px-4 py-12 md:px-8 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-balance font-serif text-4xl tracking-wide md:text-6xl lg:text-7xl">
              Nos Studios
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
              Découvrez nos locations d&apos;exception en Martinique. Chaque
              studio a été pensé pour vous offrir une expérience unique, entre
              luxe discret et authenticité caribéenne.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20 md:px-8 md:pb-32">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            {studios.map((studio) => (
              <StudioCard key={studio.slug} studio={studio} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
