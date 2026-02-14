# Store Pilot – Testing & Requirements Verification

**Project:** Store Pilot (Softronix 4.0 Hackathon)  
**Theme:** “Don’t just build a shop. Build a Shopkeeper.”  
**Date:** February 13, 2026  
**Purpose:** Requirement-based verification and test documentation for judges.

---

## 1. Accepted Scope & Limitations

- **Frontend-only:** No real payment or backend order processing. Checkout is UI-only.
- **Mock inventory:** Product data comes from `data/products.json` only.
- **AI variance:** Clerk wording and tone may vary (LLM); only deterministic behavior is asserted below.
- **Single session:** Cart and coupon persist in `localStorage` across navigation and refresh; chat history is in-memory and persists only across navigation (not refresh).

---

## 2. Fixes Applied (Pre-Submission)

| Issue | Fix |
|-------|-----|
| Cart and full store state reset on navigation | Single `StoreProvider` moved to root layout via `StoreProviderWrapper`; all pages no longer wrap their own provider. |
| Chat history lost on route change | One `FloatingChatWidget` rendered in root layout so it never unmounts; chat history persists across all in-app navigation. |
| Cart lost on page refresh | Cart items and applied coupon are hydrated from `localStorage` on load and persisted on every change. |

---

## 3. Requirement Checklist

### A. Storefront

| # | Requirement | Verified | Notes |
|---|-------------|----------|--------|
| A1 | Professional UI (Navbar, Pages, Products, Cart, Checkout) | Yes | Navbar, Home, Products, Cart, Checkout and product detail pages implemented. |
| A2 | Dedicated Products page | Yes | `/products` with `ProductGrid`, categories, sort. |
| A3 | Cart page reflects actual cart state | Yes | Cart page reads from `useStore()`; single provider ensures same state everywhere. |
| A4 | Cart persists across page navigation | Yes | One `StoreProvider` in layout; no per-page provider remount. |
| A5 | UI updates immediately on each action | Yes | Add to cart, remove, coupon apply, sort, filter all update React state; components subscribe to same context. |

### B. AI Clerk (RAG-Like Agent)

| # | Requirement | Verified | Notes |
|---|-------------|----------|--------|
| B1 | Clerk reads from inventory (`products.json`) | Yes | API and client use same inventory; search/filter/add use product IDs and data from store. |
| B2 | No-menu rule: browse, add to cart, apply discount, go to checkout via chat only | Yes | Functions: `searchProducts`, `filterCategory`, `sortProducts`, `addToCart`, `applyCoupon`, `navigateToProduct` (including checkout). |
| B3 | Product responses include name, price, short description, link to product page | Yes | System prompt and function results expose name, price, description; product pages exist at `/products/[id]`. Clerk can reference URLs in natural language. |

### C. Real UI Control

| # | Requirement | Verified | Notes |
|---|-------------|----------|--------|
| C1 | “Cheaper options” → UI re-sorts products | Yes | `sortProducts('asc')` updates `visibleProducts` and sort state; Products page and grid re-render. |
| C2 | Clerk adds item to cart → cart UI updates instantly | Yes | Chat runs `executeFunctionChain` → `store.addToCart(productId)`; cart state updates; Navbar count and Cart page reflect it. |
| C3 | Coupon applied → cart total updates instantly | Yes | `applyCoupon(code, discountPercent)` sets `appliedCoupon`; cart summary and checkout use it for discount and total. |

### D. Haggle Mode

| # | Requirement | Verified | Notes |
|---|-------------|----------|--------|
| D1 | Hidden bottom price respected | Yes | `evaluateDiscountRequest` caps discount so discounted price never goes below `product.bottom_price`. |
| D2 | Valid reasons → discount applied | Yes | Good reasons (e.g. birthday, multiple items) yield 15–25%; neutral 5–10%; coupon code generated when approved. |
| D3 | Rude behavior → refusal or price increase | Yes | Rude/lowball logic refuses discount and can return penalty metadata; UI interprets as refusal. *Accepted:* price-increase coupon is not applied to cart total (refusal only). |
| D4 | Coupon auto-applied to cart session | Yes | When Clerk applies a coupon via `applyCoupon`, it is stored in context and persisted to `localStorage`; cart and checkout show discounted total. |
| D5 | No discount below bottom price | Yes | Logic in `evaluateDiscountRequest` enforces this before returning approved discount. |

---

## 4. Feature-by-Feature Test Cases

### 4.1 Cart & Navigation

| Test | Steps | Expected | Status |
|------|--------|----------|--------|
| Cart persists on navigation | Add item on Home → go to Products → go to Cart | Cart shows the item; count in Navbar correct | Pass |
| Cart persists on refresh | Add items → refresh page | Cart repopulated from `localStorage` | Pass |
| Coupon persists on navigation | Apply coupon via chat → go to Cart/Checkout | Discount reflected; same after navigation | Pass |

### 4.2 Chat → UI Sync

| Test | Steps | Expected | Status |
|------|--------|----------|--------|
| Add to cart via chat | “Add the Classic Leather Tote to my cart” (after search) | Cart count and Cart page update immediately | Pass |
| Sort via chat | “Show me cheaper options” | Products list re-sorts ascending by price; UI updates | Pass |
| Coupon via chat | Ask for discount with valid reason → Clerk applies coupon | Cart total shows discount immediately | Pass |
| Navigate via chat | “Take me to checkout” | Router navigates to `/checkout` | Pass |

### 4.3 Haggle

| Test | Steps | Expected | Status |
|------|--------|----------|--------|
| Good reason | “It’s my birthday, any discount?” | Clerk may approve; coupon generated and applicable | Pass |
| Bottom price | Request discount that would go below `bottom_price` | Discount capped or refused so price ≥ bottom_price | Pass |
| Rude behavior | Use rude language in discount request | Clerk refuses (and may mention penalty); no discount applied | Pass |

### 4.4 Storefront

| Test | Steps | Expected | Status |
|------|--------|----------|--------|
| Products page | Open `/products` | Grid of all products; category filter and sort work | Pass |
| Product detail | Click product or open `/products/[id]` | Detail page with image, price, description, Add to Cart | Pass |
| Cart page | Add items, open `/cart` | Line items, quantities, subtotal, coupon discount, total correct | Pass |
| Checkout | Go to checkout with items | Form and order summary; no real payment | Pass |

---

## 5. Confirmation Statement

- **Storefront:** Professional UI, dedicated Products and Cart pages, cart reflects real state, persists across navigation and refresh, and updates immediately on actions.
- **AI Clerk:** Uses inventory from `products.json`, supports no-menu flow (browse, add to cart, discount, checkout) via chat, and product responses can include name, price, description, and product page link.
- **Real UI control:** “Cheaper options” re-sorts the list; add-to-cart and coupon application from chat update the cart UI instantly.
- **Haggle:** Bottom price is enforced; valid reasons get discounts and coupon; rude behavior is refused; coupon is applied to the session and persisted; no discount goes below bottom price.

**Accepted limitations:** Frontend-only; mock inventory; no price-increase applied in cart for rude behavior (refusal only); chat history not persisted across full page reload.

---

**Document version:** 1.0 (post-audit fixes)
