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

  if (currentPage !== 'checkout') {
    return null;
  }

  const handleClose = () => {
    navigateTo('home');
  };

  if (cartItems.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-xl animate-panel-slide" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-h2 mb-4 text-slate-900">Your cart is empty</h2>
          <p className="text-slate-700 mb-6">Add items to your cart before checkout.</p>
          <Link href="/products" onClick={handleClose} className="btn-primary">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={handleClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8 shadow-xl animate-panel-slide" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-900">Checkout</h2>
          <button onClick={handleClose} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" aria-label="Close">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200/80">
            <strong>Demo checkout.</strong> No payment is processed. This is for demonstration only.
          </p>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Order summary</h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="relative w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.product.image && item.product.image.startsWith('/') ? (
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><span className="text-slate-400 text-xs">No image</span></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 mb-0.5">{item.product.name}</p>
                    <p className="text-xs text-slate-600 uppercase">{item.product.category}</p>
                    <p className="text-sm text-slate-600 mt-1">${item.product.price} × {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {appliedCoupon && (
            <div className={`p-4 rounded-xl border ${appliedCoupon.discountPercent < 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className={`text-sm font-medium ${appliedCoupon.discountPercent < 0 ? 'text-red-800' : 'text-emerald-800'}`}>
                {appliedCoupon.discountPercent < 0 ? 'Penalty' : 'Coupon'}: {appliedCoupon.code}
              </p>
              <p className={`text-xs ${appliedCoupon.discountPercent < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {appliedCoupon.discountPercent < 0 ? `+${Math.abs(appliedCoupon.discountPercent)}%` : `${appliedCoupon.discountPercent}% off`}
              </p>
            </div>
          )}

          <div className="border-t border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between text-slate-700"><span>Subtotal</span><span>${cartTotal.subtotal.toFixed(2)}</span></div>
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

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Shipping (demo)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                <input type="text" className="input-field" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="input-field" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea className="input-field resize-none" rows={3} placeholder="123 Main St, City, State, ZIP" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Link href="/products" onClick={handleClose} className="flex-1 btn-secondary py-3 text-center">
              Back to shopping
            </Link>
            <button
              onClick={() => {
                alert('Thank you! This is a demo — no payment was processed.');
                handleClose();
              }}
              className="flex-1 btn-primary py-3"
            >
              Complete order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
