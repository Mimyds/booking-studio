import {
  Bath,
  Bed,
  Circle,
  Coffee,
  Eye,
  MapPin,
  Maximize,
  Shield,
  Sun,
  Tv,
  Utensils,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react"

export type StudioAmenityGroup = {
  iconName: string | null
  items: string[]
  title: string
}

type StudioAmenitiesProps = {
  amenities: StudioAmenityGroup[]
}

const iconMap: Record<string, LucideIcon> = {
  accessories: Coffee,
  accessoires: Coffee,
  bath: Bath,
  bathroom: Bath,
  bed: Bed,
  coffee: Coffee,
  electronics: Tv,
  electronique: Tv,
  extérieur: Sun,
  exterieur: Sun,
  eye: Eye,
  lit: Bed,
  map_pin: MapPin,
  maximize: Maximize,
  restauration: Utensils,
  salle_de_bain: Bath,
  security: Shield,
  securite: Shield,
  shield: Shield,
  superficie: Maximize,
  sun: Sun,
  tv: Tv,
  utensils: Utensils,
  users: Users,
  view: Eye,
  vue: Eye,
  wifi: Wifi,
  tarif: Circle,
}

function normalizeIconName(value: string | null) {
  return value
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
}

export function StudioAmenities({ amenities }: StudioAmenitiesProps) {
  if (amenities.length === 0) {
    return null
  }

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="mb-12 text-center font-serif text-2xl uppercase tracking-wide text-neutral-800 md:text-3xl">
          Détails
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-10 lg:grid-cols-3">
          {amenities.map((amenity) => {
            const iconName = normalizeIconName(amenity.iconName)
            const Icon = iconName ? iconMap[iconName] ?? Bed : Bed

            return (
              <article key={amenity.title} className="grid gap-4">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                  <Icon className="size-4 text-neutral-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    {amenity.title}
                  </h3>
                </div>
                <ul className="grid gap-2">
                  {amenity.items.map((item) => (
                    <li
                      key={item}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
