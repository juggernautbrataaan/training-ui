// import { useState } from "react"
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuGroup,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuSub,
//     DropdownMenuSubContent,
//     DropdownMenuSubTrigger,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Button } from "@/components/ui/button"
// import {  ChevronDown, Check, Search } from "lucide-react"



// export function CategorySwitcher({ suggestedCategories }) {
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false)
//     const [isSubMenuOpen, setIsSubMenuOpen] = useState(false)


//     const handleDropdownOpenChange = () => {
//         setIsDropdownOpen(prev => !prev)
//     }
//     const handleChevronClick = (e: React.MouseEvent) => {
//         e.stopPropagation()
//         setIsDropdownOpen(!isDropdownOpen)
//     }
//     const handleAllCategoriesClick = (e: React.MouseEvent) => {
//         e.preventDefault()
//         e.stopPropagation()
//         setIsSubMenuOpen(true) // Всегда открывать при клике на кнопку "Все категории"
//     }
//     return (
//         <DropdownMenu open={isDropdownOpen} onOpenChange={handleDropdownOpenChange}>
//             <DropdownMenuTrigger asChild>
//                 <Button
//                     size="sm"
//                     variant="destructive"
//                     className="rounded-l-none h-8 w-8 p-0 border-l border-red-700"
//                     onClick={handleChevronClick}
//                 >
//                     <ChevronDown className="h-4 w-4" />
//                 </Button>
//             </DropdownMenuTrigger>

//             <DropdownMenuContent
//                 className="w-56"
//                 onCloseAutoFocus={(e) => {
//                     // Prevent autofocus which can trigger blur events causing menu to close
//                     e.preventDefault()
//                 }}
//                 align="end"
//             >
//                 <DropdownMenuLabel>Выберите категорию</DropdownMenuLabel>
//                 <DropdownMenuSeparator />

//                 {/* Suggested categories */}
//                 {suggestedCategories.length > 0 && (
//                     <DropdownMenuGroup>
//                         <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
//                             Рекомендуемые категории
//                         </DropdownMenuLabel>
//                         {suggestedCategories.map((category) => (
//                             <DropdownMenuItem
//                                 key={category.category_id}
//                                 onClick={() => handleLabelSelect(category.category_id, category.category)}
//                             >
//                                 <span className="truncate">{category.category}</span>
//                                 {selectedLabelId === category.category_id && <Check className="ml-auto h-4 w-4" />}
//                             </DropdownMenuItem>
//                         ))}
//                         <DropdownMenuSeparator />
//                     </DropdownMenuGroup>
//                 )}

//                 {/* All categories with click-only behavior */}
//                 <DropdownMenuSub open={isSubMenuOpen} onOpenChange={handleSubMenuOpenChange}>
//                     <DropdownMenuSubTrigger
//                         className="flex items-center cursor-pointer"
//                         onClick={handleAllCategoriesClick}
//                     >
//                         <Search className="mr-2 h-4 w-4" />
//                         <span>Все категории</span>
//                     </DropdownMenuSubTrigger>
//                     <DropdownMenuSubContent className="p-2 w-64" sideOffset={-5} alignOffset={-5} collisionPadding={10}>
//                         <div className="mb-2 px-2">
//                             <Input
//                                 placeholder="Поиск категорий..."
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                                 className="h-8"
//                                 onClick={(e) => e.stopPropagation()}
//                             />
//                         </div>
//                         <DropdownMenuSeparator />
//                         <div className="max-h-[250px] overflow-y-auto">
//                             {filteredCategories.length === 0 ? (
//                                 <div className="px-2 py-1 text-sm text-muted-foreground">Ничего не найдено</div>
//                             ) : (
//                                 filteredCategories.map((category) => (
//                                     <DropdownMenuItem
//                                         key={category.category_id}
//                                         onClick={() => handleLabelSelect(category.category_id, category.category)}
//                                         className="flex items-start gap-2"
//                                     >
//                                         <div className="flex-1 break-words whitespace-normal py-1">{category.category}</div>
//                                         {selectedLabelId === category.category_id && (
//                                             <Check className="ml-auto h-4 w-4 mt-1 flex-shrink-0" />
//                                         )}
//                                     </DropdownMenuItem>
//                                 ))
//                             )}
//                         </div>
//                     </DropdownMenuSubContent>
//                 </DropdownMenuSub>
//             </DropdownMenuContent>
//         </DropdownMenu>
//     )
// }