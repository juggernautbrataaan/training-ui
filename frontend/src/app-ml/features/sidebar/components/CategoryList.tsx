"use client"

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CategoryItem } from "@/app-ml/features/sidebar/components/CategoryItem"
import type { CategoryData } from "@/app-ml/types"

interface CategoryListProps {
  categories: CategoryData[]
  selectedCategoryId: number | string | null
  onSelectCategory: (id: number | string) => void
  isLoading: boolean
}

export function CategoryList({ categories, selectedCategoryId, onSelectCategory, isLoading }: CategoryListProps) {

  return (
    <Collapsible open={true} className="space-y-2 ">
      <CollapsibleContent className="space-y-1 ">
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="px-3">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Загрузка категорий...</div>
            ) : categories.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Нет доступных категорий</div>
            ) : (
              categories.map((category) => (
                <CategoryItem
                  key={category.category_id}
                  category={category}
                  selectedCategoryId={selectedCategoryId}
                  onSelect={onSelectCategory}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  )
}

