# Store Pilot - AI-Powered Shopping Experience

> "Don't just build a shop. Build a Shopkeeper."

Store Pilot is a chat-controlled e-commerce storefront where an AI Clerk behaves like a real shopkeeper, controlling the entire UI through natural conversation.

## 🎯 Core Concept

This is **NOT** a chatbot demo. This is an **AI agent that ACTS**.

The AI:
- Talks naturally and confidently
- Understands user intent semantically (not keyword matching)
- Manages inventory truthfully
- **Controls the website UI** through function calls
- Negotiates prices (haggle mode)
- Completes full purchases via chat alone

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- OpenAI API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your OPENAI_API_KEY to .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see Store Pilot in action.

## 🏗️ Project Structure

```
/app
  /components        → UI components (ChatWidget, ProductGrid, CartSidebar, etc.)
  /context           → StoreContext.js (state management)
  /data
    products.json    → Inventory (single source of truth)
  /lib               → OpenAI client + RAG logic
  /api
    chat/route.js    → OpenAI function calling endpoint
```

## ✨ Features

### 🤖 AI Function Calling
All UI changes happen through AI function calls:
- `searchProducts(query)` - Semantic search
- `filterCategory(category)` - Filter by category
- `sortProducts(order)` - Sort by price
- `addToCart(productId)` - Add to cart
- `navigateToProduct(productId)` - View product details
- `negotiateDiscount(request)` - Haggle mode
- `applyCoupon(code, discountPercent)` - Apply discounts

### 💸 Haggle Mode
- Good reasons (birthday, buying multiple) → 15-25% discount
- Neutral reasons → 5-10% discount
- Rude requests → Politely refused
- Never goes below `bottom_price`
- Auto-generates unique coupon codes

### 🔍 Semantic Search (RAG)
- In-memory search across product fields
- Understands context, not just keywords
- Example: "summer wedding outfit" finds relevant products

### 🎨 Premium UI
- Modern luxury-neutral aesthetic
- Off-white background, slate primary, emerald accents
- Fully responsive (mobile, tablet, desktop)
- Real-time updates as AI controls the UI

## 🎮 Demo Flow

1. **Search**: "Show me summer wedding outfits"
2. **Filter**: "Show me only bags"
3. **Sort**: "Show me cheaper options"
4. **Add**: "Add the leather tote to cart"
5. **Haggle**: "It's my birthday, can I get a discount?"
6. **Navigate**: "Show me details of the watch"
7. **Checkout**: "Proceed to checkout"

All of this happens through **chat only** - no buttons required!

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (no TypeScript)
- **Styling**: Tailwind CSS
- **State**: React Context (client-side only)
- **AI**: OpenAI API (Function Calling)
- **RAG**: In-memory semantic search

## 📋 Requirements

- ✅ Chat controls website UI
- ✅ Inventory is real and respected (products.json)
- ✅ Negotiation works logically
- ✅ UI looks premium
- ✅ AI feels human
- ✅ No-Menu Rule: Everything works via chat

## 🎯 Hackathon Judging Criteria

Judges check:
1. **Does chat actually change the website UI and cart?**
2. Inventory truthfulness
3. Negotiation logic
4. UI quality
5. AI personality

## 📝 Environment Variables

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-3.5-turbo  # Optional, defaults to gpt-3.5-turbo
```

## 🚧 Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

## 📦 Inventory

All products are defined in `/app/data/products.json`. Each product must have:
- `id`, `name`, `category`, `description`
- `price`, `bottom_price` (for haggle mode)
- `colors`, `rating`, `image`

**The AI NEVER invents products or prices** - only uses what's in products.json.

## 🎨 Styling

Uses Tailwind CSS with custom theme:
- Background: `stone-50` (off-white)
- Primary: `slate-800` (deep charcoal)
- Accent: `emerald-600` (muted emerald)

## 📄 License

This is a hackathon project. Use freely for learning and inspiration.

---

Built with ❤️ for hackathon judges who appreciate **AI that ACTS**.
