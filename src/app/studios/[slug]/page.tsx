import Link from "next/link"
import { notFound } from "next/navigation"
import { CloudinaryImage } from "@/components/cloudinary/cloudinary-image"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { studioSelect } from "@/lib/studios/query"
import type { Studio, StudioGalleryImage } from "@/lib/studios/types"

type StudioPageProps = {
  params: Promise<{ slug: string }>
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: studioData, error: studioError } = await supabase
    .from("studios")
    .select(studioSelect)
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (studioError || !studioData) {
    notFound()
  }

  const studio = studioData as Studio
  const { data: galleryData } = await supabase
    .from("studio_gallery_images")
    .select("id, created_at, studio_id, image_public_id, sort_order, alt_text")
    .eq("studio_id", studio.id)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })
  const galleryImages = (galleryData ?? []) as StudioGalleryImage[]

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="grid gap-8">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            The Studio
          </p>
          <h1 className="mt-3 font-serif text-5xl font-medium">{studio.name}</h1>
          {studio.short_description ? (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {studio.short_description}
            </p>
          ) : null}
        </div>

        {studio.image_cover_public_id ? (
          <div className="overflow-hidden rounded-3xl bg-muted">
            <CloudinaryImage
              publicId={studio.image_cover_public_id}
              alt={`Vue principale de ${studio.name}`}
              width={1600}
              height={900}
              className="aspect-video w-full object-cover"
            />
          </div>
        ) : null}

        {studio.description ? (
          <p className="max-w-3xl whitespace-pre-line leading-7 text-muted-foreground">
            {studio.description}
          </p>
        ) : null}

        {galleryImages.length > 0 ? (
          <section>
            <h2 className="font-serif text-3xl font-medium">Galerie</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-2xl bg-muted"
                >
                  <CloudinaryImage
                    publicId={image.image_public_id}
                    alt={image.alt_text || `Galerie de ${studio.name}`}
                    width={960}
                    height={720}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div>
          <Button asChild size="lg">
            <Link href={`/studios/${slug}/reservation`}>
              Réserver ce studio
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
