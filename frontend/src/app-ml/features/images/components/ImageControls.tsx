"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThumbsUp, ThumbsDown, ChevronDown, Check, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import type { CategoryTip, Label, ImageStatus } from "@/app-ml/types"

interface ImageControlsProps {
  fragment: {
    id: string
    status?: ImageStatus
    categoryTips?: CategoryTip[]
    labelId?: string
  }
  allCategories: Label[]
  onThumbsUp: (fragmentId: string) => void
  onThumbsDown: (fragmentId: string, labelId: string) => void
  isVisible: boolean
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function ImageControls({ fragment, allCategories, onThumbsUp, onThumbsDown, isVisible }: ImageControlsProps) {
  // Internal state
  const [rating, setRating] = useState<"positive" | "negative" | null>(
    fragment.status === "correct" ? "positive" : fragment.status === "incorrect" ? "negative" : null,
  )
  const [value, setValue] = useState("")
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(fragment.labelId || null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false)

  // Ref for the container
  // const containerRef = useRef<HTMLDivElement>(null)

  // Use category_tips if available
  const suggestedCategories = fragment.categoryTips && fragment.categoryTips.length > 0 ? fragment.categoryTips : []

  // Filter categories based on search query
  const filteredCategories = allCategories.filter((cat) =>
    cat.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Update rating when fragment status changes
  useEffect(() => {
    if (fragment.status === "correct") {
      setRating("positive")
    } else if (fragment.status === "incorrect") {
      setRating("negative")
    }
  }, [fragment.status])

  // Function to toggle rating
  const handleRatingToggle = (newRating: "positive" | "negative") => {
    // If current rating matches selected rating, reset it
    if (rating === newRating) {
      setRating(null)
      setValue("")
      setSelectedLabelId(null)
    } else {
      // Set new rating
      setRating(newRating)

      if (newRating === "positive") {
        // Clear selected category when switching to positive rating
        setValue("")
        setSelectedLabelId(null)
        handlePositiveRating()
      } else if (newRating === "negative") {
        // Mark as incorrect with empty category when thumbs down is clicked
        handleNegativeRating()
      }
    }
  }

  // Handle thumbs up click
  const handlePositiveRating = () => {
    onThumbsUp(fragment.id)
  }

  // Handle thumbs down click - mark as incorrect without category
  const handleNegativeRating = () => {
    onThumbsDown(fragment.id, "")
    setSelectedLabelId(null)
    setValue("")
  }

  // Handle dropdown open/close
  const handleDropdownOpenChange = (open: boolean) => {
    setIsDropdownOpen(open)
  }

  // Handle submenu open/close
  const handleSubMenuOpenChange = (open: boolean) => {
    setIsSubMenuOpen(open)
  }

  // Handle chevron click explicitly
  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Handle "All Categories" click
  const handleAllCategoriesClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSubMenuOpen(true) // Всегда открывать при клике на кнопку "Все категории"
  }

  // Handle category selection
  const handleLabelSelect = (labelId: string, labelName: string) => {
    // Set negative rating when selecting a label
    setRating("negative")
    setSelectedLabelId(labelId)
    setValue(labelName)
    onThumbsDown(fragment.id, labelId)

    // Close dropdown after selection
    setIsDropdownOpen(false)
    setIsSubMenuOpen(false)
  }

  // Добавим обработчик закрытия подменю при клике вне его области
  useEffect(() => {
    const handleOutsideClick = () => {
      if (isSubMenuOpen && !isDropdownOpen) {
        setIsSubMenuOpen(false)
      }
    }

    document.addEventListener("click", handleOutsideClick)
    return () => {
      document.removeEventListener("click", handleOutsideClick)
    }
  }, [isSubMenuOpen, isDropdownOpen])

  return (
    <div
      // ref={containerRef}
      className={cn(
        "absolute top-3 right-3 flex gap-2 transition-opacity duration-200",
        isVisible || isDropdownOpen ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <div className="flex relative">
        <Button
          size="sm"
          variant="destructive"
          className={cn(
            "rounded-r-none h-8 w-8 p-0",
            rating === "negative" ? "ring-2 ring-white ring-inset" : "",
            value ? "opacity-50" : "",
          )}
          onClick={() => handleRatingToggle("negative")}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>

        <DropdownMenu open={isDropdownOpen} onOpenChange={handleDropdownOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-l-none h-8 w-8 p-0 border-l border-red-700"
              onClick={handleChevronClick}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56"
            onCloseAutoFocus={(e) => {
              // Prevent autofocus which can trigger blur events causing menu to close
              e.preventDefault()
            }}
            align="end"
          >
           
            {suggestedCategories.length > 0 && (
              <DropdownMenuGroup>
                
                {suggestedCategories.map((category) => (
                  <TooltipProvider key={category.category_id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuItem className={selectedLabelId === category.category_id ? "bg-red-100 " : ""} onClick={() => handleLabelSelect(category.category_id, category.category)}>
                          <span className={`truncate `}>{category.category}</span>
                        </DropdownMenuItem>
                      </TooltipTrigger>
                      {category.category.length > 30 && (
                        <TooltipContent side="right">
                          <p>{category.category}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
                <DropdownMenuSeparator />
              </DropdownMenuGroup>
            )}

            {/* All categories with click-only behavior */}
            <DropdownMenuSub open={isSubMenuOpen} onOpenChange={handleSubMenuOpenChange}>
              <DropdownMenuSubTrigger className="flex items-center cursor-pointer" onClick={handleAllCategoriesClick}>
                <Search className="mr-2 h-4 w-4" />
                <span>Все категории</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-2 w-64" sideOffset={-5} alignOffset={-5} collisionPadding={10}>
                <div className="flex items-center mb-2 px-2">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <input
                    placeholder="Поиск категорий..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[250px] overflow-y-auto">
                  {filteredCategories.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-muted-foreground">Ничего не найдено</div>
                  ) : (
                    filteredCategories.map((category) => (
                      <TooltipProvider key={category.category_id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuItem
                              onClick={() => handleLabelSelect(category.category_id, category.category)}
                              className={selectedLabelId === category.category_id ? "bg-red-100 " : ""}
                            >
                              <div className="truncate">
                                {category.category}
                              </div>
                            </DropdownMenuItem>
                          </TooltipTrigger>
                          {category.category.length > 30 && (
                            <TooltipContent side="right">
                              <p>{category.category}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ))
                  )}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button
        size="sm"
        className={cn(
          "bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0",
          rating === "positive"
            ? "opacity-70 outline outline-3 outline-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
            : "",
        )}
        onClick={() => handleRatingToggle("positive")}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
    </div>
  )
}

