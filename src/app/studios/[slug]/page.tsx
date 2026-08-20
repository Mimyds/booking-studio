import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CloudinaryImage } from "@/components/cloudinary/cloudinary-image"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import {
  StudioAmenities,
  type StudioAmenityGroup,
} from "@/components/studios/studio-amenities"
import { StudioBookingBar } from "@/components/studios/studio-booking-bar"
import {
  StudioExperiences,
  type StudioExperienceItem,
} from "@/components/studios/studio-experiences"
import {
  StudioGallery,
  type StudioGalleryItem,
} from "@/components/studios/studio-gallery"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { fetchStudioDetailBySlug } from "@/lib/studios/query"
import type { Studio, StudioDetail } from "@/lib/studios/types"

type StudioPageProps = {
  params: Promise<{ slug: string }>
}

const detailBrandName = "Okavango Blue Studio"

function getNumericAmount(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value

  return Number.isFinite(amount) ? amount : null
}

function getStudioLocation(studio: Studio) {
  if (studio.city) {
    return `${studio.city}, Martinique`
  }

  return "Martinique"
}

function getDescriptionLines(value: string | null) {
  return value
    ?.split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function getAmenityGroups(detail: StudioDetail): StudioAmenityGroup[] {
  const amenityGroups = detail.amenities.map((amenity) => ({
    iconName: amenity.icon_name,
    items: getDescriptionLines(amenity.description) ?? ["Inclus"],
    title: amenity.label,
  }))

  if (amenityGroups.length > 0) {
    return amenityGroups
  }

  const price = getNumericAmount(detail.studio.base_price)
  const fallbackGroups: StudioAmenityGroup[] = [
    {
      iconName: "users",
      items: [
        `${detail.studio.capacity} ${
          detail.studio.capacity === 1 ? "voyageur" : "voyageurs"
        }`,
      ],
      title: "Capacité",
    },
    {
      iconName: "map-pin",
      items: [getStudioLocation(detail.studio)],
      title: "Localisation",
    },
  ]

  if (price !== null) {
    fallbackGroups.push({
      iconName: "coffee",
      items: [
        new Intl.NumberFormat("fr-FR", {
          currency: detail.studio.currency,
          maximumFractionDigits: 0,
          style: "currency",
        }).format(price),
      ],
      title: "Tarif",
    })
  }

  return fallbackGroups
}

function getGalleryImages(detail: StudioDetail): StudioGalleryItem[] {
  const images = [
    detail.studio.image_cover_public_id
      ? {
          alt: `Vue principale de ${detail.studio.name}`,
          publicId: detail.studio.image_cover_public_id,
        }
      : null,
    ...detail.galleryImages.map((image) => ({
      alt: image.alt_text || `Galerie de ${detail.studio.name}`,
      publicId: image.image_public_id,
    })),
  ].filter((image): image is StudioGalleryItem => Boolean(image))
  const seenPublicIds = new Set<string>()

  return images.filter((image) => {
    if (seenPublicIds.has(image.publicId)) {
      return false
    }

    seenPublicIds.add(image.publicId)
    return true
  })
}

function getExperienceItems(detail: StudioDetail): StudioExperienceItem[] {
  return detail.experiences
    .map((experience) => {
      const imagePublicId =
        experience.cover_image_public_id ??
        experience.thumbnail_image_public_id ??
        detail.studio.image_cover_public_id

      return imagePublicId
        ? {
            description: experience.description,
            externalUrl: experience.external_url,
            imagePublicId,
            title: experience.title,
          }
        : null
    })
    .filter((experience): experience is StudioExperienceItem =>
      Boolean(experience)
    )
}

async function getStudioDetail(slug: string) {
  const supabase = await createServerSupabaseClient()
  const { detail } = await fetchStudioDetailBySlug(supabase, slug)

  return detail
}

export async function generateMetadata({
  params,
}: StudioPageProps): Promise<Metadata> {
  const { slug } = await params
  const detail = await getStudioDetail(slug).catch(() => null)

  if (!detail) {
    return {
      title: "Studio non trouvé | The Studio",
    }
  }

  const description =
    detail.studio.short_description ??
    detail.studio.description ??
    `Découvrez ${detail.studio.name}, studio premium en Martinique.`

  return {
    title: `${detail.studio.name} | ${detailBrandName}`,
    description,
    openGraph: {
      title: `${detail.studio.name} | ${detailBrandName}`,
      description,
    },
  }
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { slug } = await params
  const detail = await getStudioDetail(slug).catch(() => null)

  if (!detail) {
    notFound()
  }

  const { studio } = detail
  const welcomeTitle = studio.welcome_title || "Bienvenue"
  const welcomeCopy =
    studio.description ??
    studio.short_description ??
    `Profitez d'un séjour en Martinique dans ${studio.name}.`
  const galleryImages = getGalleryImages(detail)
  const amenities = getAmenityGroups(detail)
  const experiences = getExperienceItems(detail)
  const heroImage = studio.image_cover_public_id ?? galleryImages[0]?.publicId

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header
        brandLabel={detailBrandName}
        variant="transparent"
        showBookingCta
        bookingHref={`/studios/${studio.slug}/reservation`}
      />

      <main className="flex-1">
        <section className="relative min-h-[600px] overflow-hidden md:h-screen md:max-h-[900px]">
          {heroImage ? (
            <CloudinaryImage
              publicId={heroImage}
              alt={`Vue principale de ${studio.name}`}
              width={1920}
              height={1200}
              sizes="100vw"
              priority
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/0 to-black/30" />

          <div className="absolute bottom-0 left-0 right-0">
            <div className="container mx-auto px-4 md:px-8">
              <StudioBookingBar
                studioSlug={studio.slug}
                maxGuests={studio.capacity}
                className="mx-auto max-w-5xl"
              />
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-8 font-serif text-4xl tracking-wide text-neutral-800 md:text-5xl lg:text-6xl">
                {welcomeTitle}
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {welcomeCopy}
              </p>
              <Link
                href="#details"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-[gap] hover:gap-3"
              >
                En savoir plus
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <StudioGallery images={galleryImages} studioName={studio.name} />

        <div id="details">
          <StudioAmenities amenities={amenities} />
        </div>

        <StudioExperiences experiences={experiences} />
      </main>

      <Footer brandName={detailBrandName} email="contact@okavangobluestudio.com" />
    </div>
  )
}
