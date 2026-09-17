"use client"

import Link from "next/link"
import { useRef, useState, type CSSProperties } from "react"
import { Menu, X } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, ScrollTrigger)

interface HeaderProps {
  brandLabel?: string
  variant?: "transparent" | "solid" | "scroll"
  initialTone?: "light" | "dark"
  showBookingCta?: boolean
  bookingHref?: string
}

const HEADER_LIGHT_FOREGROUND = "#ffffff"
const HEADER_DARK_FOREGROUND = "#111111"

export function Header({
  brandLabel = "The Studio",
  variant = "solid",
  initialTone,
  showBookingCta = true,
  bookingHref = "/studios",
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const isTransparentVariant = variant === "transparent"
  const isScrollVariant = variant === "scroll"
  const isOverlayVariant = isTransparentVariant || isScrollVariant
  const resolvedInitialTone =
    initialTone ?? (isTransparentVariant ? "light" : "dark")
  const initialForeground =
    resolvedInitialTone === "light"
      ? HEADER_LIGHT_FOREGROUND
      : HEADER_DARK_FOREGROUND
  const initialForegroundContrast =
    resolvedInitialTone === "light"
      ? HEADER_DARK_FOREGROUND
      : HEADER_LIGHT_FOREGROUND

  useGSAP(
    () => {
      if (!isScrollVariant || !headerRef.current || !backgroundRef.current) {
        return
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      const timeline = gsap.timeline({
        paused: true,
        defaults: {
          duration: reduceMotion ? 0 : 0.25,
          ease: "power2.out",
        },
      })

      timeline
        .to(backgroundRef.current, { autoAlpha: 1 }, 0)
        .to(
          headerRef.current,
          {
            "--header-contrast": HEADER_LIGHT_FOREGROUND,
            "--header-foreground": HEADER_DARK_FOREGROUND,
          },
          0
        )

      const trigger = ScrollTrigger.create({
        trigger: document.body,
        start: "top -32px",
        end: "bottom top",
        onEnter: () => timeline.play(),
        onLeaveBack: () => timeline.reverse(),
      })

      if (window.scrollY > 32) {
        timeline.progress(1)
      }

      return () => {
        trigger.kill()
        timeline.kill()
      }
    },
    { dependencies: [isScrollVariant], scope: headerRef }
  )

  return (
    <header
      ref={headerRef}
      style={
        {
          "--header-contrast": initialForegroundContrast,
          "--header-foreground": initialForeground,
        } as CSSProperties
      }
      className={cn(
        "fixed top-0 left-0 right-0 z-50 text-[var(--header-foreground)]",
        variant === "solid" && "bg-background/95 text-foreground"
      )}
    >
      <div
        ref={backgroundRef}
        style={{
          opacity: variant === "solid" ? 1 : 0,
          visibility: variant === "solid" ? "visible" : "hidden",
        }}
        className="absolute inset-0 border-b border-border bg-background/95 shadow-sm backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 -ml-2"
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
            className="font-serif text-lg tracking-wide md:text-xl"
          >
            {brandLabel}
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/studios"
              className="text-sm uppercase tracking-wide transition-opacity hover:opacity-70"
            >
              Nos Studios
            </Link>
          </nav>

          {showBookingCta && (
            <Button
              asChild
              variant={isOverlayVariant ? "outline" : "default"}
              className={cn(
                "text-xs tracking-widest uppercase font-medium",
                isOverlayVariant
                  ? "border-current bg-transparent text-[var(--header-foreground)] hover:bg-[var(--header-foreground)] hover:text-[var(--header-contrast)]"
                  : ""
              )}
            >
              <Link href={bookingHref}>Réserver maintenant</Link>
            </Button>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="relative border-t border-border bg-background text-foreground md:hidden">
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
