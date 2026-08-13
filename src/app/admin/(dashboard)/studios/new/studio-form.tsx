"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { LoaderCircle, Plus, X } from "lucide-react"
import {
  StudioImageUpload,
  type StudioImageValue,
} from "@/components/cloudinary/studio-image-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cloudinaryFolders } from "@/lib/cloudinary/config"
import { slugifyStudioName } from "@/lib/studios/form"
import {
  createStudioAction,
  type CreateStudioActionState,
} from "./actions"

const initialState: CreateStudioActionState = {}

export type StudioFormInitialValues = {
  slug: string
  name: string
  description: string
  capacity: string
  base_price: string
  cleaning_fee: string
  currency: string
  city: string
  country_code: string
  pets_allowed: boolean
  is_published: boolean
  short_description: string
  welcome_title: string
  coverImage: StudioImageValue | null
  galleryImages: StudioImageValue[]
  amenityIds: number[]
  addonIds: number[]
  experienceIds: number[]
}

export type StudioAmenityOption = {
  id: number
  label: string
  icon_name: string | null
  description: string | null
}

export type StudioAddonOption = {
  id: number
  name: string
  description: string | null
  price: number | string
  is_active: boolean
}

export type StudioExperienceOption = {
  id: number
  title: string
  description: string | null
  external_url: string | null
  is_active: boolean
}

type StudioFormAction = (
  previousState: CreateStudioActionState,
  formData: FormData
) => Promise<CreateStudioActionState>

type StudioFormProps = {
  action?: StudioFormAction
  addonOptions?: StudioAddonOption[]
  amenityOptions?: StudioAmenityOption[]
  cancelHref?: string
  cloudinaryFolderId?: string
  experienceOptions?: StudioExperienceOption[]
  initialValues?: StudioFormInitialValues
  pendingLabel?: string
  submitLabel?: string
}

const defaultInitialValues: StudioFormInitialValues = {
  slug: "",
  name: "",
  description: "",
  capacity: "2",
  base_price: "0",
  cleaning_fee: "0",
  currency: "EUR",
  city: "",
  country_code: "",
  pets_allowed: false,
  is_published: false,
  short_description: "",
  welcome_title: "",
  coverImage: null,
  galleryImages: [],
  amenityIds: [],
  addonIds: [],
  experienceIds: [],
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs font-medium text-destructive">{message}</p>
}

function SubmitButton({
  pendingLabel,
  submitLabel,
}: {
  pendingLabel: string
  submitLabel: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" disabled={pending} className="min-w-40">
      {pending ? pendingLabel : submitLabel}
    </Button>
  )
}

type CreateAmenityResponse = {
  amenity?: StudioAmenityOption
  error?: string
}

function sortAmenityOptions(amenities: StudioAmenityOption[]) {
  return amenities.toSorted((firstAmenity, secondAmenity) =>
    firstAmenity.label.localeCompare(secondAmenity.label, "fr")
  )
}

function AmenitiesField({
  error,
  initialOptions,
  initialSelectedIds,
}: {
  error?: string
  initialOptions: StudioAmenityOption[]
  initialSelectedIds: number[]
}) {
  const [options, setOptions] = useState(initialOptions)
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds)
  const [amenityToAdd, setAmenityToAdd] = useState("")
  const [newAmenityLabel, setNewAmenityLabel] = useState("")
  const [newAmenityIconName, setNewAmenityIconName] = useState("")
  const [newAmenityDescription, setNewAmenityDescription] = useState("")
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const selectedOptions = selectedIds
    .map((selectedId) => options.find((option) => option.id === selectedId))
    .filter((option): option is StudioAmenityOption => Boolean(option))
  const availableOptions = options.filter(
    (option) => !selectedIds.includes(option.id)
  )

  function addAmenity(amenityId: number) {
    setSelectedIds((currentIds) =>
      currentIds.includes(amenityId) ? currentIds : [...currentIds, amenityId]
    )
  }

  function removeAmenity(amenityId: number) {
    setSelectedIds((currentIds) =>
      currentIds.filter((currentId) => currentId !== amenityId)
    )
  }

  function handleAddExistingAmenity() {
    const amenityId = Number(amenityToAdd)

    if (!Number.isInteger(amenityId) || amenityId < 1) {
      return
    }

    addAmenity(amenityId)
    setAmenityToAdd("")
  }

  async function handleCreateAmenity() {
    const label = newAmenityLabel.trim()

    if (!label) {
      setCreateError("Le nom de l’équipement est requis.")
      return
    }

    setIsCreating(true)
    setCreateError(null)

    try {
      const response = await fetch("/api/admin/amenities", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label,
          icon_name: newAmenityIconName.trim() || null,
          description: newAmenityDescription.trim() || null,
        }),
      })
      const result = (await response.json().catch(() => null)) as
        | CreateAmenityResponse
        | null

      if (!response.ok || !result?.amenity) {
        throw new Error(result?.error || "L’équipement n’a pas pu être créé.")
      }

      setOptions((currentOptions) =>
        sortAmenityOptions([...currentOptions, result.amenity!])
      )
      addAmenity(result.amenity.id)
      setNewAmenityLabel("")
      setNewAmenityIconName("")
      setNewAmenityDescription("")
    } catch (amenityError) {
      setCreateError(
        amenityError instanceof Error
          ? amenityError.message
          : "L’équipement n’a pas pu être créé."
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5">
      {selectedIds.map((amenityId) => (
        <input
          key={amenityId}
          type="hidden"
          name="amenity_ids"
          value={amenityId}
        />
      ))}

      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-lg font-bold text-slate-950">Équipements</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Sélectionnez les équipements proposés dans ce studio.
        </p>
      </div>

      <div className="mt-5 grid gap-5">
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-slate-700">
            Équipements liés
          </p>
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedOptions.map((amenity) => (
                <span
                  key={amenity.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800"
                >
                  {amenity.label}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity.id)}
                    className="rounded-md p-0.5 text-slate-500 hover:bg-white hover:text-slate-950"
                    aria-label={`Retirer ${amenity.label}`}
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              Aucun équipement associé.
            </div>
          )}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 max-[640px]:grid-cols-1">
          <select
            value={amenityToAdd}
            onChange={(event) => setAmenityToAdd(event.target.value)}
            disabled={availableOptions.length === 0}
            className="h-11 rounded-lg border border-input bg-white px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {availableOptions.length > 0
                ? "Choisir un équipement"
                : "Aucun équipement disponible"}
            </option>
            {availableOptions.map((amenity) => (
              <option key={amenity.id} value={amenity.id}>
                {amenity.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddExistingAmenity}
            disabled={!amenityToAdd}
          >
            <Plus aria-hidden="true" />
            Ajouter
          </Button>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">
            Nouvel équipement
          </p>
          <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
            <Input
              value={newAmenityLabel}
              onChange={(event) => setNewAmenityLabel(event.target.value)}
              placeholder="Piscine"
              className="bg-white"
            />
            <Input
              value={newAmenityIconName}
              onChange={(event) => setNewAmenityIconName(event.target.value)}
              placeholder="waves"
              className="bg-white"
            />
            <Input
              value={newAmenityDescription}
              onChange={(event) =>
                setNewAmenityDescription(event.target.value)
              }
              placeholder="Accès piscine partagé"
              className="col-span-2 bg-white max-[720px]:col-span-1"
            />
          </div>
          {createError ? (
            <p className="text-xs font-medium text-destructive">
              {createError}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleCreateAmenity()}
              disabled={isCreating}
            >
              {isCreating ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <Plus aria-hidden="true" />
              )}
              Créer et associer
            </Button>
          </div>
        </div>

        <FieldError message={error} />
      </div>
    </section>
  )
}

function formatAddonPrice(value: number | string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

function AddonsField({
  error,
  initialOptions,
  initialSelectedIds,
}: {
  error?: string
  initialOptions: StudioAddonOption[]
  initialSelectedIds: number[]
}) {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds)
  const [addonToAdd, setAddonToAdd] = useState("")
  const selectedOptions = selectedIds
    .map((selectedId) => initialOptions.find((option) => option.id === selectedId))
    .filter((option): option is StudioAddonOption => Boolean(option))
  const availableOptions = initialOptions.filter(
    (option) => !selectedIds.includes(option.id)
  )

  function addAddon(addonId: number) {
    setSelectedIds((currentIds) =>
      currentIds.includes(addonId) ? currentIds : [...currentIds, addonId]
    )
  }

  function removeAddon(addonId: number) {
    setSelectedIds((currentIds) =>
      currentIds.filter((currentId) => currentId !== addonId)
    )
  }

  function handleAddExistingAddon() {
    const addonId = Number(addonToAdd)

    if (!Number.isInteger(addonId) || addonId < 1) {
      return
    }

    addAddon(addonId)
    setAddonToAdd("")
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5">
      {selectedIds.map((addonId) => (
        <input key={addonId} type="hidden" name="addon_ids" value={addonId} />
      ))}

      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-lg font-bold text-slate-950">Add-ons</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Sélectionnez les options complémentaires disponibles pour ce studio.
        </p>
      </div>

      <div className="mt-5 grid gap-5">
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-slate-700">
            Add-ons liés
          </p>
          {selectedOptions.length > 0 ? (
            <div className="grid gap-2">
              {selectedOptions.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 max-[560px]:grid"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{addon.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatAddonPrice(addon.price)}
                      {addon.is_active ? "" : " · inactif"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAddon(addon.id)}
                  >
                    <X aria-hidden="true" />
                    Retirer
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              Aucun add-on associé.
            </div>
          )}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 max-[640px]:grid-cols-1">
          <select
            value={addonToAdd}
            onChange={(event) => setAddonToAdd(event.target.value)}
            disabled={availableOptions.length === 0}
            className="h-11 rounded-lg border border-input bg-white px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {availableOptions.length > 0
                ? "Choisir un add-on"
                : "Aucun add-on disponible"}
            </option>
            {availableOptions.map((addon) => (
              <option key={addon.id} value={addon.id}>
                {addon.name} · {formatAddonPrice(addon.price)}
                {addon.is_active ? "" : " · inactif"}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddExistingAddon}
            disabled={!addonToAdd}
          >
            <Plus aria-hidden="true" />
            Ajouter
          </Button>
        </div>

        <FieldError message={error} />
      </div>
    </section>
  )
}

function ExperiencesField({
  error,
  initialOptions,
  initialSelectedIds,
}: {
  error?: string
  initialOptions: StudioExperienceOption[]
  initialSelectedIds: number[]
}) {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds)
  const [experienceToAdd, setExperienceToAdd] = useState("")
  const selectedOptions = selectedIds
    .map((selectedId) => initialOptions.find((option) => option.id === selectedId))
    .filter((option): option is StudioExperienceOption => Boolean(option))
  const availableOptions = initialOptions.filter(
    (option) => !selectedIds.includes(option.id)
  )

  function addExperience(experienceId: number) {
    setSelectedIds((currentIds) =>
      currentIds.includes(experienceId)
        ? currentIds
        : [...currentIds, experienceId]
    )
  }

  function removeExperience(experienceId: number) {
    setSelectedIds((currentIds) =>
      currentIds.filter((currentId) => currentId !== experienceId)
    )
  }

  function handleAddExistingExperience() {
    const experienceId = Number(experienceToAdd)

    if (!Number.isInteger(experienceId) || experienceId < 1) {
      return
    }

    addExperience(experienceId)
    setExperienceToAdd("")
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5">
      {selectedIds.map((experienceId) => (
        <input
          key={experienceId}
          type="hidden"
          name="experience_ids"
          value={experienceId}
        />
      ))}

      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-lg font-bold text-slate-950">Expériences</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Sélectionnez les expériences associées à ce studio.
        </p>
      </div>

      <div className="mt-5 grid gap-5">
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-slate-700">
            Expériences liées
          </p>
          {selectedOptions.length > 0 ? (
            <div className="grid gap-2">
              {selectedOptions.map((experience) => (
                <div
                  key={experience.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 max-[560px]:grid"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{experience.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {experience.external_url || "Aucun lien externe"}
                      {experience.is_active ? "" : " · inactive"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(experience.id)}
                  >
                    <X aria-hidden="true" />
                    Retirer
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              Aucune expérience associée.
            </div>
          )}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 max-[640px]:grid-cols-1">
          <select
            value={experienceToAdd}
            onChange={(event) => setExperienceToAdd(event.target.value)}
            disabled={availableOptions.length === 0}
            className="h-11 rounded-lg border border-input bg-white px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {availableOptions.length > 0
                ? "Choisir une expérience"
                : "Aucune expérience disponible"}
            </option>
            {availableOptions.map((experience) => (
              <option key={experience.id} value={experience.id}>
                {experience.title}
                {experience.is_active ? "" : " · inactive"}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddExistingExperience}
            disabled={!experienceToAdd}
          >
            <Plus aria-hidden="true" />
            Ajouter
          </Button>
        </div>

        <FieldError message={error} />
      </div>
    </section>
  )
}

export function StudioForm({
  action = createStudioAction,
  addonOptions = [],
  amenityOptions = [],
  cancelHref = "/admin/studios",
  cloudinaryFolderId,
  experienceOptions = [],
  initialValues = defaultInitialValues,
  pendingLabel = "Création...",
  submitLabel = "Créer le studio",
}: StudioFormProps) {
  const [state, formAction] = useActionState(action, initialState)
  const [name, setName] = useState(initialValues.name)
  const [slug, setSlug] = useState(initialValues.slug)
  const [isSlugEdited, setIsSlugEdited] = useState(false)
  const [coverImage, setCoverImage] = useState<StudioImageValue | null>(
    initialValues.coverImage
  )
  const [galleryImages, setGalleryImages] = useState<StudioImageValue[]>(
    initialValues.galleryImages
  )
  const uploadFolderId = cloudinaryFolderId ?? slug

  function handleNameChange(value: string) {
    setName(value)

    if (!isSlugEdited) {
      setSlug(slugifyStudioName(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlug(slugifyStudioName(value))
    setIsSlugEdited(value.trim() !== "")
  }

  function addGalleryImage(image: StudioImageValue) {
    setGalleryImages((currentImages) => {
      if (
        currentImages.some(
          (currentImage) =>
            currentImage.image_public_id === image.image_public_id
        )
      ) {
        return currentImages
      }

      return [...currentImages, image].slice(0, 12)
    })
  }

  function updateGalleryAltText(publicId: string, altText: string) {
    setGalleryImages((currentImages) =>
      currentImages.map((image) =>
        image.image_public_id === publicId
          ? { ...image, alt_text: altText }
          : image
      )
    )
  }

  return (
    <form action={formAction} className="grid gap-6">
      <input
        type="hidden"
        name="image_cover_public_id"
        value={coverImage?.image_public_id ?? ""}
      />
      <input
        type="hidden"
        name="gallery_images"
        value={JSON.stringify(galleryImages)}
      />

      {state.error ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-lg font-bold text-slate-950">
            Informations principales
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Ces informations identifient le studio dans le catalogue et sur le
            site public.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5 max-[720px]:grid-cols-1">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-slate-700">
              Nom du studio <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Studio Jasmin"
              autoComplete="off"
              required
              aria-invalid={Boolean(state.errors?.name)}
              className="h-11"
            />
            <FieldError message={state.errors?.name} />
          </div>

          <div className="grid gap-2">
            <label htmlFor="slug" className="text-sm font-semibold text-slate-700">
              Slug <span className="text-destructive">*</span>
            </label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              placeholder="studio-jasmin"
              autoComplete="off"
              required
              aria-invalid={Boolean(state.errors?.slug)}
              className="h-11"
            />
            <p className="text-xs text-slate-500">
              {`Adresse publique : /studios/${slug || "studio-jasmin"}`}
            </p>
            <FieldError message={state.errors?.slug} />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="welcome_title"
              className="text-sm font-semibold text-slate-700"
            >
              Titre d’accueil
            </label>
            <Input
              id="welcome_title"
              name="welcome_title"
              defaultValue={initialValues.welcome_title}
              placeholder="Bienvenue au Studio Jasmin"
              aria-invalid={Boolean(state.errors?.welcome_title)}
              className="h-11"
            />
            <FieldError message={state.errors?.welcome_title} />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="short_description"
              className="text-sm font-semibold text-slate-700"
            >
              Description courte
            </label>
            <Input
              id="short_description"
              name="short_description"
              defaultValue={initialValues.short_description}
              placeholder="Un cocon lumineux face à la mer"
              aria-invalid={Boolean(state.errors?.short_description)}
              className="h-11"
            />
            <FieldError message={state.errors?.short_description} />
          </div>

          <div className="col-span-2 grid gap-2 max-[720px]:col-span-1">
            <label
              htmlFor="description"
              className="text-sm font-semibold text-slate-700"
            >
              Description complète
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={initialValues.description}
              placeholder="Décrivez l’ambiance, les espaces et les points forts du studio..."
              aria-invalid={Boolean(state.errors?.description)}
              className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
            />
            <FieldError message={state.errors?.description} />
          </div>
        </div>
      </section>

      <AmenitiesField
        error={state.errors?.amenity_ids}
        initialOptions={amenityOptions}
        initialSelectedIds={initialValues.amenityIds}
      />

      <AddonsField
        error={state.errors?.addon_ids}
        initialOptions={addonOptions}
        initialSelectedIds={initialValues.addonIds}
      />

      <ExperiencesField
        error={state.errors?.experience_ids}
        initialOptions={experienceOptions}
        initialSelectedIds={initialValues.experienceIds}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-lg font-bold text-slate-950">
            Capacité et tarification
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Définissez le nombre de voyageurs et les montants appliqués par
            défaut.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-5 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
          <div className="grid gap-2">
            <label
              htmlFor="capacity"
              className="text-sm font-semibold text-slate-700"
            >
              Capacité <span className="text-destructive">*</span>
            </label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              step="1"
              defaultValue={initialValues.capacity}
              required
              aria-invalid={Boolean(state.errors?.capacity)}
              className="h-11"
            />
            <FieldError message={state.errors?.capacity} />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="base_price"
              className="text-sm font-semibold text-slate-700"
            >
              Tarif de base <span className="text-destructive">*</span>
            </label>
            <Input
              id="base_price"
              name="base_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initialValues.base_price}
              required
              aria-invalid={Boolean(state.errors?.base_price)}
              className="h-11"
            />
            <FieldError message={state.errors?.base_price} />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="cleaning_fee"
              className="text-sm font-semibold text-slate-700"
            >
              Frais de ménage <span className="text-destructive">*</span>
            </label>
            <Input
              id="cleaning_fee"
              name="cleaning_fee"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initialValues.cleaning_fee}
              required
              aria-invalid={Boolean(state.errors?.cleaning_fee)}
              className="h-11"
            />
            <FieldError message={state.errors?.cleaning_fee} />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="currency"
              className="text-sm font-semibold text-slate-700"
            >
              Devise <span className="text-destructive">*</span>
            </label>
            <Input
              id="currency"
              name="currency"
              defaultValue={initialValues.currency}
              maxLength={3}
              required
              aria-invalid={Boolean(state.errors?.currency)}
              className="h-11 uppercase"
            />
            <FieldError message={state.errors?.currency} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-lg font-bold text-slate-950">
            Localisation et options
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Complétez la localisation et les règles d’accueil.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5 max-[720px]:grid-cols-1">
          <div className="grid gap-2">
            <label htmlFor="city" className="text-sm font-semibold text-slate-700">
              Ville
            </label>
            <Input
              id="city"
              name="city"
              defaultValue={initialValues.city}
              placeholder="Les Trois-Îlets"
              aria-invalid={Boolean(state.errors?.city)}
              className="h-11"
            />
            <FieldError message={state.errors?.city} />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="country_code"
              className="text-sm font-semibold text-slate-700"
            >
              Code pays
            </label>
            <Input
              id="country_code"
              name="country_code"
              defaultValue={initialValues.country_code}
              placeholder="MQ"
              maxLength={2}
              aria-invalid={Boolean(state.errors?.country_code)}
              className="h-11 uppercase"
            />
            <FieldError message={state.errors?.country_code} />
          </div>

          <label className="col-span-2 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 max-[720px]:col-span-1">
            <input
              type="checkbox"
              name="pets_allowed"
              defaultChecked={initialValues.pets_allowed}
              className="mt-0.5 size-4 rounded border-slate-300 accent-slate-950"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Animaux acceptés
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Activez cette option si les voyageurs peuvent séjourner avec
                leurs animaux.
              </span>
            </span>
          </label>

          <label className="col-span-2 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 max-[720px]:col-span-1">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={initialValues.is_published}
              className="mt-0.5 size-4 rounded border-slate-300 accent-slate-950"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Publier le studio
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Les brouillons restent visibles uniquement dans l’administration.
              </span>
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-lg font-bold text-slate-950">Images</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Les images sont envoyées dans un dossier Cloudinary stable,
            indépendant du slug du studio.
          </p>
        </div>

        {uploadFolderId ? (
          <div className="mt-5 grid gap-6">
            <StudioImageUpload
              folder={cloudinaryFolders.studioCover(uploadFolderId)}
              images={coverImage ? [coverImage] : []}
              label="Choisir l’image de couverture"
              maxFiles={1}
              onRemove={() => setCoverImage(null)}
              onUpload={setCoverImage}
            />
            <FieldError message={state.errors?.image_cover_public_id} />

            <div className="border-t border-slate-100 pt-6">
              <StudioImageUpload
                folder={cloudinaryFolders.studioGallery(uploadFolderId)}
                images={galleryImages}
                label="Ajouter des images à la galerie"
                maxFiles={12}
                multiple
                onAltTextChange={updateGalleryAltText}
                onRemove={(publicId) =>
                  setGalleryImages((currentImages) =>
                    currentImages.filter(
                      (image) => image.image_public_id !== publicId
                    )
                  )
                }
                onUpload={addGalleryImage}
              />
              <FieldError message={state.errors?.gallery_images} />
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Renseignez d’abord le nom ou le slug du studio.
          </div>
        )}
      </section>

      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl shadow-slate-950/10 backdrop-blur-xl max-[560px]:grid">
        <p className="text-xs leading-5 text-slate-500">
          Les champs marqués d’un astérisque sont obligatoires.
        </p>
        <div className="flex justify-end gap-3">
          <Button asChild type="button" variant="outline" size="lg">
            <Link href={cancelHref}>Annuler</Link>
          </Button>
          <SubmitButton
            pendingLabel={pendingLabel}
            submitLabel={submitLabel}
          />
        </div>
      </div>
    </form>
  )
}
