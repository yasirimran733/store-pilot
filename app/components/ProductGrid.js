'use client';

import { useStore } from '@/app/context/StoreContext';
import Image from 'next/image';

export default function ProductGrid() {
  const { visibleProducts, navigateToProduct } = useStore();

  if (!visibleProducts || visibleProducts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-stone-50 rounded-lg border border-stone-200">
        <p className="text-stone-500 text-lg">No products found. Try searching or filtering!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {visibleProducts.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
          onClick={() => navigateToProduct(product.id)}
        >
          {/* Product Image */}
          <div className="relative w-full h-64 bg-stone-100 overflow-hidden">
            {product.image && product.image.startsWith('/') ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-200">
                <span className="text-stone-400 text-sm">No image</span>
              </div>
            )}
            {/* Rating Badge */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
              <span className="text-emerald-600 text-xs font-semibold">★</span>
              <span className="text-xs font-medium text-slate-800">{product.rating}</span>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-semibold text-slate-800 text-lg mb-1 group-hover:text-emerald-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-stone-600 text-sm mb-3 line-clamp-2">{product.description}</p>
            
            {/* Category & Colors */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-stone-500 uppercase tracking-wide">
                {product.category}
              </span>
              {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
                <div className="flex gap-1">
                  {product.colors.slice(0, 3).map((color, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded"
                      title={color}
                    >
                      {color}
                    </span>
                  ))}
                  {product.colors.length > 3 && (
                    <span className="text-xs text-stone-500">+{product.colors.length - 3}</span>
                  )}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="text-2xl font-bold text-slate-800">
                ${product.price}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToProduct(product.id);
                }}
                className="px-4 py-1.5 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
