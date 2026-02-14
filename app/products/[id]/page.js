'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useStore } from '@/app/context/StoreContext';
import { useChatOpen } from '@/app/context/ChatOpenContext';
import { useToast } from '@/app/context/ToastContext';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ProductDetailPage() {
  const params = useParams();
  const { products, addToCart, navigateTo } = useStore();
  const { openChat } = useChatOpen();
  const { addToast } = useToast();

  const productId = params?.id ? parseInt(params.id) : null;
  const product = productId ? products.find((p) => p.id === productId) : null;

  useEffect(() => {
    if (productId && product) {
      navigateTo('product', productId);
    }
  }, [productId, product, navigateTo]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id);
    addToast(`Added "${product.name}" to cart`, 'success');
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="container-main py-24 text-center">
          <h2 className="text-h2 mb-4 text-slate-900">Product not found</h2>
          <p className="text-slate-700 mb-8">This product doesn’t exist or was removed.</p>
          <Link href="/products" className="btn-primary" onClick={() => navigateTo('products')}>
            Browse products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <div className="container-main py-10">
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-slate-800 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          <div className="relative w-full aspect-square md:aspect-auto md:h-[540px] bg-slate-100 rounded-2xl overflow-hidden">
            {product.image && product.image.startsWith('/') ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-slate-400">No image</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{product.category}</span>
              <div className="flex items-center gap-2 mt-1 mb-2">
                <span className="text-amber-500">★</span>
                <span className="text-sm font-medium text-slate-700">{product.rating} / 5</span>
              </div>
              <h1 className="text-h2 mb-4 text-slate-900">{product.name}</h1>
              <p className="text-slate-700 leading-relaxed text-lg">{product.description}</p>
            </div>

            <div className="py-6 border-y border-slate-200">
              <p className="text-4xl md:text-5xl font-bold text-slate-900">${product.price}</p>
            </div>

            {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-800 mb-2">Available colors</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1 py-4 text-base"
              >
                Add to cart
              </button>
              <Link
                href="/products"
                onClick={() => navigateTo('products')}
                className="btn-secondary py-4 text-center"
              >
                Continue shopping
              </Link>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-700">
                Want a discount or alternatives?{' '}
                <button
                  type="button"
                  onClick={openChat}
                  className="font-medium text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                >
                  Ask the Clerk
                </button>
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-h3 mb-3">Details</h3>
              <dl className="space-y-2 text-slate-700">
                <div><dt className="inline font-medium">Category </dt><dd className="inline">{product.category}</dd></div>
                <div><dt className="inline font-medium">Rating </dt><dd className="inline">{product.rating} / 5.0</dd></div>
                {product.colors?.length > 0 && (
                  <div><dt className="inline font-medium">Colors </dt><dd className="inline">{product.colors.join(', ')}</dd></div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
