'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useStore } from '@/app/context/StoreContext';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    clearCart,
    navigateTo,
    appliedCoupon,
    removeCoupon,
  } = useStore();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="container-main py-24 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-h2 mb-2 text-slate-900">Your cart is empty</h2>
            <p className="text-slate-700 mb-8 max-w-sm">Add items from the store or ask the AI Clerk to add them for you.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/products"
              onClick={() => navigateTo('products')}
              className="btn-primary"
            >
              Browse products
            </Link>
            <Link
              href="/"
              onClick={() => navigateTo('home')}
              className="btn-secondary"
            >
              Back to home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <div className="container-main py-10">
        <h1 className="text-h2 mb-8 text-slate-900">Shopping cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="card p-6 flex gap-6 flex-wrap sm:flex-nowrap"
              >
                <div className="relative w-full sm:w-28 h-28 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.product.image && item.product.image.startsWith('/') ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-slate-400 text-xs">No image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">{item.product.name}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">{item.product.category}</p>
                  <p className="text-slate-600 text-sm mb-2">
                    ${item.product.price} × {item.quantity}
                  </p>
                  <p className="font-semibold text-slate-900 mb-3">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <div className="w-full sm:w-auto sm:text-right">
                  <p className="text-xl font-bold text-slate-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Order summary</h2>

              {appliedCoupon && (
                <div className={`mb-4 p-4 rounded-xl border ${
                  appliedCoupon.discountPercent < 0
                    ? 'bg-red-50 border-red-200'
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className={`text-sm font-medium ${
                        appliedCoupon.discountPercent < 0 ? 'text-red-800' : 'text-emerald-800'
                      }`}>
                        {appliedCoupon.discountPercent < 0 ? 'Penalty' : 'Coupon'}: {appliedCoupon.code}
                      </p>
                      <p className={`text-xs ${
                        appliedCoupon.discountPercent < 0 ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {appliedCoupon.discountPercent < 0
                          ? `+${Math.abs(appliedCoupon.discountPercent)}%`
                          : `${appliedCoupon.discountPercent}% off`}
                      </p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className={`text-sm font-medium ${
                        appliedCoupon.discountPercent < 0
                          ? 'text-red-600 hover:text-red-700'
                          : 'text-emerald-600 hover:text-emerald-700'
                      }`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span>${cartTotal.subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && cartTotal.discount !== 0 && (
                  <div className={`flex justify-between ${cartTotal.isPenalty ? 'text-red-600' : 'text-emerald-600'}`}>
                    <span>{cartTotal.isPenalty ? 'Adjustment' : 'Discount'}</span>
                    <span>{cartTotal.isPenalty ? `+$${Math.abs(cartTotal.discount).toFixed(2)}` : `-$${cartTotal.discount.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total</span>
                  <span>${cartTotal.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={() => navigateTo('checkout')}
                  className="btn-primary w-full py-4 text-center block"
                >
                  Proceed to checkout
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full btn-secondary py-3"
                >
                  Clear cart
                </button>
                <Link
                  href="/products"
                  onClick={() => navigateTo('products')}
                  className="w-full text-center block text-slate-700 hover:text-slate-900 font-medium text-sm py-2"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
