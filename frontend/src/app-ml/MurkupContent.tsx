"use client"

import { Toolbar } from "@/app-ml/features/toolbar/components/Toolbar"
import { ImageGrid } from "@/app-ml/features/images/components/ImageGrid"
import { useSyncLabelStore } from "@/app-ml/features/labels/stores/labelStore"

export function MurkupContent() {

    useSyncLabelStore()

    return (
        <div className="flex flex-col h-full min-w-0 min-w-full space-y-4 pt-7">
            <Toolbar />
            <div className="flex-1 overflow-auto">
                <ImageGrid />
            </div>
        </div>
    )
}