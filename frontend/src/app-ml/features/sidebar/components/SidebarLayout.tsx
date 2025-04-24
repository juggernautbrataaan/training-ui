"use client"
import { useEffect, useState } from "react";
import { useCategoryStore } from "@/app-ml/features/labels/stores/categoryStore";
import { useFragmentStore } from "@/app-ml/features/images/stores/fragmentStore"
import { SidebarHeader } from "./SidebarHeader";
import { SidebarContent } from "./SidebarContent";


interface SidebarProps {
  setTab: (tab: string) => void;
  tab: string;
}

export function SidebarLayout({ setTab, tab }: SidebarProps) {
  const { fetchCategories, setCurrentDataset, deselectCategory } = useCategoryStore()
  const { clearAllFragments } = useFragmentStore()
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [activeDataset, setActiveDataset] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories().finally(() => {
      setIsInitialLoad(false)
    })
  }, [fetchCategories])

  const handleAppSwitch = (app: string) => {
    setTab(app)
  }
  const handleDatasetChange = (dataset: string) => {
    console.log("Changing dataset to:", dataset)

    // First, clear the selected category and fragments
    deselectCategory()
    clearAllFragments()

    // Then update the dataset
    setActiveDataset(dataset)
    setCurrentDataset(dataset)

    // Finally, fetch new categories for the selected dataset
    fetchCategories(dataset)
  }

  return (
    <div className="w-64 h-screen border-r bg-background flex flex-col">
      <SidebarHeader activeApp={tab} onAppChange={handleAppSwitch} />
      <SidebarContent
        activeApp={tab}
        activeDataset={activeDataset}
        onDatasetChange={handleDatasetChange}
        isInitialLoad={isInitialLoad}
      />
    </div>
  );
}
