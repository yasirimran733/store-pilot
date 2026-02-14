'use client';

import Link from 'next/link';
import { useStore } from '@/app/context/StoreContext';
import Image from 'next/image';

export default function ProductGrid() {
  const { visibleProducts } = useStore();

  if (!visibleProducts || visibleProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl border border-slate-200/80 bg-slate-50/50">
        <svg className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-slate-700 text-lg font-medium mb-1">No products found</p>
        <p className="text-slate-600 text-sm">Try a different search or filter in chat.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {visibleProducts.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="group block"
        >
          <article className="card overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative w-full aspect-[4/5] bg-slate-100 overflow-hidden">
              {product.image && product.image.startsWith('/') ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <span className="text-slate-400 text-sm">No image</span>
                </div>
              )}
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 shadow-sm">
                <span className="text-amber-500 text-sm">★</span>
                <span className="text-sm font-medium text-slate-800">{product.rating}</span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                {product.category}
              </span>
              <h3 className="font-semibold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                {product.name}
              </h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>

              <div className="mt-auto flex items-end justify-between gap-3 pt-4 border-t border-slate-100">
                <span className="text-xl font-bold text-slate-900">${product.price}</span>
                <span className="text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
                  View details →
                </span>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
