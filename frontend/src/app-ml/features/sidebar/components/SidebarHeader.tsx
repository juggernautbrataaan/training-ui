"use client"

import { ProjectSelector } from "./ProjectSelector";

interface SidebarHeaderProps {
  activeApp: string
  onAppChange: (app: string) => void
}

export function SidebarHeader({ activeApp, onAppChange }: SidebarHeaderProps) {
  return (
    <div className="h-14 border-b flex items-center px-4">
      <ProjectSelector activeApp={activeApp} onAppChange={onAppChange} />
    </div>
  )
}

