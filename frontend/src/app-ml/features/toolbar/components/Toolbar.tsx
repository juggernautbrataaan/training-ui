"use client"

import { FilterDropdown } from "./FilterDropdown"
import { Button } from "@/components/ui/button"
import { CheckCheck } from "lucide-react"
import { useFragmentStore } from "@/app-ml/features/images/stores/fragmentStore"
import { useCategoryStore } from "@/app-ml/features/labels/stores/categoryStore"
import type { FilterStatus } from "@/app-ml/types/index"

export function Toolbar() {
  const {
    getImagesForCategory,
    getCategoryState,
    markRemainingAsCorrect,
    setFilterStatus,
    
  } = useFragmentStore()
  const {
    selectedCategoryId,
    getSelectedCategory,
  } = useCategoryStore()

  const selectedCategory = getSelectedCategory()
  const categoryState = selectedCategoryId ? getCategoryState(selectedCategoryId) : undefined
  const batchImages = selectedCategoryId ? getImagesForCategory(selectedCategoryId) : []
  const remainingImages = batchImages.filter((img) => img.status === "unprocessed" || img.status === "processing")
  const remainingCount = remainingImages.length
  const processedCount = batchImages.length > 0 ? batchImages.length - remainingCount : 0

  const isCategoryAvailable = selectedCategory && selectedCategoryId && categoryState

  const title = selectedCategory ? selectedCategory.category : "Разметка"

  return (
    <div className="flex gap-3 items-center justify-between mb-8 px-8">
      <div className="flex items-center space-x-10">
        <div className="flex space-x-5 items-center">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <div className="text-lg text-muted-foreground -mb-1 min-w-48">
            Обработано:{" "}
            <span className="font-medium">
              {processedCount}{batchImages.length > 0 ? ` из ${batchImages.length}` : ""}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
          onClick={markRemainingAsCorrect}
          disabled={!isCategoryAvailable || remainingCount === 0}
        >
          <CheckCheck className="h-4 w-4" />
          <span>Пометить оставшиеся как корректные</span>
        </Button>
      </div>

      <FilterDropdown
        value={categoryState?.filterStatus}
        onChange={(value) => setFilterStatus(value as FilterStatus)}
        disabled={!isCategoryAvailable}
      />
    </div>
  )
}
