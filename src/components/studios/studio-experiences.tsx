"use client"

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { CloudinaryImage } from "@/components/cloudinary/cloudinary-image"
import { Button } from "@/components/ui/button"

export type StudioExperienceItem = {
  description: string | null
  externalUrl: string | null
  imagePublicId: string
  title: string
}

type StudioExperiencesProps = {
  experiences: StudioExperienceItem[]
}

export function StudioExperiences({ experiences }: StudioExperiencesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (experiences.length === 0) {
    return null
  }

  const currentExperience = experiences[currentIndex]
  const hasMultipleExperiences = experiences.length > 1

  function goToPrevious() {
    setCurrentIndex((index) =>
      index === 0 ? experiences.length - 1 : index - 1
    )
  }

  function goToNext() {
    setCurrentIndex((index) =>
      index === experiences.length - 1 ? 0 : index + 1
    )
  }

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="relative min-h-[560px] md:min-h-[620px]">
        <CloudinaryImage
          publicId={currentExperience.imagePublicId}
          alt={currentExperience.title}
          width={1800}
          height={1100}
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/10" />

        {hasMultipleExperiences ? (
          <div className="absolute bottom-6 left-4 flex gap-2 md:bottom-8 md:left-8">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="size-10 rounded-full border-white/60 bg-transparent text-white hover:bg-white/20 hover:text-white"
              aria-label="Expérience précédente"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="size-10 rounded-full border-white/60 bg-transparent text-white hover:bg-white/20 hover:text-white"
              aria-label="Expérience suivante"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        ) : null}
      </div>

      <div className="relative bg-muted/95 p-8 md:absolute md:right-8 md:top-1/2 md:w-[45vw] md:max-w-[520px] md:-translate-y-1/2 md:p-11 lg:right-16">
        <h2 className="mb-8 font-serif text-2xl uppercase tracking-wide text-neutral-800">
          Expériences
        </h2>
        <div className="grid gap-6">
          <div className="relative overflow-hidden bg-background">
            <CloudinaryImage
              publicId={currentExperience.imagePublicId}
              alt={currentExperience.title}
              width={720}
              height={480}
              sizes="(max-width: 768px) 80vw, 440px"
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
          <div className="grid gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              {currentExperience.title}
            </h3>
            {currentExperience.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {currentExperience.description}
              </p>
            ) : null}
            {currentExperience.externalUrl ? (
              <Link
                href={currentExperience.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold transition-[gap] hover:gap-3"
              >
                En savoir plus
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
