import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCurrentAdmin } from "@/lib/admin/auth"
import {
  AdminDesktopSidebar,
  AdminMobileBottomNav,
  AdminMobileTopBar,
} from "./admin-navigation"

export const dynamic = "force-dynamic"

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    redirect("/admin/login")
  }

  const email = currentAdmin.adminUser.email
  const initials = email.slice(0, 2).toUpperCase()
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 [background:radial-gradient(circle_at_32rem_8rem,rgba(124,58,237,0.14),transparent_28rem),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.14),transparent_24rem),#f8fafc]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <AdminDesktopSidebar />

        <div className="min-w-0 pb-24 lg:pb-0">
          <AdminMobileTopBar
            email={email}
            initials={initials}
            role={currentAdmin.adminUser.role}
          />

          <header className="sticky top-0 z-50 hidden min-h-[5.5rem] items-center justify-between gap-6 border-b border-slate-300/80 bg-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,250,252,0.82))] px-[clamp(1.25rem,3vw,2.5rem)] py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl lg:flex">
            <div>
              <p className="text-xs font-semibold capitalize text-slate-500">
                {formattedDate}
              </p>
              <p className="mt-0.5 text-sm font-bold">
                Pilotage des réservations
              </p>
            </div>

            <div className="flex items-center gap-3 max-[900px]:flex-wrap max-[900px]:items-stretch">
              <div className="relative w-[min(19rem,26vw)] max-[900px]:w-full">
                <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                  ⌕
                </span>
                <Input
                  placeholder="Rechercher..."
                  className="h-11 border-slate-200/95 bg-white/70 pl-9 shadow-sm shadow-slate-950/5"
                />
              </div>
              <Button
                variant="outline"
                className="h-11 border-slate-200/95 bg-white/80 shadow-sm shadow-slate-950/5"
              >
                Export
              </Button>
              <div className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200/95 bg-white/80 p-2 shadow-sm shadow-slate-950/5 max-[640px]:w-full">
                <Avatar className="size-9">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 gap-0.5">
                  <span className="max-w-52 truncate text-xs font-bold">
                    {email}
                  </span>
                  <Badge variant="secondary">{currentAdmin.adminUser.role}</Badge>
                </div>
              </div>
            </div>
          </header>

          <div className="min-w-0 p-[clamp(1.25rem,3vw,2.5rem)]">
            <section className="mb-5 grid gap-4 rounded-[2rem] border border-slate-200/80 bg-white/85 p-4 shadow-xl shadow-slate-950/5 backdrop-blur-xl lg:hidden">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold capitalize text-slate-500">
                    {formattedDate}
                  </p>
                  <p className="mt-0.5 text-lg font-extrabold tracking-tight">
                    Pilotage des réservations
                  </p>
                </div>
                <Badge variant="secondary">Admin</Badge>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-3 max-[420px]:grid-cols-1">
                <div className="relative min-w-0">
                  <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                    ⌕
                  </span>
                  <Input
                    placeholder="Rechercher..."
                    className="h-12 rounded-2xl border-slate-200/95 bg-white/80 pl-9 shadow-sm shadow-slate-950/5"
                  />
                </div>
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl border-slate-200/95 bg-white/80 px-5 shadow-sm shadow-slate-950/5"
                >
                  Export
                </Button>
              </div>
            </section>

            {children}
          </div>
        </div>
      </div>
      <AdminMobileBottomNav />
    </div>
  )
}
