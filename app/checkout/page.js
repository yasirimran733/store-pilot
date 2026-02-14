'use client';

import Link from 'next/link';
import { StoreProvider } from '@/app/context/StoreContext';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import FloatingChatWidget from '@/app/components/FloatingChatWidget';
import CheckoutPage from '@/app/components/CheckoutPage';
import { useStore } from '@/app/context/StoreContext';

function CheckoutContent() {
  const { cartItems, navigateTo } = useStore();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Your cart is empty</h2>
          <p className="text-stone-600 mb-8">Add items to your cart before checkout.</p>
          <Link
            href="/products"
            onClick={() => navigateTo('products')}
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
      <CheckoutPage />
      <Footer />
      <FloatingChatWidget />
    </div>
  );
}

export default function CheckoutRoutePage() {
  return (
    <StoreProvider>
      <CheckoutContent />
    </StoreProvider>
  );
}
