"use client";

import axios from "axios";
import { create } from "zustand";
// import { persist } from "zustand/middleware";
import type {
  ProcessedImage,
  FilterStatus,
  PaginationParams,
} from "@/app-ml/types";
import { useCategoryStore } from "@/app-ml/features/labels/stores/categoryStore";

// Constants for pagination
const API_URL = import.meta.env.VITE_TRAINING_PIPELINE_ENDPOINT ;
const LOCK_SEC = import.meta.env.VITE_IMAGES_LOCK_SEC ;
const IMAGES_PER_PAGE = import.meta.env.VITE_IMAGES_PER_PAGE
// Helper function to generate mock images for a category

// Update the interface to include lock-related fields
interface CategoryState {
  images: ProcessedImage[];
  filterStatus: FilterStatus;
  lastAccessed: number;
  currentPage: number;
  totalPages: number;
  hasMoreImages: boolean;
  lockOverrideKey?: string;
  lockExpiresAt?: number;
  originalImageOrder?: Record<string, number>; // Store original positions of images
}

interface FragmentState {
  // Per-category state
  categoryStates: Record<string, CategoryState>;

  // UI State
  isLoading: boolean;

  // Actions
  fetchImages: (
    categoryId: number | string,
    params?: PaginationParams
  ) => Promise<void>;
  markAsCorrect: (imageId: string) => void;
  markAsIncorrect: (imageId: string, labelId?: string) => void;
  markRemainingAsCorrect: () => void;
  setFilterStatus: (status: FilterStatus) => void;
  clearProcessedImages: (categoryId: number | string) => void;
  checkAndRefreshCategory: (categoryId: number | string) => Promise<void>;
  prepareUpdatesBatch: (categoryId: number | string) => {
    updates: { image_id: string; category_id: string }[];
    lock_override_key?: string;
  };
  checkLockExpiration: (categoryId: string) => void;
  clearAllFragments: () => void // New method to clear all fragments
  // Getters
  getCategoryState: (categoryId: number | string) => CategoryState | null;
  getImagesForCategory: (categoryId: number | string) => ProcessedImage[];
  getFilteredImagesForCategory: (
    categoryId: number | string
  ) => ProcessedImage[];
  areAllImagesProcessed: (categoryId: number | string) => boolean;
}

// Helper function to create a default category state
const createDefaultCategoryState = (): CategoryState => ({
  images: [],
  filterStatus: "processing", // Default filter set to "В обработке"
  lastAccessed: Date.now(),
  currentPage: 0,
  totalPages: 0,
  hasMoreImages: true,
  originalImageOrder: {},
});

export const useFragmentStore = create<FragmentState>((set, get) => ({
  // Initial state
  categoryStates: {},
  isLoading: false,

  // API calls
  fetchImages: async (
    categoryId: number | string,
  ) => {
    set({ isLoading: true });

    try {
      // Проверяем, есть ли у категории необработанные изображения
      const selectedCategory = useCategoryStore
        .getState()
        .getSelectedCategory();
      if (!selectedCategory || selectedCategory.unprocessed_image_count <= 0) {
        useCategoryStore.getState().deselectCategory();
        set({ isLoading: false });
        return;
      }

      // Получаем или создаем состояние категории
      const categoryState =
        get().getCategoryState(categoryId) || createDefaultCategoryState();

      // Вычисляем параметры пагинации
     

      let processedImages: ProcessedImage[] = [];
      let hasMoreImages = true;
      let lockOverrideKey: string | undefined = undefined;
      let lockExpiresAt: number | undefined = undefined;

      // Получаем активный датасет из хранилища категорий
      const activeDataset = useCategoryStore.getState().currentDataset;

      // Выполняем запрос к API
      const response = await fetch(
        `${API_URL}/api/datasets/${activeDataset}/images/${categoryId}?lock_sec=${LOCK_SEC}&skip=${0}&stop=${IMAGES_PER_PAGE}`
      );
      const data = await response.json();
      if (!data.response.images || data.response.images.length === 0) {
        // Deselect the category if it has no images
        useCategoryStore.getState().deselectCategory();
        set({ isLoading: false });
        return;
      }

      let originalImageOrder = { ...categoryState.originalImageOrder };

      // If this is a new batch (not a relock), create a new order mapping
      const isNewBatch =
      
        Object.keys(originalImageOrder).length === 0;

      if (isNewBatch) {
        // Create a new order mapping for this batch
        originalImageOrder = {};
        data.response.images.forEach(
          (image: { image_id: string }, index: number) => {
            originalImageOrder[image.image_id] = index;
          }
        );
      }

      // Преобразуем ответ API в наш внутренний формат
      processedImages = data.response.images.map(
        (image: { image_id: any; image_url: any; category_tips: any }) => {
          // Проверяем, есть ли это изображение уже в нашем состоянии и обработано ли оно
          const existingImage = categoryState.images.find(
            (img) => img.id === image.image_id
          );
          if (
            existingImage &&
            (existingImage.status === "correct" ||
              existingImage.status === "incorrect")
          ) {
            // Сохраняем статус обработки
            return {
              ...existingImage,
              imageUrl: image.image_url, // Обновляем URL на случай, если он изменился
              categoryTips: image.category_tips, // Обновляем подсказки категорий
            };
          }

          // Иначе создаем новое необработанное изображение
          return {
            id: image.image_id,
            imageUrl: image.image_url,
            status: "unprocessed",
            categoryId: categoryId,
            categoryTips: image.category_tips,
            lastModified: Date.now(),
          };
        }
      );

      // Проверяем, есть ли у нас еще изображения
      hasMoreImages = data.response.images.length === IMAGES_PER_PAGE;

      // Сохраняем информацию о блокировке
      if (data.response.lock && data.response.lock_override_key) {
        lockOverrideKey = data.response.lock_override_key;
        lockExpiresAt = Date.now() + LOCK_SEC * 1000; 
      }

      // Вычисляем общее количество страниц на основе unprocessed_image_count выбранной категории
      const totalImages = selectedCategory?.unprocessed_image_count || 0;
      const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);

      if (!isNewBatch) {
        // Sort the processed images according to their original order
        processedImages.sort((a, b) => {
          const orderA = originalImageOrder[a.id] ?? Number.MAX_SAFE_INTEGER
          const orderB = originalImageOrder[b.id] ?? Number.MAX_SAFE_INTEGER
          return orderA - orderB
        })
      }
      // Обновляем состояние категории
      const updatedCategoryState: CategoryState = {
        ...categoryState,
        images: processedImages,
        totalPages,
        hasMoreImages,
        lockOverrideKey,
        lockExpiresAt,
      
        originalImageOrder,
      };

      // Обновляем хранилище
      set((state) => ({
        categoryStates: {
          ...state.categoryStates,
          [categoryId.toString()]: updatedCategoryState,
        },
        isLoading: false,
      }));

      // Устанавливаем таймер для проверки истечения срока блокировки
      if (lockExpiresAt) {
        const timeUntilExpiration = lockExpiresAt - Date.now();
        setTimeout(() => {
          get().checkLockExpiration(categoryId.toString());
        }, timeUntilExpiration);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      useCategoryStore.getState().deselectCategory();
      set({ isLoading: false });
    }
  },
  // Add a new method to clear all fragments
  clearAllFragments: () => {
    console.log("Clearing all fragments")
    set({ categoryStates: {}, isLoading: false })
  },

  markAsCorrect: async (imageId: string) => {
    const selectedCategoryId = useCategoryStore.getState().selectedCategoryId;
    if (!selectedCategoryId) return;

    const categoryState = get().getCategoryState(selectedCategoryId);
    if (!categoryState) return;

    const now = Date.now();

    // Find the image to check if it's already processed
    const image = categoryState.images.find((img) => img.id === imageId);
    if (!image || image.status === "correct") return;

    // Only increment completedCount if the image wasn't already processed
    const incrementCount =
      image.status === "unprocessed" || image.status === "processing";

    // Update the image status without removing it from the list
    const updatedImages = categoryState.images.map((image) =>
      image.id === imageId
        ? {
            ...image,
            status: "correct" as const,
            categoryId: selectedCategoryId, // Assign the current category ID
            labelId: undefined, // Clear any label ID when marking as correct
            lastModified: now,
          }
        : image
    );

    // Update the store
    set((state) => ({
      categoryStates: {
        ...state.categoryStates,
        [selectedCategoryId.toString()]: {
          ...state.categoryStates[selectedCategoryId.toString()],
          images: updatedImages,
          lastAccessed: now,
        },
      },
    }));

    // Update the category unprocessed count in the category store
    const categories = useCategoryStore.getState().categories;

    // Helper function to update category count in nested structure
    const updateCategoryCount = (cats: any[]): any[] => {
      return cats.map((cat) => {
        if (cat.category_id.toString() === selectedCategoryId.toString()) {
          return {
            ...cat,
            unprocessed_image_count: Math.max(
              0,
              cat.unprocessed_image_count - (incrementCount ? 1 : 0)
            ),
          };
        }
        if (cat.child_categories && cat.child_categories.length > 0) {
          return {
            ...cat,
            child_categories: updateCategoryCount(cat.child_categories),
          };
        }
        return cat;
      });
    };

    const updatedCategories = updateCategoryCount(categories);
    useCategoryStore.setState({ categories: updatedCategories });

    // Check if all images are processed and fetch new ones if needed
    setTimeout(() => {
      get().checkAndRefreshCategory(selectedCategoryId);
    }, 100);
  },

  markAsIncorrect: async (imageId: string, labelId?: string) => {
    const selectedCategoryId = useCategoryStore.getState().selectedCategoryId;
    if (!selectedCategoryId) return;

    const categoryState = get().getCategoryState(selectedCategoryId);
    if (!categoryState) return;

    const now = Date.now();

    // Find the image to check if it's already processed
    const image = categoryState.images.find((img) => img.id === imageId);
    if (!image) return;

    // Only increment completedCount if the image wasn't already processed
    const incrementCount =
      image.status === "unprocessed" || image.status === "processing";

    // Update the image status without removing it from the list
    const updatedImages = categoryState.images.map((image) =>
      image.id === imageId
        ? {
            ...image,
            status: "incorrect" as const,
            categoryId: selectedCategoryId, // Keep the original category ID
            labelId: labelId || "", // Store the selected label ID or empty string
            lastModified: now,
          }
        : image
    );

    // Update the store
    set((state) => ({
      categoryStates: {
        ...state.categoryStates,
        [selectedCategoryId.toString()]: {
          ...state.categoryStates[selectedCategoryId.toString()],
          images: updatedImages,
          lastAccessed: now,
        },
      },
    }));

    // Update the category unprocessed count in the category store
    const categories = useCategoryStore.getState().categories;

    // Helper function to update category count in nested structure
    const updateCategoryCount = (cats: any[]): any[] => {
      return cats.map((cat) => {
        if (cat.category_id.toString() === selectedCategoryId.toString()) {
          return {
            ...cat,
            unprocessed_image_count: Math.max(
              0,
              cat.unprocessed_image_count - (incrementCount ? 1 : 0)
            ),
          };
        }
        if (cat.child_categories && cat.child_categories.length > 0) {
          return {
            ...cat,
            child_categories: updateCategoryCount(cat.child_categories),
          };
        }
        return cat;
      });
    };

    const updatedCategories = updateCategoryCount(categories);
    useCategoryStore.setState({ categories: updatedCategories });

    // Check if all images are processed and fetch new ones if needed
    setTimeout(() => {
      get().checkAndRefreshCategory(selectedCategoryId);
    }, 100);
  },

  markRemainingAsCorrect: async () => {
    const selectedCategoryId = useCategoryStore.getState().selectedCategoryId;
    if (!selectedCategoryId) return;

    const categoryState = get().getCategoryState(selectedCategoryId);
    if (!categoryState) return;

    const now = Date.now();

    const Images = get().getImagesForCategory(selectedCategoryId);
    const unprocessedImages = Images.filter(
      (img) => img.status === "unprocessed" || img.status === "processing"
    );
    const unprocessedCount = unprocessedImages.length;

    if (unprocessedCount === 0) return; // Nothing to mark

    // Update all unprocessed images to correct
    const updatedImages = categoryState.images.map((image) => {
      if (image.status === "unprocessed" || image.status === "processing") {
        return {
          ...image,
          status: "correct" as const,
          categoryId: selectedCategoryId, // Assign the current category ID
          labelId: undefined, // Clear any label ID when marking as correct
          lastModified: now,
        };
      }
      return image;
    });

    // Update the store
    set((state) => ({
      categoryStates: {
        ...state.categoryStates,
        [selectedCategoryId.toString()]: {
          ...state.categoryStates[selectedCategoryId.toString()],
          images: updatedImages,
          lastAccessed: now,
        },
      },
    }));

    // Update the category unprocessed count in the category store
    const categories = useCategoryStore.getState().categories;

    // Helper function to update category count in nested structure
    const updateCategoryCount = (cats: any[]): any[] => {
      return cats.map((cat) => {
        if (cat.category_id.toString() === selectedCategoryId.toString()) {
          return {
            ...cat,
            unprocessed_image_count: Math.max(
              0,
              cat.unprocessed_image_count - unprocessedCount
            ),
          };
        }
        if (cat.child_categories && cat.child_categories.length > 0) {
          return {
            ...cat,
            child_categories: updateCategoryCount(cat.child_categories),
          };
        }
        return cat;
      });
    };

    const updatedCategories = updateCategoryCount(categories);
    useCategoryStore.setState({ categories: updatedCategories });

    // Check if all images are processed and fetch new ones if needed
    setTimeout(() => {
      get().checkAndRefreshCategory(selectedCategoryId);
    }, 100);
  },

  setFilterStatus: async (status: FilterStatus) => {
    const selectedCategoryId = useCategoryStore.getState().selectedCategoryId;
    if (!selectedCategoryId) return;

    // Update filter status for the selected category
    set((state) => ({
      categoryStates: {
        ...state.categoryStates,
        [selectedCategoryId.toString()]: {
          ...state.categoryStates[selectedCategoryId.toString()],
          filterStatus: status,
          lastAccessed: Date.now(),
        },
      },
    }));
  },

  // Function to clear processed images for a category
  clearProcessedImages: (categoryId: number | string) => {
    const categoryState = get().getCategoryState(categoryId);
    if (!categoryState) return;

    // Keep only unprocessed images
    const unprocessedImages = categoryState.images.filter(
      (img) => img.status === "unprocessed" || img.status === "processing"
    );

    // Update the store
    set((state) => ({
      categoryStates: {
        ...state.categoryStates,
        [categoryId.toString()]: {
          ...state.categoryStates[categoryId.toString()],
          images: unprocessedImages,
          lastAccessed: Date.now(),
          lockOverrideKey: undefined,
          lockExpiresAt: undefined,
          batchId: undefined,
          isRelockedBatch: false,
        },
      },
    }));
  },

  // Function to check if all images are processed and refresh if needed
  checkAndRefreshCategory: async (categoryId: number | string) => {
    const allProcessed = get().areAllImagesProcessed(categoryId);
    if (!allProcessed) return;

    const updatesBatch = get().prepareUpdatesBatch(categoryId);
    console.log("Batch prepared for submission:", JSON.stringify(updatesBatch));

    const { lock_override_key, updates } = updatesBatch;
    const activeDataset = useCategoryStore.getState().currentDataset;

    // const bodyObject = { updates };
    // const bodyJson = JSON.stringify(bodyObject);
    const url =
      `${API_URL}/api/datasets/${activeDataset}/images` +
      (lock_override_key ? `?lock_override_key=${lock_override_key}` : "");

    // // Генерация CURL-запроса
    // const curlCommand = [
    //   `curl -X 'POST' \\`,
    //   `'${url}' \\`,
    //   `-H 'accept: application/json' \\`,
    //   `-H 'Content-Type: application/json' \\`,
    //   `-d '${bodyJson.replace(/'/g, "\\'")}'`,
    // ].join("\n");

    // console.log("Generated CURL command:\n", curlCommand);

    // ===== ОТПРАВКА ЗАПРОСА (ПОКА ЗАКОММЕНТИРОВАНА) =====

    const SEND_REQUEST = true;
    if (SEND_REQUEST) {
      try {
        const response = await axios.post(
          url,
          { updates },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        console.log("Batch submission response:", response.data);
      } catch (error) {
        console.error("Error submitting batch:", error);
      }
    }

    // ===== ОБНОВЛЕНИЕ КАТЕГОРИЙ/ИЗОБРАЖЕНИЙ =====
    await useCategoryStore.getState().fetchCategories();

    const selectedCategory = useCategoryStore.getState().getSelectedCategory();

    get().clearProcessedImages(categoryId);

    if (selectedCategory && selectedCategory.unprocessed_image_count > 0) {
      // await get().fetchImages(categoryId, { skip: 0, stop: IMAGES_PER_PAGE });
      await get().fetchImages(categoryId);

    }
  },

  // Function to prepare updates batch for API submission
  prepareUpdatesBatch: (categoryId: number | string) => {
    const categoryState = get().getCategoryState(categoryId.toString());
    const images = get().getImagesForCategory(categoryId);
    const processedImages = images.filter(
      (img) => img.status === "correct" || img.status === "incorrect"
    );

    const updates = processedImages.map((img) => {
      // For correct images, use the current category ID
      if (img.status === "correct") {
        return {
          image_id: img.id,
          category_id: categoryId.toString(),
        };
      }
      // For incorrect images with a selected category (from dropdown)
      else if (img.status === "incorrect" && img.labelId) {
        return {
          image_id: img.id,
          category_id: img.labelId.toString(),
        };
      }
      // For incorrect images without a selected category (thumbs down only)
      else {
        return {
          image_id: img.id,
          category_id: "",
        };
      }
    });

    return {
      updates,
      lock_override_key: categoryState?.lockOverrideKey,
    };
  },

  // Function to check if all images in a category are processed
  areAllImagesProcessed: (categoryId: number | string) => {
    const images = get().getImagesForCategory(categoryId);
    if (images.length === 0) return false;

    return images.every(
      (img) => img.status === "correct" || img.status === "incorrect"
    );
  },

  // Add a new function to check if the lock has expired
  checkLockExpiration: (categoryId: string) => {
    const categoryState = get().getCategoryState(categoryId);
    if (!categoryState) return;

    const now = Date.now();

    // Если срок блокировки истек
    if (categoryState.lockExpiresAt && now >= categoryState.lockExpiresAt) {
      console.log(`Lock expired for category ${categoryId}, relocking batch`);


      // Повторно блокируем ту же порцию
      const selectedCategoryId = useCategoryStore.getState().selectedCategoryId;
      if (selectedCategoryId && selectedCategoryId.toString() === categoryId) {
        // Только если это текущая выбранная категория
        // get().fetchImages(categoryId, { skip, stop });
        get().fetchImages(categoryId);

      }
    }
  },

  // Getters
  getCategoryState: (categoryId: number | string) => {
    return get().categoryStates[categoryId.toString()] || null;
  },

  getImagesForCategory: (categoryId: number | string) => {
    const categoryState = get().getCategoryState(categoryId);
    if (!categoryState) return [];

    return categoryState.images.filter(
      (img) => img.categoryId.toString() === categoryId.toString()
    );
  },

  getFilteredImagesForCategory: (categoryId: number | string) => {
    const categoryState = get().getCategoryState(categoryId);
    if (!categoryState) return [];

    const { filterStatus } = categoryState;
    const images = categoryState.images;

    // Filter images based on the selected filter
    if (filterStatus === "unprocessed") {
      // Only show truly unprocessed images - those that have not been marked as anything else
      return images.filter((img) => img.status === "unprocessed");
    } else if (filterStatus === "processing") {
      // Show all images that are being worked on (unprocessed or already marked)
      return images.filter(
        (img) =>
          img.status === "unprocessed" ||
          img.status === "processing" ||
          img.status === "correct" ||
          img.status === "incorrect"
      );
    } else if (filterStatus === "processed") {
      return images.filter(
        (img) => img.status === "correct" || img.status === "incorrect"
      );
    } else {
      return images.filter((img) => img.status === filterStatus);
    }
  },
}));
