"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
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

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs font-medium text-destructive">{message}</p>
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" disabled={pending} className="min-w-40">
      {pending ? "Création..." : "Créer le studio"}
    </Button>
  )
}

export function StudioForm() {
  const [state, formAction] = useActionState(createStudioAction, initialState)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [isSlugEdited, setIsSlugEdited] = useState(false)
  const [coverImage, setCoverImage] = useState<StudioImageValue | null>(null)
  const [galleryImages, setGalleryImages] = useState<StudioImageValue[]>([])
  const hasUploadedImages = Boolean(coverImage || galleryImages.length > 0)

  function handleNameChange(value: string) {
    setName(value)

    if (!isSlugEdited && !hasUploadedImages) {
      setSlug(slugifyStudioName(value))
    }
  }

  function handleSlugChange(value: string) {
    if (hasUploadedImages) {
      return
    }

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
              readOnly={hasUploadedImages}
              aria-invalid={Boolean(state.errors?.slug)}
              className="h-11"
            />
            <p className="text-xs text-slate-500">
              {hasUploadedImages
                ? "Le slug est verrouillé pour conserver les dossiers des images."
                : `Adresse publique : /studios/${slug || "studio-jasmin"}`}
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
              placeholder="Décrivez l’ambiance, les espaces et les points forts du studio..."
              aria-invalid={Boolean(state.errors?.description)}
              className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
            />
            <FieldError message={state.errors?.description} />
          </div>
        </div>
      </section>

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
              defaultValue="2"
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
              defaultValue="0"
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
              defaultValue="0"
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
              defaultValue="EUR"
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
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-lg font-bold text-slate-950">Images</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Les images sont envoyées dans les dossiers Cloudinary associés au
            slug du studio.
          </p>
        </div>

        {slug ? (
          <div className="mt-5 grid gap-6">
            <StudioImageUpload
              folder={cloudinaryFolders.studioCover(slug)}
              images={coverImage ? [coverImage] : []}
              label="Choisir l’image de couverture"
              maxFiles={1}
              onRemove={() => setCoverImage(null)}
              onUpload={setCoverImage}
            />
            <FieldError message={state.errors?.image_cover_public_id} />

            <div className="border-t border-slate-100 pt-6">
              <StudioImageUpload
                folder={cloudinaryFolders.studioGallery(slug)}
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
            <Link href="/admin/studios">Annuler</Link>
          </Button>
          <SubmitButton />
        </div>
      </div>
    </form>
  )
}
