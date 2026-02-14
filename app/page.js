'use client';

import { StoreProvider } from '@/app/context/StoreContext';
import ProductGrid from '@/app/components/ProductGrid';
import FloatingChatWidget from '@/app/components/FloatingChatWidget';
import ProductDetail from '@/app/components/ProductDetail';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useStore } from '@/app/context/StoreContext';

function HomeContent() {
  const { navigateTo } = useStore();

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to Store Pilot
            </h1>
            <p className="text-xl text-stone-200 mb-8">
              Your AI-powered shopping experience. Chat with our shopkeeper to find exactly what you're looking for.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigateTo('products')}
                className="px-6 py-3 bg-white text-slate-800 rounded-lg hover:bg-stone-100 transition-colors font-semibold"
              >
                Shop Now
              </button>
              <button
                onClick={() => {
                  document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
              >
                Explore
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Featured Products</h2>
          <p className="text-stone-600">
            Discover our curated collection of premium products
          </p>
        </div>
        <ProductGrid />
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Chat with AI</h3>
              <p className="text-stone-600">
                Simply describe what you're looking for in natural language
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">AI Finds Products</h3>
              <p className="text-stone-600">
                Our AI shopkeeper searches and filters products for you
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Shop Seamlessly</h3>
              <p className="text-stone-600">
                Add to cart, negotiate prices, and checkout all via chat
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <FloatingChatWidget />
      <ProductDetail />
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <HomeContent />
    </StoreProvider>
  );
}
