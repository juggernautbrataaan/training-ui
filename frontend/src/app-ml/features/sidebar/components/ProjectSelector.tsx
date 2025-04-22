"use client"
import { Check, ChevronsUpDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ProjectSelectorProps {
  activeApp: string
  onAppChange: (app: string) => void
}

export function ProjectSelector({ activeApp, onAppChange }: ProjectSelectorProps) {
  const projects = [
    { id: "images", name: "Разметка" },
    { id: "products", name: "Товары" },
  ]

  const activeProjectName = projects.find((project) => project.id === activeApp)?.name || "Разметка"

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-between px-2 h-auto py-1">
            <div className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-primary-foreground">
                {/* <FolderOpen className="size-4" /> */}
                <img src="/logo_gramax.svg" alt="Прямое подключение" /> 
                
              </div>
              <div className="flex flex-col gap-0.5 leading-none text-left">
                <span className="font-semibold">Quiz IR</span>
                <span className="text-xs text-muted-foreground">{activeProjectName}</span>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
          {projects.map((project) => (
            <DropdownMenuItem key={project.id} onSelect={() => onAppChange(project.id)}>

              {project.name} {project.id === activeApp && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

