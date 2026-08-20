"use client"

import { CldImage } from "next-cloudinary"

type CloudinaryImageProps = {
  alt: string
  className?: string
  height: number
  priority?: boolean
  publicId: string
  sizes?: string
  width: number
}

export function CloudinaryImage({
  alt,
  className,
  height,
  priority,
  publicId,
  sizes,
  width,
}: CloudinaryImageProps) {
  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={width}
      height={height}
      crop="fill"
      gravity="auto"
      priority={priority}
      sizes={sizes}
      className={className}
    />
  )
}
