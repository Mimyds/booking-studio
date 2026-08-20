"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

import { CloudinaryImage } from "@/components/cloudinary/cloudinary-image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type StudioGalleryItem = {
  alt: string
  publicId: string
}

type StudioGalleryProps = {
  images: StudioGalleryItem[]
  studioName: string
}

export function StudioGallery({ images, studioName }: StudioGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) {
    return null
  }

  const currentImage = images[currentIndex]
  const hasMultipleImages = images.length > 1

  function goToPrevious() {
    setCurrentIndex((index) => (index === 0 ? images.length - 1 : index - 1))
  }

  function goToNext() {
    setCurrentIndex((index) => (index === images.length - 1 ? 0 : index + 1))
  }

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="mb-10 text-center font-serif text-2xl uppercase tracking-wide text-neutral-800 md:mb-12 md:text-3xl">
          Gallery
        </h2>

        <div className="relative mx-auto max-w-4xl">
          <div className="relative overflow-hidden bg-muted">
            <CloudinaryImage
              publicId={currentImage.publicId}
              alt={currentImage.alt || `${studioName} - Photo ${currentIndex + 1}`}
              width={1200}
              height={900}
              sizes="(max-width: 768px) 92vw, 960px"
              className="aspect-[4/3] w-full object-cover"
              priority={currentIndex === 0}
            />
          </div>

          {hasMultipleImages ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 size-10 -translate-y-1/2 rounded-full border-0 bg-white/95 text-neutral-900 shadow-md hover:bg-white md:left-4"
                aria-label="Image précédente"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="absolute right-3 top-1/2 size-10 -translate-y-1/2 rounded-full border-0 bg-white/95 text-neutral-900 shadow-md hover:bg-white md:right-4"
                aria-label="Image suivante"
              >
                <ChevronRight className="size-5" />
              </Button>

              <div className="mt-6 flex justify-center gap-2">
                {images.map((image, index) => (
                  <button
                    key={`${image.publicId}-${index}`}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "size-2 rounded-full transition-colors",
                      index === currentIndex
                        ? "bg-neutral-950"
                        : "bg-neutral-300 hover:bg-neutral-500"
                    )}
                    aria-label={`Afficher l'image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
