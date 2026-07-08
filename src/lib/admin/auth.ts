import { createServerSupabaseClient } from "@/lib/supabase/server"

export type CurrentAdmin = {
  user: {
    id: string
    email?: string
  }
  adminUser: {
    id: string
    email: string
    full_name: string | null
    role: "owner" | "admin"
    is_active: boolean
  }
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data: adminUser, error: adminUserError } = await supabase
    .from("admin_users")
    .select("id, email, full_name, role, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .single()

  if (adminUserError || !adminUser) {
    return null
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    adminUser: adminUser as CurrentAdmin["adminUser"],
  }
}
