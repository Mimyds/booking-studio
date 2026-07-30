"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { LoaderCircle, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStudios, type Studio, type UseStudiosOptions } from "@/hooks/use-studios"

type PetsFilter = "all" | "yes" | "no"
type PublicationFilter = "all" | "published" | "draft"
type CapacityFilter = "all" | "2" | "3" | "4"
type SortFilter =
  | "name-asc"
  | "updated-desc"
  | "price-asc"
  | "price-desc"
  | "capacity-desc"

function formatCurrency(value: number | string, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function getSortOptions(sort: SortFilter): Pick<
  UseStudiosOptions,
  "orderBy" | "ascending"
> {
  if (sort === "updated-desc") {
    return { orderBy: "updated_at", ascending: false }
  }

  if (sort === "price-asc") {
    return { orderBy: "base_price", ascending: true }
  }

  if (sort === "price-desc") {
    return { orderBy: "base_price", ascending: false }
  }

  if (sort === "capacity-desc") {
    return { orderBy: "capacity", ascending: false }
  }

  return { orderBy: "name", ascending: true }
}

function StudioCard({
  isDeleting,
  onDelete,
  studio,
}: {
  isDeleting: boolean
  onDelete: (studio: Studio) => void
  studio: Studio
}) {
  return (
    <article className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5 max-[900px]:grid-cols-1">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-base font-bold text-slate-950">
            {studio.name}
          </h2>
          <Badge variant="outline">{studio.slug}</Badge>
          <Badge variant="secondary">
            {studio.capacity} voyageur{studio.capacity > 1 ? "s" : ""}
          </Badge>
          <Badge variant={studio.is_published ? "secondary" : "outline"}>
            {studio.is_published ? "Publié" : "Brouillon"}
          </Badge>
        </div>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          {studio.short_description ?? "Aucune description courte renseignée."}
        </p>

        <div className="mt-4 grid grid-cols-4 gap-3 text-sm max-[1180px]:grid-cols-2 max-[640px]:grid-cols-1">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Localisation</p>
            <p className="mt-1 font-semibold text-slate-950">
              {[studio.city, studio.country_code].filter(Boolean).join(", ") ||
                "Non renseignée"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Tarif de base</p>
            <p className="mt-1 font-semibold text-slate-950">
              {formatCurrency(studio.base_price, studio.currency)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Frais ménage</p>
            <p className="mt-1 font-semibold text-slate-950">
              {formatCurrency(studio.cleaning_fee, studio.currency)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Mise à jour</p>
            <p className="mt-1 font-semibold text-slate-950">
              {formatDate(studio.updated_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-w-40 flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-3 max-[900px]:min-w-0">
        <div className="grid gap-2">
          <Badge variant={studio.pets_allowed ? "secondary" : "outline"}>
            {studio.pets_allowed ? "Animaux acceptés" : "Sans animaux"}
          </Badge>
        </div>

        <div className="grid gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/studios/${studio.id}/edit`}>Modifier</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/admin/studios/${studio.id}/calendar`}>
              Calendrier
            </Link>
          </Button>
          {studio.is_published ? (
            <Button asChild variant="ghost">
              <Link href={`/studios/${studio.slug}`}>Voir public</Link>
            </Button>
          ) : null}
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(studio)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 aria-hidden="true" />
            )}
            Supprimer
          </Button>
        </div>
      </div>
    </article>
  )
}

export function StudiosList() {
  const [search, setSearch] = useState("")
  const [city, setCity] = useState("")
  const [petsAllowed, setPetsAllowed] = useState<PetsFilter>("all")
  const [publication, setPublication] = useState<PublicationFilter>("all")
  const [capacity, setCapacity] = useState<CapacityFilter>("all")
  const [sort, setSort] = useState<SortFilter>("name-asc")
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletingStudioId, setDeletingStudioId] = useState<number | null>(null)

  const queryOptions = useMemo<UseStudiosOptions>(() => {
    const sortOptions = getSortOptions(sort)

    return {
      endpoint: "/api/admin/studios",
      ...sortOptions,
      filters: {
        search: search.trim() || undefined,
        city: city.trim() || undefined,
        petsAllowed:
          petsAllowed === "all" ? undefined : petsAllowed === "yes",
        isPublished:
          publication === "all" ? undefined : publication === "published",
        minCapacity: capacity === "all" ? undefined : Number(capacity),
      },
    }
  }, [capacity, city, petsAllowed, publication, search, sort])

  const { studios, error, isLoading, refetch } = useStudios(queryOptions)
  const hasFilters =
    search.trim() !== "" ||
    city.trim() !== "" ||
    petsAllowed !== "all" ||
    publication !== "all" ||
    capacity !== "all" ||
    sort !== "name-asc"

  function resetFilters() {
    setSearch("")
    setCity("")
    setPetsAllowed("all")
    setPublication("all")
    setCapacity("all")
    setSort("name-asc")
  }

  async function handleDeleteStudio(studio: Studio) {
    const shouldDelete = window.confirm(
      `Supprimer définitivement le studio "${studio.name}" ?`
    )

    if (!shouldDelete) {
      return
    }

    setDeletingStudioId(studio.id)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/admin/studios/${studio.id}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      })
      const result = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        throw new Error(result?.error || "Le studio n’a pas pu être supprimé.")
      }

      await refetch()
    } catch (deleteStudioError) {
      setDeleteError(
        deleteStudioError instanceof Error
          ? deleteStudioError.message
          : "Le studio n’a pas pu être supprimé."
      )
    } finally {
      setDeletingStudioId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catalogue studios</CardTitle>
        <CardDescription>
          {isLoading
            ? "Chargement des studios..."
            : `${studios.length} studio${studios.length > 1 ? "s" : ""} affiché${
                studios.length > 1 ? "s" : ""
              }.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_repeat(4,minmax(10rem,0.65fr))] gap-3 max-[1320px]:grid-cols-2 max-[640px]:grid-cols-1">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher nom, slug, ville..."
              className="bg-white"
            />
            <Input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Ville"
              className="bg-white"
            />

            <Select
              value={petsAllowed}
              onValueChange={(value) => setPetsAllowed(value as PetsFilter)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Animaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Animaux : tous</SelectItem>
                <SelectItem value="yes">Animaux acceptés</SelectItem>
                <SelectItem value="no">Sans animaux</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={publication}
              onValueChange={(value) =>
                setPublication(value as PublicationFilter)
              }
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Publication" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Statut : tous</SelectItem>
                <SelectItem value="published">Publiés</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={capacity}
              onValueChange={(value) => setCapacity(value as CapacityFilter)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Capacité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Capacité : toutes</SelectItem>
                <SelectItem value="2">2+ voyageurs</SelectItem>
                <SelectItem value="3">3+ voyageurs</SelectItem>
                <SelectItem value="4">4+ voyageurs</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(value) => setSort(value as SortFilter)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Tri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Nom A-Z</SelectItem>
                <SelectItem value="updated-desc">Dernière mise à jour</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="capacity-desc">Capacité décroissante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 max-[640px]:grid">
            <p className="text-xs text-slate-500">
              Les filtres interrogent directement la table Supabase `studios`.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void refetch()}
              >
                Actualiser
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={resetFilters}
                disabled={!hasFilters}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Impossible de récupérer les studios : {error.message}
          </div>
        ) : null}

        {deleteError ? (
          <div className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {deleteError}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid min-h-72 place-items-center rounded-3xl bg-slate-50 text-center text-sm text-slate-500">
            Chargement des studios...
          </div>
        ) : studios.length > 0 ? (
          <div className="grid gap-4">
            {studios.map((studio) => (
              <StudioCard
                key={studio.id}
                isDeleting={deletingStudioId === studio.id}
                onDelete={handleDeleteStudio}
                studio={studio}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center rounded-3xl bg-slate-50 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(148,163,184,0.08)_12px,rgba(148,163,184,0.08)_13px)] p-6 text-center">
            <div>
              <p className="text-base font-bold text-slate-950">
                Aucun studio trouvé.
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Ajustez les filtres ou créez un premier studio pour préparer le
                catalogue, les tarifs et le calendrier.
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <Button asChild>
                  <Link href="/admin/studios/new">Créer un studio</Link>
                </Button>
                {hasFilters ? (
                  <Button variant="outline" onClick={resetFilters}>
                    Réinitialiser
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
