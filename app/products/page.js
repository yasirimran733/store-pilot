'use client';

import ProductGrid from '@/app/components/ProductGrid';
import ProductDetail from '@/app/components/ProductDetail';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useStore } from '@/app/context/StoreContext';

export default function ProductsPage() {
  const { visibleProducts, products, sortOrder, activeCategory } = useStore();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <section className="bg-slate-900 text-white py-14">
        <div className="container-main">
          <h1 className="text-h1 text-white mb-3">Our products</h1>
          <p className="text-slate-200 text-lg max-w-xl">
            Discover our curated collection. Use the AI Shopkeeper to search, filter, or sort by price.
          </p>
        </div>
      </section>

      <section className="container-main py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <p className="text-sm text-slate-700">
            Showing <span className="font-medium text-slate-900">{visibleProducts.length}</span> of {products.length} products
            {activeCategory && (
              <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                {activeCategory}
              </span>
            )}
          </p>
          <p className="text-sm text-slate-700">
            Sort: <span className="font-medium text-slate-900">
              {sortOrder === 'asc' ? 'Price: Low to High' : sortOrder === 'desc' ? 'Price: High to Low' : 'Default'}
            </span>
          </p>
        </div>

        <ProductGrid />
      </section>

      <Footer />
      <ProductDetail />
    </div>
  );
}
