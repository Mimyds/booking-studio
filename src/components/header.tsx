"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeaderProps {
  variant?: "transparent" | "solid"
  showBookingCta?: boolean
  bookingHref?: string
}

export function Header({
  variant = "solid",
  showBookingCta = true,
  bookingHref = "/studios",
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        variant === "transparent"
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur-sm border-b border-border"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "md:hidden p-2 -ml-2",
              variant === "transparent" ? "text-white" : "text-foreground"
            )}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>

          <Link
            href="/"
            className={cn(
              "font-serif text-lg md:text-xl tracking-wide",
              variant === "transparent" ? "text-white" : "text-foreground"
            )}
          >
            The Studio
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/studios"
              className={cn(
                "text-sm tracking-wide uppercase hover:opacity-70 transition-opacity",
                variant === "transparent" ? "text-white" : "text-foreground"
              )}
            >
              Nos Studios
            </Link>
          </nav>

          {showBookingCta && (
            <Button
              asChild
              variant={variant === "transparent" ? "outline" : "default"}
              className={cn(
                "text-xs tracking-widest uppercase font-medium",
                variant === "transparent"
                  ? "border-white text-white hover:bg-white hover:text-foreground bg-transparent"
                  : ""
              )}
            >
              <Link href={bookingHref}>Réserver maintenant</Link>
            </Button>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-6">
            <Link
              href="/studios"
              className="py-2 text-sm tracking-wide uppercase"
              onClick={() => setIsMenuOpen(false)}
            >
              Nos Studios
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
