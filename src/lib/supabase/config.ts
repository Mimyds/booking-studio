type SupabaseConfig = {
  supabaseUrl: string
  supabaseKey: string
}

function firstEnvValue(envNames: string[]) {
  return envNames.find((envName) => process.env[envName])
}

function getRequiredEnv(envNames: string[], label: string) {
  const envName = firstEnvValue(envNames)

  if (!envName) {
    throw new Error(
      `Missing Supabase environment variables for ${label}: ${envNames.join(" or ")}`
    )
  }

  return process.env[envName]!
}

export function getSupabaseBrowserConfig(): SupabaseConfig {
  return {
    supabaseUrl: getRequiredEnv(
      ["NEXT_PUBLIC_SUPABASE_URL"],
      "browser URL"
    ),
    supabaseKey: getRequiredEnv(
      ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
      "browser publishable key"
    ),
  }
}

export function getSupabaseServerConfig(): SupabaseConfig {
  return {
    supabaseUrl: getRequiredEnv(
      ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"],
      "server URL"
    ),
    supabaseKey: getRequiredEnv(
      [
        "SUPABASE_PUBLISHABLE_KEY",
        "SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ],
      "server publishable key"
    ),
  }
}

export const getSupabaseConfig = getSupabaseBrowserConfig
