import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { randomUUID } from "node:crypto"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Addon } from "@/lib/addons/types"
import { getAddonCloudinaryFolderId } from "@/lib/cloudinary/config"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { AddonForm, type AddonFormInitialValues } from "../../new/addon-form"
import { updateAddonAction } from "./actions"

type EditAddonPageProps = {
  params: Promise<{ id: string }>
}

function getAddonId(value: string) {
  const addonId = Number(value)

  return Number.isInteger(addonId) && addonId > 0 ? addonId : null
}

export async function generateMetadata({
  params,
}: EditAddonPageProps): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Modifier add-on ${id} | The Studio`,
    description: "Modification d’un add-on dans le catalogue The Studio.",
  }
}

export default async function EditAddonPage({ params }: EditAddonPageProps) {
  const { id } = await params
  const addonId = getAddonId(id)

  if (!addonId) {
    notFound()
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("addons")
    .select(
      "id, created_at, name, description, price, is_active, cloudinary_url, cloudinary_public_id"
    )
    .eq("id", addonId)
    .maybeSingle()

  if (error) {
    throw new Error("Impossible de charger l’add-on.")
  }

  if (!data) {
    notFound()
  }

  const addon = data as Addon
  const cloudinaryFolderId =
    addon.cloudinary_public_id &&
    getAddonCloudinaryFolderId(addon.cloudinary_public_id)
      ? getAddonCloudinaryFolderId(addon.cloudinary_public_id)!
      : randomUUID()
  const initialValues: AddonFormInitialValues = {
    cloudinary_public_id: addon.cloudinary_public_id ?? "",
    cloudinary_url: addon.cloudinary_url ?? "",
    description: addon.description ?? "",
    is_active: addon.is_active,
    name: addon.name,
    price: String(addon.price ?? ""),
  }

  return (
    <main className="grid gap-6">
      <section className="flex items-start justify-between gap-4 max-[720px]:grid">
        <div>
          <Badge variant="secondary">Catalogue</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
            Modifier l’add-on
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Mettez à jour les informations et l’image Cloudinary de “{addon.name}”.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/admin/add-ons">Retour aux add-ons</Link>
        </Button>
      </section>

      <AddonForm
        action={updateAddonAction}
        addonId={addon.id}
        cloudinaryFolderId={cloudinaryFolderId}
        initialValues={initialValues}
        pendingLabel="Modification..."
        submitLabel="Modifier l’add-on"
      />
    </main>
  )
}
