'use client';

import Link from 'next/link';
import ProductGrid from '@/app/components/ProductGrid';
import ProductDetail from '@/app/components/ProductDetail';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useStore } from '@/app/context/StoreContext';
import { useChatOpen } from '@/app/context/ChatOpenContext';

export default function Home() {
  const { navigateTo } = useStore();
  const { openChat } = useChatOpen();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(5,150,105,0.15) 0%, transparent 50%)' }} />
        <div className="container-main relative py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-h1 mb-6 text-white">
              Find what you love, the human way.
            </h1>
            <p className="text-lg text-slate-200 leading-relaxed mb-10">
              Your AI shopkeeper understands what you need. Describe it in your own words—browse, compare, add to cart, and even haggle—all through a simple conversation.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={openChat}
                className="btn-accent"
              >
                Shop with AI
              </button>
              <Link
                href="/products"
                onClick={() => navigateTo('products')}
                className="btn-secondary !bg-white/10 !border-white/30 !text-white hover:!bg-white/20 hover:!border-white/40"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-16 md:py-20">
        <div className="container-main">
          <div className="mb-10">
            <h2 className="text-h2 mb-2 text-slate-900">Featured products</h2>
            <p className="text-slate-700 text-lg max-w-xl">
              Handpicked items loved by our customers. Ask the AI Clerk for recommendations or discounts.
            </p>
          </div>
          <ProductGrid />
        </div>
      </section>

      {/* Trust & How it works */}
      <section className="py-16 md:py-20 bg-white border-y border-slate-200/80">
        <div className="container-main">
          <h2 className="text-h2 text-center mb-12 text-slate-900">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-h3 mb-2 text-slate-900">Chat with the Clerk</h3>
              <p className="text-slate-700 leading-relaxed">
                Tell the AI what you’re looking for in plain language—no menus, no filters to click.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-h3 mb-2 text-slate-900">Discover & compare</h3>
              <p className="text-slate-700 leading-relaxed">
                The shopkeeper searches and sorts for you. Say “cheaper options” and the page updates.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-h3 mb-2 text-slate-900">Cart & checkout</h3>
              <p className="text-slate-700 leading-relaxed">
                Add to cart, ask for a discount, and go to checkout—all via chat or the usual buttons.
              </p>
            </div>
          </div>
          <div className="mt-14 flex flex-wrap justify-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">★</span> AI-assisted shopping
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">★</span> Handpicked products
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">★</span> Chat-based discounts
            </span>
          </div>
        </div>
      </section>

      <Footer />
      <ProductDetail />
    </div>
  );
}
