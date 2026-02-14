'use client';

import Link from 'next/link';
import { useStore } from '@/app/context/StoreContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const { cartItemCount, navigateTo } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  // Force re-render when cartItemCount changes
  const cartCount = cartItemCount || 0;

  const handleNavClick = (page) => {
    navigateTo(page);
    // Also update URL
    if (page === 'home') router.push('/');
    else if (page === 'products') router.push('/products');
    else if (page === 'cart') router.push('/cart');
    else if (page === 'checkout') router.push('/checkout');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-slate-800">Store Pilot</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              onClick={() => handleNavClick('home')}
              className={`text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-slate-800 font-semibold' : 'text-stone-600 hover:text-slate-800'
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => handleNavClick('products')}
              className={`text-sm font-medium transition-colors ${
                pathname === '/products' ? 'text-slate-800 font-semibold' : 'text-stone-600 hover:text-slate-800'
              }`}
            >
              Products
            </Link>
            <Link
              href="/cart"
              onClick={() => handleNavClick('cart')}
              className={`text-sm font-medium transition-colors ${
                pathname === '/cart' ? 'text-slate-800 font-semibold' : 'text-stone-600 hover:text-slate-800'
              }`}
            >
              Cart
            </Link>
            <Link
              href="/checkout"
              onClick={() => handleNavClick('checkout')}
              className={`text-sm font-medium transition-colors ${
                pathname === '/checkout' ? 'text-slate-800 font-semibold' : 'text-stone-600 hover:text-slate-800'
              }`}
            >
              Checkout
            </Link>
          </div>

          {/* Cart Icon */}
          <Link
            href="/cart"
            onClick={() => handleNavClick('cart')}
            className="relative p-2 text-stone-600 hover:text-slate-800 transition-colors"
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
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/cart"
              onClick={() => handleNavClick('cart')}
              className="relative p-2 text-stone-600 hover:text-slate-800 transition-colors"
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
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button className="p-2 text-stone-600 hover:text-slate-800">
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
