import Link from "next/link"

type StudioPageProps = {
  params: Promise<{ slug: string }>
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { slug } = await params
  const studioName = slug.replaceAll("-", " ")

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">
        The Studio
      </p>
      <h1 className="mt-3 font-serif text-5xl font-medium capitalize">
        {studioName}
      </h1>
      <Link
        href={`/studios/${slug}/reservation`}
        className="mt-8 inline-flex bg-primary px-6 py-3 text-primary-foreground"
      >
        Réserver ce studio
      </Link>
    </main>
  )
}
