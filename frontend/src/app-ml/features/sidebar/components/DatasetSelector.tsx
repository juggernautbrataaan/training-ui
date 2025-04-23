"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown,  Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
const API_URL = import.meta.env.VITE_TRAINING_PIPELINE_ENDPOINT

interface Dataset {
  alias: string,
  group_alias: string, 
  type: string,
  status: string,
  creation_date: string,
  last_changes_date: string,
}

interface DatasetSelectorProps {
  activeDataset: string | null
  onDatasetChange: (dataset: string) => void
}

export function DatasetSelector({ activeDataset, onDatasetChange }: DatasetSelectorProps) {
  const [open, setOpen] = useState(false)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch datasets on component mount
  useEffect(() => {
    const fetchDatasets = async () => {
      setIsLoading(true)
      try {
        // In the future, replace this with an actual API call
        const response = await fetch(`${API_URL}/api/datasets?status_filter=correcting`)
        const data = await response.json()
        setDatasets(data.response)
      } catch (error) {
        console.error("Error fetching datasets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDatasets()
  }, [])

  const handleDatasetChange = (datasetId: string) => {
    onDatasetChange(datasetId)
    setOpen(false)
  }

  const activeDatasetName = activeDataset
    ? datasets.find((dataset) => dataset.group_alias === activeDataset)?.group_alias || "Выберите датасет"
    : "Выберите датасет"

  return (
    <div className="p-4">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Загрузка датасетов...</span>
                </>
              ) : (
                <>
                  {/* <Database className="mr-2 h-4 w-4" /> */}
                  <span>{activeDatasetName}</span>
                </>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px]">
          <DropdownMenuGroup>
            {isLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Загрузка...</span>
              </div>
            ) : datasets.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">Нет доступных датасетов</div>
            ) : (
              datasets.map((dataset) => (
                <DropdownMenuItem
                  key={dataset.group_alias}
                  className="flex items-center justify-between"
                  onSelect={() => handleDatasetChange(dataset.group_alias)}
                >
                  {dataset.group_alias}
                  {activeDataset === dataset.group_alias && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
