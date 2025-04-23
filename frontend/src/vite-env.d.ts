/// <reference types="vite/client" />



interface ImportMetaEnv {
    readonly VITE_TRAINING_PIPELINE_ENDPOINT : string;
    readonly VITE_IMAGES_LOCK_SEC : number
    readonly IMAGES_PER_PAGE: number
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  
