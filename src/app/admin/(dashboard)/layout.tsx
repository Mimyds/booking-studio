import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { getCurrentAdmin } from "@/lib/admin/auth"

const navigationItems = [
  { href: "/admin", label: "Dashboard", marker: "⌘D" },
  { href: "/admin/reservations", label: "Réservations", marker: "⌘R" },
  { href: "/admin/studios", label: "Studios", marker: "⌘S" },
  { href: "/admin/settings", label: "Paramètres", marker: "⌘," },
]

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
      <div className="grid min-h-screen grid-cols-[18rem_minmax(0,1fr)] max-[900px]:grid-cols-1">
        <aside className="sticky top-0 flex h-screen flex-col border-r border-slate-400/20 bg-slate-950 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_18rem)] p-5 text-slate-50 backdrop-blur-xl max-[900px]:static max-[900px]:h-auto max-[900px]:border-r-0 max-[900px]:border-b">
          <div className="flex items-center gap-3 px-1 pb-5 pt-1">
            <div className="grid size-11 place-items-center rounded-2xl border border-white/15 bg-gradient-to-br from-violet-600 to-sky-500 text-xs font-extrabold tracking-wider shadow-2xl shadow-slate-950/40">
              TS
            </div>
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-slate-400">
                The Studio
              </p>
              <p className="mt-0.5 text-base font-bold tracking-tight">
                Command center
              </p>
            </div>
          </div>

          <Separator className="bg-slate-400/20" />

          <nav className="grid gap-2 py-5" aria-label="Navigation admin">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-slate-400 transition hover:border-white/10 hover:bg-white/10 hover:text-white aria-[current=page]:border-white/10 aria-[current=page]:bg-white/10 aria-[current=page]:text-white"
                aria-current={item.href === "/admin" ? "page" : undefined}
              >
                <span>{item.label}</span>
                <kbd className="rounded-lg bg-white/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-slate-200/80">
                  {item.marker}
                </kbd>
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.38),transparent_40%)] p-4">
            <p className="text-xs text-slate-400">Statut plateforme</p>
            <p className="mt-1 text-sm font-bold">En intégration</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full w-[42%] rounded-full bg-gradient-to-r from-violet-400 to-sky-400" />
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-50 flex min-h-[5.5rem] items-center justify-between gap-6 border-b border-slate-300/80 bg-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,250,252,0.82))] px-[clamp(1.25rem,3vw,2.5rem)] py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl max-[900px]:static max-[900px]:flex-col max-[900px]:items-stretch">
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
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
