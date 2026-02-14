'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useStore } from '@/app/context/StoreContext';
import Image from 'next/image';

export default function CartSidebar() {
  const {
    cartItems,
    cartTotal,
    cartItemCount,
    removeFromCart,
    clearCart,
    navigateTo,
    appliedCoupon,
    removeCoupon,
  } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  // Auto-open sidebar when item is added (if closed)
  useEffect(() => {
    if (cartItems.length > 0 && !isOpen) {
      // Optionally auto-open, but don't force it
      // setIsOpen(true);
    }
  }, [cartItems.length, isOpen]);

  const handleCheckout = () => {
    navigateTo('checkout');
    setIsOpen(false);
  };

  return (
    <>
      {/* Cart Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-slate-800 text-white p-4 rounded-full shadow-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {(cartItemCount || 0) > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cartItemCount || 0}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Shopping Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-500 hover:text-slate-800 transition-colors"
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

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-stone-300 mb-4"
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
                  <p className="text-stone-500 text-lg mb-2">Your cart is empty</p>
                  <p className="text-stone-400 text-sm">Start shopping to add items!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 p-4 bg-stone-50 rounded-lg border border-stone-200"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 bg-stone-200 rounded flex-shrink-0 overflow-hidden">
                        {item.product.image && item.product.image.startsWith('/') ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-stone-400 text-xs">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-800 mb-1 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-stone-500 mb-1 uppercase">
                          {item.product.category}
                        </p>
                        {item.product.colors && Array.isArray(item.product.colors) && item.product.colors.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.product.colors.slice(0, 3).map((color, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded"
                                title={color}
                              >
                                {color}
                              </span>
                            ))}
                            {item.product.colors.length > 3 && (
                              <span className="text-xs text-stone-400">+{item.product.colors.length - 3}</span>
                            )}
                          </div>
                        )}
                        <p className="text-sm text-stone-600 mb-2">
                          ${item.product.price} × {item.quantity}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-xs text-red-600 hover:text-red-700 transition-colors font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Totals */}
            {cartItems.length > 0 && (
              <div className="border-t border-stone-200 px-6 py-4 space-y-4">
                {/* Coupon Display */}
                {appliedCoupon && (
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${
                    appliedCoupon.discountPercent < 0 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-emerald-50 border-emerald-200'
                  }`}>
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
                )}

                {/* Totals */}
                <div className="space-y-2">
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
                  <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t border-stone-200">
                    <span>Total</span>
                    <span>${cartTotal.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors font-medium"
                  >
                    Clear Cart
                  </button>
                  <Link
                    href="/checkout"
                    onClick={handleCheckout}
                    className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium text-center inline-block"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
