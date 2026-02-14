🧠 Project Context: Store Pilot

“Don’t just build a shop. Build a Shopkeeper.”

This project is a chat-controlled e-commerce experience where an AI Clerk behaves like a real shopkeeper, not a chatbot.

The AI:

Talks naturally and confidently

Understands user intent (semantic meaning, not keywords)

Manages inventory truthfully

Controls the website UI

Negotiates prices (haggle mode)

Can complete a full purchase via chat alone (No-Menu Rule)

🚫 This is NOT a chatbot demo.
✅ This is an AI agent that ACTS.

🏆 Core Success Rule (CRITICAL)

Judges will check one thing first:

👉 Does chat actually change the website UI and cart?

Everything in this project must serve this rule.

If chat does not visibly:

change product listings

add items to cart

apply discounts

navigate pages

❌ The project fails.

🔒 Tech Stack (LOCKED – Do Not Change)

This stack is mandatory.

Framework: Next.js (App Router)

Language: JavaScript (NOT TypeScript)

Styling: Tailwind CSS

State Management: React Context (client-side only)

Inventory: Static products.json

AI: OpenAI API (Function Calling required)

RAG: In-memory semantic search over products.json

Backend Server: ❌ None

Authentication: ❌ None

Payments: ❌ None

Database: ❌ None

⚡ Hackathon rule:

Speed + visible behavior > architecture purity

📁 Folder Structure (MUST FOLLOW)
/app
  /components        → UI components
  /context           → Cart + UI control state
  /data
    products.json    → Inventory + pricing truth
  /lib               → OpenAI + RAG logic
  /api
    chat/route.js    → OpenAI interaction (App Router)


No extra folders.
No backend folders.
No unused abstractions.

🛍️ Storefront Requirements
Required Pages

Product listing page

Product detail page

Cart page

Checkout page (UI only)

Clean, premium, trustworthy UI

🎨 Visual Theme (IMPORTANT FOR JUDGES)

Use a modern luxury-neutral aesthetic:

Background: off-white / warm gray

Primary: deep charcoal / slate

Accent: muted gold or emerald

Font: Inter or similar clean sans-serif

🚫 No bright colors
🚫 No gradients
✅ Calm, premium, modern

📦 Inventory Rules (products.json)

Each product MUST include:

id

name

category

description

price

bottom_price (⚠️ hidden from UI, used only for haggle logic)

colors

rating

image

Inventory Rules (STRICT)

The AI MUST NEVER invent products

The AI MUST NEVER invent prices

products.json is the single source of truth

If it’s not in products.json, it does not exist.

🤖 AI Clerk – Core System Behavior

The AI Clerk must behave like a real shopkeeper:

Friendly, witty, human (not robotic)

Reads inventory via RAG before answering

Uses semantic understanding, not keyword matching

Decides when to call functions

NEVER directly edits UI

ONLY controls UI via function calls

Has confidence and boundaries

Has a spine in negotiation (refuses bad deals)

🚫 No-Menu Rule (HARD REQUIREMENT)

A user must be able to do everything via chat alone:

Discover products

Filter products

Add items to cart

Apply discounts

Proceed to checkout

Buttons may exist for UX,
but chat must fully work without them.

🧠 Required AI Capabilities
1️⃣ Semantic Search (RAG)

Example:

“I need an outfit for a summer wedding in Italy”

The AI must:

Understand context (summer, wedding, Italy)

Select appropriate products

Exclude irrelevant items

❌ Keyword matching is not acceptable.

2️⃣ Inventory Check

Example:

“Do you have this in blue?”

The AI must:

Check colors field

Answer truthfully

Never guess

3️⃣ Rich Product Responses

When AI shows products, it MUST include:

Product name

Price

Rating

Short description

Clickable link to product page

This is mandatory.

4️⃣ UI Control via Chat (CRITICAL)

The AI must call real functions that trigger visible UI changes, such as:

Sorting products by price

Filtering by category

Adding items to cart

Navigating to product pages

Applying coupon codes

🧠 Flow must be:

User message → AI decision → Function call → UI update


Text-only responses are NOT sufficient.

🎛️ Vibe Filter (MANDATORY)

Example:
User: “Show me cheaper options”

AI must:

Call a function to sort products by ascending price

Product grid must update immediately

No explaining.
No asking permission.
Just action.

🛒 Sales Agent Logic

The AI should:

Recommend related products

Use simple user interaction history

Feel helpful, not pushy

Act like a good salesperson, not a spam bot

💸 Haggle Mode (HIGH-SCORING FEATURE)

Each product has:

price

bottom_price (hidden)

Negotiation Rules

Good reason → meaningful discount

Neutral reason → small or no discount

Rude behavior → price increases

Below bottom_price → firm refusal

Examples

✔ “It’s my birthday”
✔ “I’m buying two”
❌ “Give discount idiot”

When a Deal Is Accepted

Generate a unique coupon code (e.g. BDAY-20)

Apply it via function calling

Update cart total live

The AI must refuse lowball offers politely but firmly.

🔌 OpenAI Function Calling (REQUIRED)

All AI actions must result in real function calls, such as:

addToCart(productId)

sortProducts(order)

filterCategory(category)

applyCoupon(code, discount)

navigateToProduct(productId)

❌ Text-only answers fail the project.

✅ Definition of “Done” (WINNING CONDITION)

The project is successful if:

Chat controls the website

Inventory is real and respected

Negotiation works logically

UI looks premium

AI feels human

The final experience should feel like:

“A real shopkeeper running a real store.”

END OF CONTEXT