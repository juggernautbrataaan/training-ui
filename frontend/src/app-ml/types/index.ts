// API Response Types
export interface CategoryApiResponse {
  status: string
  message: string
  response: CategoryData[]
}

export interface CategoryData {
  category: string
  category_id: number | string
  unprocessed_image_count: number
  child_categories: CategoryData[]
}

export interface ImageApiResponse {
  status: string
  message: string
  response: ImageData[]
}

export interface ImageData {
  image_id: string
  image_url: string
  category_tips: CategoryTip[]
}

export interface CategoryTip {
  category: string
  category_id: string
}

// Application Types
export interface ProcessedImage {
  id: string
  imageUrl: string
  status: ImageStatus
  categoryId: string | number
  labelId?: string
  categoryTips?: CategoryTip[]
  lastModified?: number // Timestamp of last modification
}

export interface BatchInfo {
  id: string // Unique identifier for the batch
  categoryId: number | string
  page: number
  startIndex: number
  endIndex: number
  isLocked: boolean // Whether the batch is locked for processing
  startedAt: number // Timestamp when batch processing started
  lastModified: number // Timestamp of last modification
  completedCount: number // Number of completed images in the batch
  totalCount: number // Total number of images in the batch
}

// New type for per-category state
export interface CategoryState {
  images: ProcessedImage[]
  filterStatus: FilterStatus
  lastAccessed: number // Timestamp when this category was last accessed
  currentPage: number // Current page of images
  totalPages: number // Total number of pages
  hasMoreImages: boolean // Whether there are 
}

export type ImageStatus = "unprocessed" | "processing" | "processed" | "correct" | "incorrect"
export type FilterStatus = "unprocessed" | "processing" | "processed" | "correct" | "incorrect"

export interface Label {
  category_id: string
  category: string
}

// Pagination parameters
export interface PaginationParams {
  skip?: number
  stop?: number
}

