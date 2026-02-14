'use client';

import { StoreProvider } from '@/app/context/StoreContext';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import FloatingChatWidget from '@/app/components/FloatingChatWidget';
import { useStore } from '@/app/context/StoreContext';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products, addToCart, navigateTo } = useStore();
  
  const productId = params?.id ? parseInt(params.id) : null;
  const product = productId ? products.find((p) => p.id === productId) : null;

  useEffect(() => {
    if (productId && product) {
      // Ensure navigation state is set
      navigateTo('product', productId);
    }
  }, [productId, product, navigateTo]);

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Product Not Found</h2>
          <p className="text-stone-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Browse Products
          </Link>
        </div>
        <Footer />
        <FloatingChatWidget />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-slate-800 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative w-full h-96 md:h-[600px] bg-stone-100 rounded-lg overflow-hidden">
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

          {/* Product Details */}
          <div className="space-y-6">
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
              <h1 className="text-4xl font-bold text-slate-800 mb-4">{product.name}</h1>
              <p className="text-stone-600 leading-relaxed text-lg">{product.description}</p>
            </div>

            {/* Price */}
            <div className="py-6 border-y border-stone-200">
              <p className="text-5xl font-bold text-slate-800">${product.price}</p>
            </div>

            {/* Colors */}
            {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-800 mb-3">Available Colors:</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => {
                  addToCart(product.id);
                }}
                className="flex-1 px-8 py-4 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold text-lg"
              >
                Add to Cart
              </button>
              <Link
                href="/products"
                className="px-8 py-4 border-2 border-stone-300 text-slate-800 rounded-lg hover:bg-stone-50 transition-colors font-semibold text-lg"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Product Info */}
            <div className="pt-6 border-t border-stone-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Product Information</h3>
              <div className="space-y-2 text-stone-600">
                <p><span className="font-medium">Category:</span> {product.category}</p>
                <p><span className="font-medium">Rating:</span> {product.rating} / 5.0</p>
                {product.colors && (
                  <p><span className="font-medium">Available Colors:</span> {product.colors.join(', ')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <FloatingChatWidget />
    </div>
  );
}

export default function ProductPage() {
  return (
    <StoreProvider>
      <ProductDetailPage />
    </StoreProvider>
  );
}
