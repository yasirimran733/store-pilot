'use client';

import Link from 'next/link';
import { useStore } from '@/app/context/StoreContext';
import Image from 'next/image';

export default function CheckoutPage() {
  const {
    cartItems,
    cartTotal,
    appliedCoupon,
    currentPage,
    navigateTo,
  } = useStore();

  // Only render if on checkout page (check both state and route)
  if (currentPage !== 'checkout') {
    return null;
  }

  const handleClose = () => {
    navigateTo('home');
  };

  if (cartItems.length === 0) {
    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-lg max-w-md w-full p-6 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Your cart is empty</h2>
          <p className="text-stone-600 mb-6">Add some items to your cart before checkout.</p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-slate-800">Checkout</h2>
          <button
            onClick={handleClose}
            className="text-stone-500 hover:text-slate-800 transition-colors p-1"
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Order Summary</h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-4 p-3 bg-stone-50 rounded-lg">
                  <div className="relative w-16 h-16 bg-stone-200 rounded flex-shrink-0 overflow-hidden">
                    {item.product.image && item.product.image.startsWith('/') ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-stone-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 mb-1">{item.product.name}</p>
                    <p className="text-xs text-stone-500 mb-1 uppercase">
                      {item.product.category}
                    </p>
                    {item.product.colors && Array.isArray(item.product.colors) && item.product.colors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.product.colors.map((color, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded"
                            title={color}
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-stone-600">
                      ${item.product.price} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon Display */}
          {appliedCoupon && (
            <div className={`p-4 rounded-lg border ${
              appliedCoupon.discountPercent < 0 
                ? 'bg-red-50 border-red-200' 
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    appliedCoupon.discountPercent < 0 ? 'text-red-800' : 'text-emerald-800'
                  }`}>
                    {appliedCoupon.discountPercent < 0 ? 'Penalty Applied' : 'Coupon Applied'}: {appliedCoupon.code}
                  </p>
                  <p className={`text-xs ${
                    appliedCoupon.discountPercent < 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {appliedCoupon.discountPercent < 0 
                      ? `+${Math.abs(appliedCoupon.discountPercent)}% increase` 
                      : `${appliedCoupon.discountPercent}% discount`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-stone-200 pt-4 space-y-2">
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
            <div className="flex justify-between text-xl font-bold text-slate-800 pt-2 border-t border-stone-200">
              <span>Total</span>
              <span>${cartTotal.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Info Form (UI Only) */}
          <div className="border-t border-stone-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Shipping Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Shipping Address
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800"
                        rows={3}
                        placeholder="123 Main St, City, State, ZIP"
                      />
                    </div>
                  </div>
                </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-stone-200">
            <Link
              href="/products"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-stone-300 text-slate-800 rounded-lg hover:bg-stone-50 transition-colors font-medium text-center inline-block"
            >
              Back to Shopping
            </Link>
            <button
              onClick={() => {
                alert('Thank you for your order! (This is a demo - no payment processed)');
                handleClose();
              }}
              className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              Complete Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
