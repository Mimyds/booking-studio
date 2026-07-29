import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { studioSelect } from "@/lib/studios/query"
import type { Studio } from "@/lib/studios/types"

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
    .single()

  if (studioError || !studioData) {
    notFound()
  }

  const studio = studioData as Studio

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

        {studio.description ? (
          <p className="max-w-3xl whitespace-pre-line leading-7 text-muted-foreground">
            {studio.description}
          </p>
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
