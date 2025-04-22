import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { useFragmentStore } from "@/app-ml/features/images/stores/fragmentStore"
import { cn } from "@/lib/utils"
import type { CategoryData } from "@/app-ml/types"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  
  TooltipTrigger,
} from "@/components/ui/tooltip"
export function CategoryItem({
  category,
  selectedCategoryId,
  onSelect,
  level = 0,
}: {
  category: CategoryData
  selectedCategoryId: number | string | null
  onSelect: (id: number | string) => void
  level?: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { getImagesForCategory } = useFragmentStore()

  const hasChildren = category.child_categories && category.child_categories.length > 0
  const isSelected = selectedCategoryId?.toString() === category.category_id.toString()

  const batchImages = getImagesForCategory(category.category_id)
  const remainingImages = batchImages.filter((img) => img.status === "unprocessed" || img.status === "processing")
  const remainingCount = remainingImages.length

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex justify-between w-full items-start px-3 py-2 text-sm rounded-md cursor-pointer",
          isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted",
          level > 0 && "pl-6",
        )}
        onClick={() => {
          onSelect(category.category_id)
        }}
      >
        <div className="flex items-start gap-2">
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 mt-0.5"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
          <span className="break-words whitespace-normal">{category.category}</span>
        </div>
        {/* <Badge variant="outline" className="ml-2 shrink-0 mt-0.5">
            {category.unprocessed_image_count || remainingCount}
          </Badge> */}
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="ml-auto font-medium">{category.unprocessed_image_count || remainingCount}</p>
          </TooltipTrigger>
          <TooltipContent>
            <span className="ml-auto font-medium">Кол-во необработанных изображений</span>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Render child categories if expanded */}
      {isExpanded && hasChildren && (
        <div className="ml-2 border-l pl-2">
          {category.child_categories.map((child) => (
            <CategoryItem
              key={child.category_id}
              category={child}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}