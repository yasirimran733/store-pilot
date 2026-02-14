'use client';

import { StoreProvider } from '@/app/context/StoreContext';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import FloatingChatWidget from '@/app/components/FloatingChatWidget';
import { useStore } from '@/app/context/StoreContext';
import Image from 'next/image';
import Link from 'next/link';

function CartContent() {
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
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 text-stone-300 mx-auto mb-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Your cart is empty</h2>
            <p className="text-stone-600 mb-8">Start shopping to add items to your cart!</p>
            <Link
              href="/products"
              onClick={() => navigateTo('products')}
              className="inline-block px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              Browse Products
            </Link>
          </div>
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
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-lg border border-stone-200 p-6 flex gap-6"
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.image && item.product.image.startsWith('/') ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-stone-400 text-xs">No image</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    {item.product.name}
                  </h3>
                  <p className="text-xs text-stone-500 mb-1 uppercase tracking-wide">
                    {item.product.category}
                  </p>
                  {item.product.colors && Array.isArray(item.product.colors) && item.product.colors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.product.colors.map((color, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded"
                          title={color}
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-stone-600 mb-2">
                    ${item.product.price} × {item.quantity}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mb-3">
                    Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
                  >
                    Remove
                  </button>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-800">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-stone-200 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">Order Summary</h2>

              {/* Coupon Display */}
              {appliedCoupon && (
                <div className={`mb-4 p-4 rounded-lg border ${
                  appliedCoupon.discountPercent < 0 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center justify-between">
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
                          ? `+${Math.abs(appliedCoupon.discountPercent)}% increase` 
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

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>${cartTotal.subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && cartTotal.discount !== 0 && (
                  <div className={`flex justify-between ${cartTotal.isPenalty ? 'text-red-600' : 'text-emerald-600'}`}>
                    <span>{cartTotal.isPenalty ? 'Price Adjustment' : 'Discount'}</span>
                    <span>{cartTotal.isPenalty ? `+$${Math.abs(cartTotal.discount).toFixed(2)}` : `-$${cartTotal.discount.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-slate-800 pt-3 border-t border-stone-200">
                  <span>Total</span>
                  <span>${cartTotal.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={() => navigateTo('checkout')}
                  className="w-full px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium text-center inline-block"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full px-6 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors font-medium"
                >
                  Clear Cart
                </button>
                <Link
                  href="/products"
                  onClick={() => navigateTo('products')}
                  className="w-full px-6 py-2 text-stone-600 hover:text-slate-800 transition-colors font-medium text-center inline-block"
                >
                  Continue Shopping
                </Link>
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

export default function CartPage() {
  return (
    <StoreProvider>
      <CartContent />
    </StoreProvider>
  );
}
