"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ImageSkeleton() {
  return (
    <div className="flex flex-col items-center mb-6 max-w-3xl mx-auto">
      <div className="relative w-full">
        <Skeleton className="h-[300px] w-[375px] rounded-lg" />
      </div>
    </div>
  )
}
