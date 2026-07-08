import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { getCurrentAdmin } from "@/lib/admin/auth"
import styles from "./admin-layout.module.css"

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
    <div className={styles.shell}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <div className={styles.logoMark}>TS</div>
            <div>
              <p className={styles.eyebrow}>The Studio</p>
              <p className={styles.title}>Command center</p>
            </div>
          </div>

          <Separator className={styles.sidebarSeparator} />

          <nav className={styles.nav} aria-label="Navigation admin">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navLink}
                aria-current={item.href === "/admin" ? "page" : undefined}
              >
                <span>{item.label}</span>
                <kbd>{item.marker}</kbd>
              </Link>
            ))}
          </nav>

          <div className={styles.sidebarCallout}>
            <p className={styles.calloutLabel}>Statut plateforme</p>
            <p className={styles.calloutValue}>En intégration</p>
            <div className={styles.calloutMeter}>
              <span />
            </div>
          </div>
        </aside>

        <div className={styles.main}>
          <header className={styles.topbar}>
            <div>
              <p className={styles.dateLabel}>{formattedDate}</p>
              <p className={styles.pageContext}>Pilotage des réservations</p>
            </div>

            <div className={styles.topbarActions}>
              <div className={styles.search}>
                <span>⌕</span>
                <Input placeholder="Rechercher..." />
              </div>
              <Button variant="outline">
                Export
              </Button>
              <div className={styles.userPill}>
                <Avatar size="lg">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className={styles.userMeta}>
                  <span>{email}</span>
                  <Badge variant="secondary">{currentAdmin.adminUser.role}</Badge>
                </div>
              </div>
            </div>
          </header>

          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  )
}
