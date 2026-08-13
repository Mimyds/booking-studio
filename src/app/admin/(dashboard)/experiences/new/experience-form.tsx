"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { LoaderCircle } from "lucide-react"
import {
  StudioImageUpload,
  type StudioImageValue,
} from "@/components/cloudinary/studio-image-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cloudinaryFolders } from "@/lib/cloudinary/config"
import {
  createExperienceAction,
  type ExperienceActionState,
} from "./actions"

const initialState: ExperienceActionState = {}

export type ExperienceFormInitialValues = {
  cover_image_public_id: string
  description: string
  external_url: string
  is_active: boolean
  thumbnail_image_public_id: string
  title: string
}

type ExperienceFormAction = (
  previousState: ExperienceActionState,
  formData: FormData
) => Promise<ExperienceActionState>

type ExperienceFormProps = {
  action?: ExperienceFormAction
  cancelHref?: string
  cloudinaryFolderId: string
  experienceId?: number
  initialValues?: ExperienceFormInitialValues
  pendingLabel?: string
  submitLabel?: string
}

const defaultInitialValues: ExperienceFormInitialValues = {
  cover_image_public_id: "",
  description: "",
  external_url: "",
  is_active: true,
  thumbnail_image_public_id: "",
  title: "",
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
      {pending ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : null}
      {pending ? pendingLabel : submitLabel}
    </Button>
  )
}

export function ExperienceForm({
  action = createExperienceAction,
  cancelHref = "/admin/experiences",
  cloudinaryFolderId,
  experienceId,
  initialValues = defaultInitialValues,
  pendingLabel = "Création...",
  submitLabel = "Créer l’expérience",
}: ExperienceFormProps) {
  const [state, formAction] = useActionState(action, initialState)
  const [coverImage, setCoverImage] = useState<StudioImageValue | null>(
    initialValues.cover_image_public_id
      ? {
          image_public_id: initialValues.cover_image_public_id,
          alt_text: initialValues.title,
        }
      : null
  )
  const [thumbnailImage, setThumbnailImage] = useState<StudioImageValue | null>(
    initialValues.thumbnail_image_public_id
      ? {
          image_public_id: initialValues.thumbnail_image_public_id,
          alt_text: initialValues.title,
        }
      : null
  )

  return (
    <form action={formAction} className="grid gap-6">
      {experienceId ? (
        <input type="hidden" name="id" value={experienceId} />
      ) : null}
      <input
        type="hidden"
        name="cover_image_public_id"
        value={coverImage?.image_public_id ?? ""}
      />
      <input
        type="hidden"
        name="thumbnail_image_public_id"
        value={thumbnailImage?.image_public_id ?? ""}
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
            Définissez le titre, le lien externe et la disponibilité de
            l’expérience.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5 max-[720px]:grid-cols-1">
          <div className="grid gap-2">
            <label
              htmlFor="title"
              className="text-sm font-semibold text-slate-700"
            >
              Titre <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              name="title"
              defaultValue={initialValues.title}
              placeholder="Massage bien-être"
              autoComplete="off"
              required
              aria-invalid={Boolean(state.errors?.title)}
              className="h-11"
            />
            <FieldError message={state.errors?.title} />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="external_url"
              className="text-sm font-semibold text-slate-700"
            >
              URL externe
            </label>
            <Input
              id="external_url"
              name="external_url"
              type="url"
              defaultValue={initialValues.external_url}
              placeholder="https://..."
              aria-invalid={Boolean(state.errors?.external_url)}
              className="h-11"
            />
            <FieldError message={state.errors?.external_url} />
          </div>

          <div className="col-span-2 grid gap-2 max-[720px]:col-span-1">
            <label
              htmlFor="description"
              className="text-sm font-semibold text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={initialValues.description}
              placeholder="Décrivez l’expérience proposée..."
              aria-invalid={Boolean(state.errors?.description)}
              className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
            />
            <FieldError message={state.errors?.description} />
          </div>

          <label className="col-span-2 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 max-[720px]:col-span-1">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={initialValues.is_active}
              className="mt-0.5 size-4 rounded border-slate-300 accent-slate-950"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Expérience active
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Les expériences inactives restent visibles uniquement dans
                l’administration.
              </span>
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-lg font-bold text-slate-950">Images</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Une expérience possède une image de couverture et une miniature
            Cloudinary.
          </p>
        </div>

        <div className="mt-5 grid gap-6">
          <StudioImageUpload
            folder={cloudinaryFolders.experienceCover(cloudinaryFolderId)}
            images={coverImage ? [coverImage] : []}
            label="Choisir l’image de couverture"
            maxFiles={1}
            onRemove={() => setCoverImage(null)}
            onUpload={setCoverImage}
          />
          <FieldError message={state.errors?.cover_image_public_id} />

          <div className="border-t border-slate-100 pt-6">
            <StudioImageUpload
              folder={cloudinaryFolders.experienceThumbnail(cloudinaryFolderId)}
              images={thumbnailImage ? [thumbnailImage] : []}
              label="Choisir la miniature"
              maxFiles={1}
              onRemove={() => setThumbnailImage(null)}
              onUpload={setThumbnailImage}
            />
            <FieldError message={state.errors?.thumbnail_image_public_id} />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3 max-[520px]:grid">
        <Button asChild variant="outline" size="lg">
          <Link href={cancelHref}>Annuler</Link>
        </Button>
        <SubmitButton pendingLabel={pendingLabel} submitLabel={submitLabel} />
      </div>
    </form>
  )
}
