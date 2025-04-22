"use client"
import {  useEffect } from "react"
import { ImageItem } from "@/app-ml/features/images/components/ImageItem"
import { useCategoryStore } from "@/app-ml/features/labels/stores/categoryStore"
import { useFragmentStore } from "@/app-ml/features/images/stores/fragmentStore"
import { EmptyState } from "./EmptyState"
import { LoadingState } from "./LoadingState"

export function ImageGrid() {
  const { selectedCategoryId, getSelectedCategory } = useCategoryStore()

  const {
    getCategoryState,
    getFilteredImagesForCategory,
    markAsCorrect,
    markAsIncorrect,
    isLoading,
    fetchImages,
    checkAndRefreshCategory,
  } = useFragmentStore()

  // Fetch images when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const categoryState = getCategoryState(selectedCategoryId)
      if (!categoryState || categoryState.images.length === 0) {
        fetchImages(selectedCategoryId)
      } else {
        // Check if all images are processed and fetch new ones if needed
        checkAndRefreshCategory(selectedCategoryId)
      }
    }
  }, [selectedCategoryId, getCategoryState, fetchImages, checkAndRefreshCategory])

  const selectedCategory = getSelectedCategory()
  if (!selectedCategory || !selectedCategoryId) {
    return <EmptyState message="Выберите категорию из боковой панели" />
  }

  const categoryState = getCategoryState(selectedCategoryId)
  if (!categoryState) {
    return <LoadingState />
  }

  // Get filtered images for the selected category
  const filteredImages = getFilteredImagesForCategory(selectedCategoryId)

  if (isLoading && filteredImages.length === 0) {
    return <LoadingState />
  }

  if (filteredImages.length === 0) {
    
    return <EmptyState message="Список пуст" />
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-[5px] p-6 w-full">
        {filteredImages.map((image) => (
          <ImageItem
            key={image.id}
            fragment={{
              id: image.id,
              imageUrl: image.imageUrl,
              status: image.status,
              categoryTips: image.categoryTips,
            }}
            onThumbsUp={(imageId) => markAsCorrect(imageId)}
            onThumbsDown={(imageId, labelId) => markAsIncorrect(imageId, labelId)}
          />
        ))}
      </div>
    </div>
  )
}
