"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getSupabaseServerDebugInfo } from "@/lib/supabase/config"

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
    console.warn("[admin-login] Supabase auth failed", {
      ...getSupabaseServerDebugInfo(),
      authStatus: error?.status,
      authCode: error?.code,
      authMessage: error?.message,
      hasUser: Boolean(data.user),
    })

    return { error: "Identifiants invalides." }
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", data.user.id)
    .eq("is_active", true)
    .single()

  if (adminError || !adminUser) {
    console.warn("[admin-login] Admin user check failed", {
      ...getSupabaseServerDebugInfo(),
      userId: data.user.id,
      adminCode: adminError?.code,
      adminMessage: adminError?.message,
      hasAdminUser: Boolean(adminUser),
    })

    await supabase.auth.signOut()
    return { error: "Ce compte n’a pas accès à l’administration." }
  }

  return {}
}
