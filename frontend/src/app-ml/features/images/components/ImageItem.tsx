"use client"

import { useState, useEffect, useRef } from "react"
import { useLabelStore } from "@/app-ml/features/labels/stores/labelStore"
import { cn } from "@/lib/utils"
import type { ImageStatus } from "@/app-ml/types"
import { ImageControls } from "./ImageControls"


interface ImageItemProps {
  fragment: {
    id: string
    imageUrl: string
    status?: ImageStatus
    categoryTips?: any[]
    labelId?: string
  }
  onThumbsUp: (fragmentId: string) => void
  onThumbsDown: (fragmentId: string, labelId: string) => void
}

export function ImageItem({ fragment, onThumbsUp, onThumbsDown }: ImageItemProps) {
  const [showControls, setShowControls] = useState(false)

  // Refs for timeouts to prevent flickering
  const hoverTimerRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get categories from store
  const { categories: allCategories } = useLabelStore()

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current)
      }
    }
  }, [])

  // Improved hover handling
  const handleMouseEnter = () => {
    // Clear any pending hide timer
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    setShowControls(true)
  }

  const handleMouseLeave = () => {
    // Add a delay before hiding controls to prevent flickering
    hoverTimerRef.current = window.setTimeout(() => {
      setShowControls(false)
    }, 300)
  }

  // Determine image state for styling
  const isCorrect = fragment.status === "correct"
  const isIncorrect = fragment.status === "incorrect"

  return (
    <div className="flex flex-col items-center mb-6 w-full sm:w-auto">
      <div
        ref={containerRef}
        className="relative w-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={fragment.imageUrl || "/placeholder.svg?height=300&width=400"}
          alt={`Фрагмент ${fragment.id}`}
          className={cn(
            "object-cover w-full max-w-[375px] transition-all duration-300 ease-in-out",
            isCorrect
              ? "opacity-70 outline outline-3 outline-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              : isIncorrect
                ? "opacity-70 outline outline-3 outline-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  : "",
          )}
        />

        {/* Controls */}
        <ImageControls
          fragment={{
            id: fragment.id,
            status: fragment.status,
            categoryTips: fragment.categoryTips,
            labelId: fragment.labelId,
          }}
          allCategories={allCategories}
          onThumbsUp={onThumbsUp}
          onThumbsDown={onThumbsDown}
          isVisible={showControls}
        />
      </div>
    </div>
  )
}
