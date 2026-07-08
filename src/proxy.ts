import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"
import { getSupabaseConfig } from "@/lib/supabase/config"

function createProxySupabaseClient(
  request: NextRequest,
  response: NextResponse
) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value)
        })
      },
    },
  })
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminLogin = pathname === "/admin/login"
  const isAdminApi = pathname.startsWith("/api/admin")
  const response = NextResponse.next({ request })

  if (isAdminLogin) {
    return response
  }

  const supabase = createProxySupabaseClient(request, response)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    return response
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = "/admin/login"
  redirectUrl.searchParams.set("next", pathname)

  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
