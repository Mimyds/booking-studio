"use client"

import { useMemo, useState } from "react"
import { LoaderCircle, Plus, X } from "lucide-react"
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
type CreateAddonStatus = "active" | "inactive"

type CreateAddonPayload = {
  cloudinary_public_id: string
  cloudinary_url: string
  description: string
  is_active: boolean
  name: string
  price: string
}

const initialCreateAddonPayload: CreateAddonPayload = {
  cloudinary_public_id: "",
  cloudinary_url: "",
  description: "",
  is_active: true,
  name: "",
  price: "",
}

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

function AddonCard({ addon }: { addon: Addon }) {
  return (
    <article className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5">
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

      <div className="grid grid-cols-3 gap-3 text-sm max-[720px]:grid-cols-1">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Création</p>
          <p className="mt-1 font-semibold text-slate-950">
            {formatDate(addon.created_at)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Image</p>
          <p className="mt-1 truncate font-semibold text-slate-950">
            {addon.cloudinary_url ? "Renseignée" : "Non renseignée"}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Référence</p>
          <p className="mt-1 truncate font-semibold text-slate-950">
            {addon.cloudinary_public_id ?? `addon-${addon.id}`}
          </p>
        </div>
      </div>
    </article>
  )
}

function CreateAddonDialog({
  error,
  form,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}: {
  error: string | null
  form: CreateAddonPayload
  isSubmitting: boolean
  onChange: (nextForm: CreateAddonPayload) => void
  onClose: () => void
  onSubmit: () => void
}) {
  const statusValue: CreateAddonStatus = form.is_active ? "active" : "inactive"

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"
      role="presentation"
    >
      <form
        aria-describedby="create-addon-description"
        aria-labelledby="create-addon-title"
        aria-modal="true"
        role="dialog"
        className="grid w-full max-w-2xl gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/25"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="create-addon-title"
              className="text-lg font-bold text-slate-950"
            >
              Nouvel add-on
            </h2>
            <p
              id="create-addon-description"
              className="mt-2 text-sm leading-6 text-slate-500"
            >
              Ajoutez une option complémentaire au catalogue de réservation.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fermer"
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Nom
            <Input
              value={form.name}
              onChange={(event) =>
                onChange({ ...form, name: event.target.value })
              }
              placeholder="Ex. Petit-déjeuner"
              className="bg-white"
              required
              disabled={isSubmitting}
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Prix
            <Input
              value={form.price}
              onChange={(event) =>
                onChange({ ...form, price: event.target.value })
              }
              placeholder="Ex. 25"
              className="bg-white"
              inputMode="decimal"
              required
              disabled={isSubmitting}
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Statut
            <Select
              value={statusValue}
              onValueChange={(value) =>
                onChange({ ...form, is_active: value === "active" })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Description
            <Input
              value={form.description}
              onChange={(event) =>
                onChange({ ...form, description: event.target.value })
              }
              placeholder="Description courte"
              className="bg-white"
              disabled={isSubmitting}
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            URL image
            <Input
              value={form.cloudinary_url}
              onChange={(event) =>
                onChange({ ...form, cloudinary_url: event.target.value })
              }
              placeholder="https://..."
              className="bg-white"
              disabled={isSubmitting}
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Public ID Cloudinary
            <Input
              value={form.cloudinary_public_id}
              onChange={(event) =>
                onChange({
                  ...form,
                  cloudinary_public_id: event.target.value,
                })
              }
              placeholder="addons/..."
              className="bg-white"
              disabled={isSubmitting}
            />
          </label>
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
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />
            ) : (
              <Plus data-icon="inline-start" aria-hidden="true" />
            )}
            Créer l’add-on
          </Button>
        </div>
      </form>
    </div>
  )
}

export function AddonsList() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [price, setPrice] = useState<PriceFilter>("all")
  const [sort, setSort] = useState<SortFilter>("name-asc")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateAddonPayload>(
    initialCreateAddonPayload
  )
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

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

  function openCreateDialog() {
    setCreateError(null)
    setCreateForm(initialCreateAddonPayload)
    setIsCreateDialogOpen(true)
  }

  function closeCreateDialog() {
    if (isCreating) {
      return
    }

    setCreateError(null)
    setIsCreateDialogOpen(false)
  }

  async function handleCreateAddon() {
    setIsCreating(true)
    setCreateError(null)

    try {
      const response = await fetch("/api/admin/add-ons", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify(createForm),
      })
      const result = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        throw new Error(result?.error || "L’add-on n’a pas pu être créé.")
      }

      setIsCreateDialogOpen(false)
      setCreateForm(initialCreateAddonPayload)
      resetFilters()
      setSort("created-desc")
      await refetch()
    } catch (createAddonError) {
      setCreateError(
        createAddonError instanceof Error
          ? createAddonError.message
          : "L’add-on n’a pas pu être créé."
      )
    } finally {
      setIsCreating(false)
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
            <Button type="button" onClick={openCreateDialog}>
              <Plus data-icon="inline-start" aria-hidden="true" />
              Nouvel add-on
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
          <div className="flex min-h-40 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-500">
            <LoaderCircle className="animate-spin" aria-hidden="true" />
            Chargement des add-ons...
          </div>
        ) : addons.length > 0 ? (
          <div className="grid gap-4">
            {addons.map((addon) => (
              <AddonCard key={addon.id} addon={addon} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Aucun add-on ne correspond aux filtres sélectionnés.
          </div>
        )}
        </CardContent>
      </Card>

      {isCreateDialogOpen ? (
        <CreateAddonDialog
          error={createError}
          form={createForm}
          isSubmitting={isCreating}
          onChange={setCreateForm}
          onClose={closeCreateDialog}
          onSubmit={handleCreateAddon}
        />
      ) : null}
    </>
  )
}
