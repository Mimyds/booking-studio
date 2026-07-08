import { beforeEach, describe, expect, it, vi } from "vitest"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}))

const createServerSupabaseClientMock = vi.mocked(createServerSupabaseClient)

function createAdminQueryMock({
  data,
  error = null,
}: {
  data: unknown
  error?: unknown
}) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  }

  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.single.mockResolvedValue({ data, error })

  return query
}

describe("getCurrentAdmin", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset()
  })

  it("returns null when there is no authenticated user", async () => {
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
      from: vi.fn(),
    } as never)

    await expect(getCurrentAdmin()).resolves.toBeNull()
  })

  it("returns null when the user is not an active admin", async () => {
    const query = createAdminQueryMock({
      data: null,
      error: new Error("Not found"),
    })

    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "admin@example.com" } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(query),
    } as never)

    await expect(getCurrentAdmin()).resolves.toBeNull()
    expect(query.eq).toHaveBeenCalledWith("id", "user-1")
    expect(query.eq).toHaveBeenCalledWith("is_active", true)
  })

  it("returns the authenticated active admin", async () => {
    const adminUser = {
      id: "user-1",
      email: "admin@example.com",
      full_name: "Admin User",
      role: "owner",
      is_active: true,
    }
    const query = createAdminQueryMock({ data: adminUser })

    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "admin@example.com" } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(query),
    } as never)

    await expect(getCurrentAdmin()).resolves.toEqual({
      user: {
        id: "user-1",
        email: "admin@example.com",
      },
      adminUser,
    })
  })
})
