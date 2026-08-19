import Link from "next/link"
import { MapPin, Users } from "lucide-react"

import { CloudinaryImage } from "@/components/cloudinary/cloudinary-image"
import { Button } from "@/components/ui/button"

export type StudioCardModel = {
  description: string | null
  image:
    | {
        alt: string
        kind: "cloudinary"
        src: string
      }
    | null
  location: string
  maxGuests: number
  name: string
  pricePerNight: number | null
  slug: string
  tagline: string | null
}

type StudioCardProps = {
  studio: StudioCardModel
}

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  currency: "EUR",
  maximumFractionDigits: 0,
  style: "currency",
})

function formatPrice(value: number | null) {
  if (value === null) {
    return null
  }

  return currencyFormatter.format(value)
}

export function StudioCard({ studio }: StudioCardProps) {
  const price = formatPrice(studio.pricePerNight)

  return (
    <article className="group flex flex-col">
      <Link
        href={`/studios/${studio.slug}`}
        className="relative aspect-[4/3] overflow-hidden"
      >
        {studio.image?.kind === "cloudinary" ? (
          <CloudinaryImage
            publicId={studio.image.src}
            alt={studio.image.alt}
            width={1200}
            height={900}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-start bg-muted p-1 text-sm text-muted-foreground">
            {studio.name}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
      </Link>

      <div className="flex flex-col gap-4 pt-6">
        <div className="flex flex-col gap-1">
          <Link href={`/studios/${studio.slug}`}>
            <h2 className="font-serif text-2xl tracking-wide transition-opacity group-hover:opacity-70 md:text-3xl">
              {studio.name}
            </h2>
          </Link>
          {studio.tagline ? (
            <p className="text-sm italic text-muted-foreground">
              {studio.tagline}
            </p>
          ) : null}
        </div>

        {studio.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {studio.description}
          </p>
        ) : null}

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            <span>{studio.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4" />
            <span>{studio.maxGuests} voyageurs</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              À partir de
            </span>
            <span className="text-lg font-medium">
              {price ?? "Sur demande"}
              {price ? (
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / nuit
                </span>
              ) : null}
            </span>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-9 rounded-none px-4 py-2 text-xs uppercase tracking-widest"
          >
            <Link href={`/studios/${studio.slug}`}>Voir le studio</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
