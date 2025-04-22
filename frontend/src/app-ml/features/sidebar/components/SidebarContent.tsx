"use client"

import { useCategoryStore } from "@/app-ml/features/labels/stores/categoryStore";
import { DatasetSelector } from "@/app-ml/features/sidebar/components/DatasetSelector"
import { CategoryList } from "@/app-ml/features/sidebar/components/CategoryList"

interface SidebarContentProps {
  activeApp: string
  activeDataset: string | null
  onDatasetChange: (dataset: string) => void
  isInitialLoad: boolean
}

export function SidebarContent({ activeApp, activeDataset, onDatasetChange, isInitialLoad }: SidebarContentProps) {
  const { categories, selectCategory, selectedCategoryId } = useCategoryStore()

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-semibold ">{activeApp === "images" ? "Разметка" : "Товары"}</h2>
      </div>

      <div >
        {activeApp === "images" && (
          <>
            <DatasetSelector activeDataset={activeDataset} onDatasetChange={onDatasetChange} />
            {!activeDataset ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Выберите датасет для просмотра категорий
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <CategoryList
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={selectCategory}
                  isLoading={isInitialLoad}
                />
              </div>
            )}
          </>
        )}

        {activeApp === "products" && (
          <div className="space-y-1 mt-4">
            <div
              className="flex justify-between w-full items-start px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted"
              onClick={() => selectCategory("fruto-nyanya")}
            >
              <div className="flex items-start gap-2">
                <span className="break-words whitespace-normal">Фруто Няня</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  )
}

