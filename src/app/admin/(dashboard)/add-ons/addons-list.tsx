"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { LoaderCircle, Plus, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
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
import { useAddons, type Addon, type UseAddonsOptions } from "@/hooks/use-addons"

type StatusFilter = "all" | "active" | "inactive"
type PriceFilter = "all" | "0-25" | "25-50" | "50-plus"
type SortFilter = "name-asc" | "created-desc" | "price-asc" | "price-desc"

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
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

function getPriceFilter(price: PriceFilter) {
  if (price === "0-25") {
    return { minPrice: 0, maxPrice: 25 }
  }

  if (price === "25-50") {
    return { minPrice: 25, maxPrice: 50 }
  }

  if (price === "50-plus") {
    return { minPrice: 50 }
  }

  return {}
}

function getSortOptions(sort: SortFilter): Pick<
  UseAddonsOptions,
  "orderBy" | "ascending"
> {
  if (sort === "created-desc") {
    return { orderBy: "created_at", ascending: false }
  }

  if (sort === "price-asc") {
    return { orderBy: "price", ascending: true }
  }

  if (sort === "price-desc") {
    return { orderBy: "price", ascending: false }
  }

  return { orderBy: "name", ascending: true }
}

function StudioUsageTooltip({ addon }: { addon: Addon }) {
  const studioNames = addon.studio_names ?? []
  const studioCount = addon.studio_count ?? studioNames.length
  const tooltipId = `addon-${addon.id}-studios-tooltip`

  return (
    <div className="group relative w-full">
      <button
        type="button"
        aria-describedby={tooltipId}
        className="w-full rounded-2xl bg-slate-50 p-3 text-left outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="block text-xs font-medium text-slate-500">
          Studios rattachés
        </span>
        <span className="mt-1 block font-semibold text-slate-950">
          {studioCount} studio{studioCount > 1 ? "s" : ""}
        </span>
      </button>
      <div
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-0 z-20 w-max max-w-72 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 opacity-0 shadow-xl shadow-slate-950/15 transition group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {studioNames.length > 0 ? (
          <ul className="grid gap-1">
            {studioNames.map((studioName) => (
              <li key={studioName} className="font-medium text-slate-800">
                {studioName}
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun studio rattaché.</p>
        )}
      </div>
    </div>
  )
}

function AddonCard({
  addon,
  isDeleting,
  onRequestDelete,
}: {
  addon: Addon
  isDeleting: boolean
  onRequestDelete: (addon: Addon) => void
}) {
  return (
    <article className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5 max-[900px]:grid-cols-1">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-bold text-slate-950">
                {addon.name}
              </h2>
              <Badge variant={addon.is_active ? "secondary" : "outline"}>
                {addon.is_active ? "Actif" : "Inactif"}
              </Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              {addon.description ?? "Aucune description renseignée."}
            </p>
          </div>
          <p className="shrink-0 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950">
            {formatCurrency(addon.price)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm max-[720px]:grid-cols-1">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Création</p>
            <p className="mt-1 font-semibold text-slate-950">
              {formatDate(addon.created_at)}
            </p>
          </div>
          <StudioUsageTooltip addon={addon} />
        </div>
      </div>

      <div className="flex min-w-40 flex-col justify-end gap-2 rounded-2xl bg-slate-50 p-3 max-[900px]:min-w-0">
        <Button asChild variant="outline">
          <Link href={`/admin/add-ons/${addon.id}/edit`}>Modifier</Link>
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => onRequestDelete(addon)}
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
    </article>
  )
}

function DeleteAddonDialog({
  addon,
  error,
  isDeleting,
  onClose,
  onConfirm,
}: {
  addon: Addon | null
  error: string | null
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!addon) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"
      role="presentation"
    >
      <div
        aria-describedby="delete-addon-description"
        aria-labelledby="delete-addon-title"
        aria-modal="true"
        role="dialog"
        className="grid w-full max-w-lg gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/25"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="delete-addon-title"
              className="text-lg font-bold text-slate-950"
            >
              Supprimer l’add-on
            </h2>
            <p
              id="delete-addon-description"
              className="mt-2 text-sm leading-6 text-slate-500"
            >
              Cette action supprimera définitivement “{addon.name}” du
              catalogue admin.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Fermer"
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm leading-6 text-destructive">
          L’image Cloudinary liée sera supprimée après la suppression en base. La
          suppression sera refusée si l’add-on est déjà lié à des données de
          réservation.
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-3 max-[480px]:grid">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 aria-hidden="true" />
            )}
            Supprimer définitivement
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AddonsList() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [price, setPrice] = useState<PriceFilter>("all")
  const [sort, setSort] = useState<SortFilter>("name-asc")
  const [addonToDelete, setAddonToDelete] = useState<Addon | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletingAddonId, setDeletingAddonId] = useState<number | null>(null)

  const queryOptions = useMemo<UseAddonsOptions>(() => {
    const sortOptions = getSortOptions(sort)
    const priceFilter = getPriceFilter(price)

    return {
      endpoint: "/api/admin/add-ons",
      ...sortOptions,
      filters: {
        search: search.trim() || undefined,
        isActive: status === "all" ? undefined : status === "active",
        ...priceFilter,
      },
    }
  }, [price, search, sort, status])

  const { addons, error, isLoading, refetch } = useAddons(queryOptions)
  const hasFilters =
    search.trim() !== "" ||
    status !== "all" ||
    price !== "all" ||
    sort !== "name-asc"

  function resetFilters() {
    setSearch("")
    setStatus("all")
    setPrice("all")
    setSort("name-asc")
  }

  function openDeleteAddonDialog(addon: Addon) {
    setDeleteError(null)
    setAddonToDelete(addon)
  }

  function closeDeleteAddonDialog() {
    if (deletingAddonId) {
      return
    }

    setDeleteError(null)
    setAddonToDelete(null)
  }

  async function handleConfirmDeleteAddon() {
    if (!addonToDelete) {
      return
    }

    const addon = addonToDelete
    setDeletingAddonId(addon.id)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/admin/add-ons/${addon.id}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      })
      const result = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        throw new Error(result?.error || "L’add-on n’a pas pu être supprimé.")
      }

      await refetch()
      setAddonToDelete(null)
    } catch (deleteAddonError) {
      setDeleteError(
        deleteAddonError instanceof Error
          ? deleteAddonError.message
          : "L’add-on n’a pas pu être supprimé."
      )
    } finally {
      setDeletingAddonId(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Catalogue add-ons</CardTitle>
          <CardDescription>
            {isLoading
              ? "Chargement des add-ons..."
              : `${addons.length} add-on${addons.length > 1 ? "s" : ""} affiché${
                  addons.length > 1 ? "s" : ""
                }.`}
          </CardDescription>
          <CardAction>
            <Button asChild>
              <Link href="/admin/add-ons/new">
                <Plus data-icon="inline-start" aria-hidden="true" />
                Nouvel add-on
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(10rem,0.7fr))] gap-3 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher nom, description..."
                className="bg-white"
              />

            <Select
              value={status}
              onValueChange={(value) => setStatus(value as StatusFilter)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Statut : tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={price}
              onValueChange={(value) => setPrice(value as PriceFilter)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Prix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Prix : tous</SelectItem>
                <SelectItem value="0-25">0 à 25 €</SelectItem>
                <SelectItem value="25-50">25 à 50 €</SelectItem>
                <SelectItem value="50-plus">50 € et plus</SelectItem>
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
                <SelectItem value="created-desc">Dernier ajout</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 max-[640px]:grid">
            <p className="text-xs text-slate-500">
              Les filtres interrogent directement la table Supabase `addons`.
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
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
            {error.message}
          </div>
        ) : isLoading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-500">
            <LoaderCircle className="animate-spin" aria-hidden="true" />
            Chargement des add-ons...
          </div>
        ) : addons.length > 0 ? (
          <div className="grid gap-4">
            {addons.map((addon) => (
              <AddonCard
                key={addon.id}
                addon={addon}
                isDeleting={deletingAddonId === addon.id}
                onRequestDelete={openDeleteAddonDialog}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Aucun add-on ne correspond aux filtres sélectionnés.
          </div>
        )}
        </CardContent>
      </Card>

      <DeleteAddonDialog
        addon={addonToDelete}
        error={deleteError}
        isDeleting={Boolean(deletingAddonId)}
        onClose={closeDeleteAddonDialog}
        onConfirm={handleConfirmDeleteAddon}
      />
    </>
  )
}
