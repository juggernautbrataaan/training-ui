import { Home } from '@/app-products/features/layouts/Home';
import { RefreshProvider } from '@/hooks/useRefresh'
import { ProductsProvider } from '@/app-products/context/ProductsContext';
import { Toaster } from "@/components/ui/toaster"

function Products() {
  return (
    <RefreshProvider>
      <ProductsProvider>
        <Home />
        <Toaster />
      </ProductsProvider>
    </RefreshProvider>

  );
}

export default Products;

