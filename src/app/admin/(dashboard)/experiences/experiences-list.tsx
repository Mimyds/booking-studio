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
import {
  useExperiences,
  type Experience,
  type UseExperiencesOptions,
} from "@/hooks/use-experiences"

type StatusFilter = "all" | "active" | "inactive"
type SortFilter = "title-asc" | "created-desc"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function getSortOptions(sort: SortFilter): Pick<
  UseExperiencesOptions,
  "orderBy" | "ascending"
> {
  if (sort === "created-desc") {
    return { orderBy: "created_at", ascending: false }
  }

  return { orderBy: "title", ascending: true }
}

function StudioUsageTooltip({ experience }: { experience: Experience }) {
  const studioNames = experience.studio_names ?? []
  const studioCount = experience.studio_count ?? studioNames.length
  const tooltipId = `experience-${experience.id}-studios-tooltip`

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

function ExperienceCard({
  experience,
  isDeleting,
  onRequestDelete,
}: {
  experience: Experience
  isDeleting: boolean
  onRequestDelete: (experience: Experience) => void
}) {
  return (
    <article className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5 max-[900px]:grid-cols-1">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-bold text-slate-950">
                {experience.title}
              </h2>
              <Badge variant={experience.is_active ? "secondary" : "outline"}>
                {experience.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              {experience.description ?? "Aucune description renseignée."}
            </p>
            {experience.external_url ? (
              <a
                href={experience.external_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex max-w-full text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
              >
                <span className="truncate">{experience.external_url}</span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm max-[720px]:grid-cols-1">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Création</p>
            <p className="mt-1 font-semibold text-slate-950">
              {formatDate(experience.created_at)}
            </p>
          </div>
          <StudioUsageTooltip experience={experience} />
        </div>
      </div>

      <div className="flex min-w-40 flex-col justify-end gap-2 rounded-2xl bg-slate-50 p-3 max-[900px]:min-w-0">
        <Button asChild variant="outline">
          <Link href={`/admin/experiences/${experience.id}/edit`}>
            Modifier
          </Link>
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => onRequestDelete(experience)}
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

function DeleteExperienceDialog({
  error,
  experience,
  isDeleting,
  onClose,
  onConfirm,
}: {
  error: string | null
  experience: Experience | null
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!experience) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"
      role="presentation"
    >
      <div
        aria-describedby="delete-experience-description"
        aria-labelledby="delete-experience-title"
        aria-modal="true"
        role="dialog"
        className="grid w-full max-w-lg gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/25"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="delete-experience-title"
              className="text-lg font-bold text-slate-950"
            >
              Supprimer l’expérience
            </h2>
            <p
              id="delete-experience-description"
              className="mt-2 text-sm leading-6 text-slate-500"
            >
              Cette action supprimera définitivement “{experience.title}” du
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
          Les images Cloudinary liées seront supprimées après la suppression en
          base. Les dossiers vides seront également nettoyés.
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

export function ExperiencesList() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<SortFilter>("title-asc")
  const [experienceToDelete, setExperienceToDelete] =
    useState<Experience | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletingExperienceId, setDeletingExperienceId] = useState<
    number | null
  >(null)

  const queryOptions = useMemo<UseExperiencesOptions>(() => {
    const sortOptions = getSortOptions(sort)

    return {
      endpoint: "/api/admin/experiences",
      ...sortOptions,
      filters: {
        search: search.trim() || undefined,
        isActive: status === "all" ? undefined : status === "active",
      },
    }
  }, [search, sort, status])

  const { experiences, error, isLoading, refetch } =
    useExperiences(queryOptions)
  const hasFilters =
    search.trim() !== "" || status !== "all" || sort !== "title-asc"

  function resetFilters() {
    setSearch("")
    setStatus("all")
    setSort("title-asc")
  }

  function openDeleteExperienceDialog(experience: Experience) {
    setDeleteError(null)
    setExperienceToDelete(experience)
  }

  function closeDeleteExperienceDialog() {
    if (deletingExperienceId) {
      return
    }

    setDeleteError(null)
    setExperienceToDelete(null)
  }

  async function handleConfirmDeleteExperience() {
    if (!experienceToDelete) {
      return
    }

    const experience = experienceToDelete

    setDeletingExperienceId(experience.id)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/admin/experiences/${experience.id}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      })
      const result = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        throw new Error(
          result?.error || "L’expérience n’a pas pu être supprimée."
        )
      }

      await refetch()
      setExperienceToDelete(null)
    } catch (deleteExperienceError) {
      setDeleteError(
        deleteExperienceError instanceof Error
          ? deleteExperienceError.message
          : "L’expérience n’a pas pu être supprimée."
      )
    } finally {
      setDeletingExperienceId(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Catalogue expériences</CardTitle>
          <CardDescription>
            {isLoading
              ? "Chargement des expériences..."
              : `${experiences.length} expérience${
                  experiences.length > 1 ? "s" : ""
                } affichée${experiences.length > 1 ? "s" : ""}.`}
          </CardDescription>
          <CardAction>
            <Button asChild>
              <Link href="/admin/experiences/new">
                <Plus data-icon="inline-start" aria-hidden="true" />
                Nouvelle expérience
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(10rem,0.7fr))] gap-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher titre, description..."
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
                  <SelectItem value="active">Actives</SelectItem>
                  <SelectItem value="inactive">Inactives</SelectItem>
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
                  <SelectItem value="title-asc">Titre A-Z</SelectItem>
                  <SelectItem value="created-desc">Dernier ajout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-3 max-[640px]:grid">
              <p className="text-xs text-slate-500">
                Les filtres interrogent directement la table Supabase
                `experiences`.
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
              Chargement des expériences...
            </div>
          ) : experiences.length > 0 ? (
            <div className="grid gap-4">
              {experiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  isDeleting={deletingExperienceId === experience.id}
                  onRequestDelete={openDeleteExperienceDialog}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Aucune expérience ne correspond aux filtres sélectionnés.
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteExperienceDialog
        error={deleteError}
        experience={experienceToDelete}
        isDeleting={Boolean(deletingExperienceId)}
        onClose={closeDeleteExperienceDialog}
        onConfirm={handleConfirmDeleteExperience}
      />
    </>
  )
}
