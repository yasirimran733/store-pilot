'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="container-main py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          <div className="md:col-span-1">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Store Pilot</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              AI-powered shopping. Chat with the Clerk to find, compare, and buy—your way.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Quick links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-slate-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/products" className="text-slate-300 hover:text-white transition-colors">Products</Link></li>
              <li><Link href="/cart" className="text-slate-300 hover:text-white transition-colors">Cart</Link></li>
              <li><Link href="/checkout" className="text-slate-300 hover:text-white transition-colors">Checkout</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Connect</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://www.linkedin.com/in/yasir-imran"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/yasirimran733"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700/80 mt-12 pt-8 text-center text-sm text-slate-300">
          <p>© {new Date().getFullYear()} Store Pilot. Demo store for hackathon.</p>
        </div>
      </div>
    </footer>
  );
}
