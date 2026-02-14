'use client';

import { useStore } from '@/app/context/StoreContext';
import Image from 'next/image';

export default function ProductDetail() {
  const {
    products,
    currentProductId,
    currentPage,
    navigateTo,
    addToCart,
  } = useStore();

  // Find current product - this will re-render when currentProductId changes
  const product = currentProductId ? products.find((p) => p.id === currentProductId) : null;

  // If not on product page or no product, don't render
  if (currentPage !== 'product' || !product) {
    return null;
  }

  const handleClose = () => {
    navigateTo('home');
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-slate-800">{product.name}</h2>
          <button
            onClick={handleClose}
            className="text-stone-500 hover:text-slate-800 transition-colors p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative w-full h-96 bg-stone-100 rounded-lg overflow-hidden">
              {product.image && product.image.startsWith('/') ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-stone-400">No image available</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-stone-500 uppercase tracking-wide">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600">★</span>
                    <span className="text-sm font-medium text-slate-800">{product.rating}</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-3">{product.name}</h3>
                <p className="text-stone-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Price */}
              <div className="py-4 border-y border-stone-200">
                <p className="text-4xl font-bold text-slate-800">${product.price}</p>
              </div>

              {/* Colors */}
              {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-800 mb-2">Available Colors:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    addToCart(product.id);
                  }}
                  className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 border border-stone-300 text-slate-800 rounded-lg hover:bg-stone-50 transition-colors font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
