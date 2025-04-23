"use client"

import { create } from "zustand"
// import { persist } from "zustand/middleware"
import type { CategoryData, Label } from "@/app-ml/types"

const API_URL = import.meta.env.VITE_TRAINING_PIPELINE_ENDPOINT



// Helper function to flatten categories for the label store
const flattenCategories = (categories: CategoryData[]): Label[] => {
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

interface CategoryState {
  // Data
  categories: CategoryData[]
  labels: Label[]
  selectedCategoryId: number | string | null
  currentDataset: string | null

  // UI State
  isLoading: boolean
  useMockData: boolean

  // Actions
  fetchCategories: (dataset?: string) => Promise<void>
  selectCategory: (categoryId: number | string) => void
  setCurrentDataset: (dataset: string) => void
  deselectCategory: () => void

  // Getters
  getSelectedCategory: () => CategoryData | null
  getAllLabels: () => Label[]
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  // Initial state
  categories: [],
  labels: [],
  selectedCategoryId: null,
  currentDataset: null,
  isLoading: false,
  useMockData: true, // Default to using mock data

  // Set current dataset
  setCurrentDataset: (dataset: string) => {
    const currentDataset = get().currentDataset
    if (currentDataset !== dataset) {
      set({
        currentDataset: dataset,
        selectedCategoryId: null,
      })
    } else {
      set({ currentDataset: dataset })
    }  },

  

  // API calls
  fetchCategories: async (dataset?: string) => {
    set({ isLoading: true })

    try {
      // Use the provided dataset or the current one from state
      const activeDataset = dataset || get().currentDataset

      // If no dataset is selected, return early
      if (!activeDataset) {
        set({
          categories: [],
          labels: [],
          isLoading: false,
          selectedCategoryId: null,
        })
        return
      }

      let data

      // Use real API with the selected dataset
      const response = await fetch(`${API_URL}/api/datasets/${activeDataset}/categories`)
      data = await response.json()

      // Check if categories are empty and set selectedCategoryId to null if they are
      if (!data.response || data.response.length === 0) {
        set({
          categories: [],
          labels: [],
          isLoading: false,
          selectedCategoryId: null,
        })
        return
      }

      // Create labels from categories for the dropdown (flattened)
      const labels = flattenCategories(data.response)

      set({
        categories: data.response,
        labels,
        isLoading: false,
        currentDataset: activeDataset,
        // selectedCategoryId: null, // Reset selected category when categories change
      })
    } catch (error) {
      console.error("Error fetching categories:", error)
      set({
        isLoading: false,
        selectedCategoryId: null,
      })
    }
  },
  deselectCategory: () => {
    set({ selectedCategoryId: null })
  },

  selectCategory: (categoryId: number | string) => {
    const { categories } = get()

    // Helper function to find category in nested structure
    const findCategory = (cats: CategoryData[]): CategoryData | null => {
      for (const cat of cats) {
        if (cat.category_id.toString() === categoryId.toString()) {
          return cat
        }
        if (cat.child_categories && cat.child_categories.length > 0) {
          const found = findCategory(cat.child_categories)
          if (found) return found
        }
      }
      return null
    }

    const selectedCategory = findCategory(categories)
    if (!selectedCategory) return

    // Update selected category
    set({
      selectedCategoryId: categoryId,
    })
  },

  // Getters
  getSelectedCategory: () => {
    const { categories, selectedCategoryId } = get()

    if (!selectedCategoryId) return null

    // Helper function to find category in nested structure
    const findCategory = (cats: CategoryData[]): CategoryData | null => {
      for (const cat of cats) {
        if (cat.category_id.toString() === selectedCategoryId.toString()) {
          return cat
        }
        if (cat.child_categories && cat.child_categories.length > 0) {
          const found = findCategory(cat.child_categories)
          if (found) return found
        }
      }
      return null
    }

    return findCategory(categories)
  },

  // Get all labels including child categories
  getAllLabels: () => {
    return get().labels
  },
}))
