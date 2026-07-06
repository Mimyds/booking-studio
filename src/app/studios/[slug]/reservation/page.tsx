type ReservationPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ReservationPage({
  params,
}: ReservationPageProps) {
  const { slug } = await params
  const studioName = slug.replaceAll("-", " ")

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <h1 className="font-serif text-5xl font-medium">
        Réserver <span className="capitalize">{studioName}</span>
      </h1>
      <p className="mt-4 text-muted-foreground">
        Le formulaire de réservation sera bientôt disponible.
      </p>
    </main>
  )
}
