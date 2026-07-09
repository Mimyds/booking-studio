"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export type AdminLoginActionState = {
  error?: string
}

export async function loginAdminAction(
  formData: FormData
): Promise<AdminLoginActionState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Email et mot de passe requis." }
  }

  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { error: "Identifiants invalides." }
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", data.user.id)
    .eq("is_active", true)
    .single()

  if (adminError || !adminUser) {
    await supabase.auth.signOut()
    return { error: "Ce compte n’a pas accès à l’administration." }
  }

  return {}
}
