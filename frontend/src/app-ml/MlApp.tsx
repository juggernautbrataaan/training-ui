"use client"

import { useState } from "react"
import { AppLayout } from "@/app-ml/features/layout/components/AppLayout"
import { MurkupContent } from "@/app-ml/MurkupContent"
import Products from '@/app-products/Products'
import { TooltipProvider } from "@/components/ui/tooltip"


function MlApp() {
    const [tab, setTab] = useState<string>('images')


    return (
        <TooltipProvider>
            <AppLayout tab={tab} setTab={setTab}>
                {tab === 'images' && <MurkupContent />}
                {tab === 'products' && <Products />}
            </AppLayout>
        </TooltipProvider>

    )
}

export default MlApp
