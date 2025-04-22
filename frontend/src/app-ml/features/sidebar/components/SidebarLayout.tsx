"use client"
import { useEffect, useState } from "react";
import { useCategoryStore } from "@/app-ml/features/labels/stores/categoryStore";

import { SidebarHeader } from "./SidebarHeader";
import { SidebarContent } from "./SidebarContent";


interface SidebarProps {
  setTab: (tab: string) => void;
  tab: string;
}

export function SidebarLayout({ setTab, tab }: SidebarProps) {
  const {  fetchCategories } =
    useCategoryStore()
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
    setActiveDataset(dataset)
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
