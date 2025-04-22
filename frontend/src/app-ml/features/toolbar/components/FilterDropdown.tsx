import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select"
import type { FilterStatus } from "@/app-ml/types/index"

interface FilterDropdownProps {
  value: FilterStatus | undefined
  onChange: (value: FilterStatus) => void
  disabled?: boolean
}

export function FilterDropdown({ value, onChange, disabled = false }: FilterDropdownProps) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <span className="text-sm text-muted-foreground">Фильтр:</span>
      <Select value={value} onValueChange={(val) => onChange(val as FilterStatus)} disabled={disabled}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Выберите фильтр" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="unprocessed">Не обработаны</SelectItem>
            <SelectItem value="processing">В обработке</SelectItem>
            <SelectItem value="processed">Обработаны</SelectItem>
            <SelectItem value="correct">Корректно размеченные</SelectItem>
            <SelectItem value="incorrect">Некорректно размеченные</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

