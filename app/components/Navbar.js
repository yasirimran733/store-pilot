'use client';

import Link from 'next/link';
import { useStore } from '@/app/context/StoreContext';
import { useChatOpen } from '@/app/context/ChatOpenContext';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { cartItemCount, navigateTo } = useStore();
  const { openChat } = useChatOpen();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cartItemCount || 0;

  const handleNavClick = (page) => {
    navigateTo(page);
    setMobileMenuOpen(false);
    if (page === 'home') router.push('/');
    else if (page === 'products') router.push('/products');
    else if (page === 'cart') router.push('/cart');
    else if (page === 'checkout') router.push('/checkout');
  };

  const navLink = (href, label, page) => {
    const isActive = pathname === href || (href === '/' && pathname === '/');
    return (
      <Link
        href={href}
        onClick={() => handleNavClick(page)}
        className={`text-sm font-medium transition-colors rounded-lg px-3 py-2 ${
          isActive
            ? 'text-slate-900 bg-slate-100'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            href="/"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:inline">
              Store Pilot
            </span>
          </Link>

          {/* Desktop: Center nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLink('/', 'Home', 'home')}
            {navLink('/products', 'Products', 'products')}
            {navLink('/cart', 'Cart', 'cart')}
            {navLink('/checkout', 'Checkout', 'checkout')}
          </div>

          {/* Desktop: Right */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/cart"
              onClick={() => handleNavClick('cart')}
              className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label={`Cart, ${cartCount} items`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 flex items-center justify-center bg-emerald-500 text-white text-xs font-bold rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={openChat}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Ask the Shopkeeper
            </button>
          </div>

          {/* Mobile: Cart + Menu */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/cart"
              onClick={() => handleNavClick('cart')}
              className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Cart"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-emerald-500 text-white text-xs font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={openChat}
              className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              aria-label="Open AI Shopkeeper"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/80 animate-panel-slide">
            <div className="flex flex-col gap-1">
              {navLink('/', 'Home', 'home')}
              {navLink('/products', 'Products', 'products')}
              {navLink('/cart', 'Cart', 'cart')}
              {navLink('/checkout', 'Checkout', 'checkout')}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
