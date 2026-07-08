const requiredSupabaseEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const

export function getSupabaseConfig() {
  const missingEnv = requiredSupabaseEnv.filter((envName) => !process.env[envName])

  if (missingEnv.length > 0) {
    throw new Error(
      `Missing Supabase environment variables: ${missingEnv.join(", ")}`
    )
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  }
}
