import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8 md:px-8 md:py-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="text-xs text-muted-foreground">
            &copy; The Studio {new Date().getFullYear()}. All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs md:gap-8">
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
            >
              Instagram
            </Link>
            <span className="text-muted-foreground">Tel: +596 696 07 04 48</span>
            <Link
              href="mailto:contact@thestudio.com"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
            >
              Mail: contact@thestudio.com
            </Link>
            <Link
              href="#"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
            >
              Carte
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
