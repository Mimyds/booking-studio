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
import { createAddonAction, type AddonActionState } from "./actions"

const initialState: AddonActionState = {}

export type AddonFormInitialValues = {
  cloudinary_public_id: string
  cloudinary_url: string
  description: string
  is_active: boolean
  name: string
  price: string
}

type AddonFormAction = (
  previousState: AddonActionState,
  formData: FormData
) => Promise<AddonActionState>

type AddonFormProps = {
  action?: AddonFormAction
  addonId?: number
  cancelHref?: string
  cloudinaryFolderId: string
  initialValues?: AddonFormInitialValues
  pendingLabel?: string
  submitLabel?: string
}

const defaultInitialValues: AddonFormInitialValues = {
  cloudinary_public_id: "",
  cloudinary_url: "",
  description: "",
  is_active: true,
  name: "",
  price: "",
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

export function AddonForm({
  action = createAddonAction,
  addonId,
  cancelHref = "/admin/add-ons",
  cloudinaryFolderId,
  initialValues = defaultInitialValues,
  pendingLabel = "Création...",
  submitLabel = "Créer l’add-on",
}: AddonFormProps) {
  const [state, formAction] = useActionState(action, initialState)
  const [image, setImage] = useState<StudioImageValue | null>(
    initialValues.cloudinary_public_id
      ? {
          image_public_id: initialValues.cloudinary_public_id,
          alt_text: initialValues.name,
          cloudinary_url: initialValues.cloudinary_url || null,
        }
      : null
  )

  return (
    <form action={formAction} className="grid gap-6">
      {addonId ? <input type="hidden" name="id" value={addonId} /> : null}
      <input
        type="hidden"
        name="cloudinary_public_id"
        value={image?.image_public_id ?? ""}
      />
      <input
        type="hidden"
        name="cloudinary_url"
        value={image?.cloudinary_url ?? ""}
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
            Définissez le nom, le prix et la disponibilité de l’option.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5 max-[720px]:grid-cols-1">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-slate-700">
              Nom <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              name="name"
              defaultValue={initialValues.name}
              placeholder="Petit-déjeuner"
              autoComplete="off"
              required
              aria-invalid={Boolean(state.errors?.name)}
              className="h-11"
            />
            <FieldError message={state.errors?.name} />
          </div>

          <div className="grid gap-2">
            <label htmlFor="price" className="text-sm font-semibold text-slate-700">
              Prix <span className="text-destructive">*</span>
            </label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initialValues.price}
              placeholder="25"
              required
              aria-invalid={Boolean(state.errors?.price)}
              className="h-11"
            />
            <FieldError message={state.errors?.price} />
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
              placeholder="Décrivez ce qui est inclus dans cet add-on..."
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
                Add-on actif
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Les add-ons inactifs restent visibles uniquement dans
                l’administration.
              </span>
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-lg font-bold text-slate-950">Image</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Un add-on possède une seule image Cloudinary.
          </p>
        </div>

        <div className="mt-5">
          <StudioImageUpload
            folder={cloudinaryFolders.addonImage(cloudinaryFolderId)}
            images={image ? [image] : []}
            label="Choisir l’image de l’add-on"
            maxFiles={1}
            onRemove={() => setImage(null)}
            onUpload={setImage}
          />
          <FieldError message={state.errors?.cloudinary_public_id} />
          <FieldError message={state.errors?.cloudinary_url} />
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
