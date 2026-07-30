import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Amenity } from "@/lib/studios/types"

type CreateAmenityBody = {
  description?: unknown
  icon_name?: unknown
  label?: unknown
}

function getOptionalText(value: unknown) {
  return typeof value === "string" ? value.trim() || null : null
}

export async function POST(request: NextRequest) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as CreateAmenityBody
  const label = getOptionalText(body.label)

  if (!label) {
    return NextResponse.json(
      { error: "Le nom de l’équipement est requis." },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabaseClient()
  const { data: amenity, error } = await supabase
    .from("amenities")
    .insert([
      {
        label,
        icon_name: getOptionalText(body.icon_name),
        description: getOptionalText(body.description),
      },
    ])
    .select("id, created_at, label, icon_name, description")
    .single()

  if (error) {
    console.error("[create-amenity] Supabase insert failed", {
      code: error.code,
      message: error.message,
    })

    return NextResponse.json(
      { error: "L’équipement n’a pas pu être créé." },
      { status: 500 }
    )
  }

  return NextResponse.json({ amenity: amenity as Amenity }, { status: 201 })
}
