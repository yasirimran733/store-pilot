'use client';

import { StoreProvider } from '@/app/context/StoreContext';
import ProductGrid from '@/app/components/ProductGrid';
import FloatingChatWidget from '@/app/components/FloatingChatWidget';
import ProductDetail from '@/app/components/ProductDetail';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useStore } from '@/app/context/StoreContext';

function ProductsContent() {
  const { visibleProducts, products, sortOrder, activeCategory } = useStore();

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-stone-200 text-lg">
            Discover our curated collection of premium products
          </p>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-600">
              Showing {visibleProducts.length} of {products.length} products
            </span>
            {activeCategory && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                {activeCategory}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-600">Sort:</span>
            <span className="text-sm font-medium text-slate-800">
              {sortOrder === 'asc' ? 'Price: Low to High' : sortOrder === 'desc' ? 'Price: High to Low' : 'Default'}
            </span>
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid />
      </div>

      <Footer />
      <FloatingChatWidget />
      <ProductDetail />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <StoreProvider>
      <ProductsContent />
    </StoreProvider>
  );
}
