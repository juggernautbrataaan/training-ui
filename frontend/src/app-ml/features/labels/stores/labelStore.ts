"use client"

import { create } from "zustand"
import { useEffect } from "react"
import { useCategoryStore } from "@/app-ml/features/labels/stores/categoryStore"
import type { Label } from "@/app-ml/types"

interface LabelStore {
  categories: Label[]
}

export const useLabelStore = create<LabelStore>(() => ({
  categories: [],
}))

// Helper function to flatten categories for the label store
const flattenCategories = (categories: any[]): Label[] => {
  let result: Label[] = []

  for (const category of categories) {
    result.push({
      category_id: category.category_id.toString(),
      category: category.category,
    })

    if (category.child_categories && category.child_categories.length > 0) {
      result = [...result, ...flattenCategories(category.child_categories)]
    }
  }

  return result
}

// Update the label store whenever the category store changes
export function useSyncLabelStore() {
  const categories = useCategoryStore((state) => state.categories)

  useEffect(() => {
    if (categories && categories.length > 0) {
      const flattenedLabels = flattenCategories(categories)
      useLabelStore.setState({ categories: flattenedLabels })
    }
  }, [categories])
}

