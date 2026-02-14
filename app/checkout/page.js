'use client';

import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import CheckoutPage from '@/app/components/CheckoutPage';
import { useStore } from '@/app/context/StoreContext';
import { useEffect } from 'react';

export default function CheckoutRoutePage() {
  const { cartItems, navigateTo } = useStore();

  useEffect(() => {
    navigateTo('checkout');
  }, [navigateTo]);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="container-main py-24 text-center">
          <h2 className="text-h2 mb-2 text-slate-900">Your cart is empty</h2>
          <p className="text-slate-700 mb-8">Add items before checkout.</p>
          <Link href="/products" onClick={() => navigateTo('products')} className="btn-primary">
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
      <CheckoutPage />
      <Footer />
    </div>
  );
}
