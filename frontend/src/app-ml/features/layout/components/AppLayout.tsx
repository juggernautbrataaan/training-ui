"use client"

import type React from "react"
import { SidebarLayout } from "@/app-ml/features/sidebar/components/SidebarLayout"
// import { SidebarProvider } from "@/components/ui/sidebar"

interface AppLayoutProps {
  children: React.ReactNode,
  setTab: (tab: string) => void
  tab: string
}

export function AppLayout({ children, setTab, tab }: AppLayoutProps) {

  return (
    // <SidebarProvider>
      <main className="flex h-screen overflow-hidden">
        {/* Sidebar - фиксированный, не скроллится */}
        <aside className="w-64 shrink-0 bg-gray-100 border-r border-gray-200 h-full">
          <SidebarLayout tab={tab} setTab={setTab} />
        </aside>

        {/* Контент - скроллится внутри */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </main>
    // </SidebarProvider>
  )
}

