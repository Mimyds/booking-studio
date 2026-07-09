"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  CalendarCheck,
  LayoutDashboard,
  Settings,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const navigationItems = [
  {
    href: "/admin",
    label: "Dashboard",
    marker: "⌘D",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/bookings",
    label: "Réservations",
    marker: "⌘R",
    icon: CalendarCheck,
  },
  {
    href: "/admin/studios",
    label: "Studios",
    marker: "⌘S",
    icon: Building2,
  },
  {
    href: "/admin/settings",
    label: "Paramètres",
    marker: "⌘,",
    icon: Settings,
  },
]

type AdminNavigationProps = {
  email: string
  initials: string
  role: "owner" | "admin"
}

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminDesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-slate-400/20 bg-slate-950 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_18rem)] p-5 text-slate-50 backdrop-blur-xl lg:flex">
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
        {navigationItems.map((item) => {
          const isActive = isActivePath(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-slate-400 transition hover:border-white/10 hover:bg-white/10 hover:text-white aria-[current=page]:border-white/10 aria-[current=page]:bg-white/10 aria-[current=page]:text-white"
              aria-current={isActive ? "page" : undefined}
            >
              <span>{item.label}</span>
              <kbd className="rounded-lg bg-white/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-slate-200/80">
                {item.marker}
              </kbd>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.38),transparent_40%)] p-4">
        <p className="text-xs text-slate-400">Statut plateforme</p>
        <p className="mt-1 text-sm font-bold">En intégration</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full w-[42%] rounded-full bg-gradient-to-r from-violet-400 to-sky-400" />
        </div>
      </div>
    </aside>
  )
}

export function AdminMobileTopBar({
  email,
  initials,
  role,
}: AdminNavigationProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white shadow-2xl shadow-slate-950/20 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-gradient-to-br from-violet-600 to-sky-500 text-xs font-extrabold tracking-wider shadow-xl shadow-slate-950/30">
            TS
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">
              The Studio
            </p>
            <p className="truncate text-base font-bold tracking-tight">
              Command center
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/10 p-1.5">
          <Avatar className="size-8 border border-white/10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 pr-2 min-[520px]:grid">
            <span className="max-w-44 truncate text-xs font-bold">{email}</span>
            <span className="text-[0.65rem] font-semibold text-slate-300">
              {role}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export function AdminMobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:hidden"
      aria-label="Navigation admin mobile"
    >
      <div className="grid grid-cols-4 gap-1 rounded-3xl border border-slate-200/80 bg-slate-50/90 p-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = isActivePath(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className="grid min-h-14 place-items-center gap-0.5 rounded-2xl px-1 py-2 text-[0.65rem] font-semibold text-slate-500 transition aria-[current=page]:bg-slate-950 aria-[current=page]:text-white"
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
