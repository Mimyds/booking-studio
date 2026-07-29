"use client"

import { CldImage } from "next-cloudinary"

type CloudinaryImageProps = {
  alt: string
  className?: string
  height: number
  publicId: string
  width: number
}

export function CloudinaryImage({
  alt,
  className,
  height,
  publicId,
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
      className={className}
    />
  )
}
