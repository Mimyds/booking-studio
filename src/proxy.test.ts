import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { proxy } from "@/proxy"

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}))

const createServerClientMock = vi.mocked(createServerClient)

function createRequest(pathname: string) {
  return new NextRequest(new URL(pathname, "http://localhost:3000"))
}

function mockProxyUser(user: unknown) {
  createServerClientMock.mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
      }),
    },
  } as never)
}

describe("proxy", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321"
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable-key"
    createServerClientMock.mockReset()
  })

  it("allows the admin login page without checking Supabase", async () => {
    const response = await proxy(createRequest("/admin/login"))

    expect(response?.status).toBe(200)
    expect(createServerClientMock).not.toHaveBeenCalled()
  })

  it("redirects unauthenticated admin page requests to login", async () => {
    mockProxyUser(null)

    const response = await proxy(createRequest("/admin/reservations"))

    expect(response?.status).toBe(307)
    expect(response?.headers.get("location")).toBe(
      "http://localhost:3000/admin/login?next=%2Fadmin%2Freservations"
    )
  })

  it("returns 401 for unauthenticated admin API requests", async () => {
    mockProxyUser(null)

    const response = await proxy(createRequest("/api/admin/dashboard/metrics"))

    expect(response?.status).toBe(401)
    await expect(response?.json()).resolves.toEqual({ error: "Unauthorized" })
  })

  it("allows authenticated admin requests through", async () => {
    mockProxyUser({ id: "user-1" })

    const response = await proxy(createRequest("/admin"))

    expect(response?.status).toBe(200)
  })
})
