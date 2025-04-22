"use client"

import { ImageSkeleton } from "./ImageSkeleton"
export function LoadingState() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-[5px] p-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <ImageSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

