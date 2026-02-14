/**
 * OpenAI client for Store Pilot
 * Uses official OpenAI SDK for function calling support
 */

import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get OpenAI function definitions for Store Pilot
 * These functions allow the AI to control the UI via function calling
 */
export function getStoreFunctions() {
  return [
    {
      name: 'addToCart',
      description: 'Add a product to the shopping cart by product ID. Use this when the user wants to purchase or add an item to their cart.',
      parameters: {
        type: 'object',
        properties: {
          productId: {
            type: 'number',
            description: 'The unique ID of the product to add to cart',
          },
        },
        required: ['productId'],
      },
    },
    {
      name: 'removeFromCart',
      description: 'Remove a product from the shopping cart by product ID. Use this when the user wants to remove an item from their cart.',
      parameters: {
        type: 'object',
        properties: {
          productId: {
            type: 'number',
            description: 'The unique ID of the product to remove from cart',
          },
        },
        required: ['productId'],
      },
    },
    {
      name: 'sortProducts',
      description: 'Sort visible products by price. Use this when the user asks to see cheaper/more expensive options, or to sort by price.',
      parameters: {
        type: 'object',
        properties: {
          order: {
            type: 'string',
            enum: ['asc', 'desc'],
            description: 'Sort order: "asc" for cheapest first (ascending), "desc" for most expensive first (descending)',
          },
        },
        required: ['order'],
      },
    },
    {
      name: 'filterCategory',
      description: 'Filter products by category. Use this when the user wants to see products from a specific category like "clothing", "bags", "footwear", "accessories".',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'The category name to filter by (e.g., "clothing", "bags", "footwear", "accessories")',
          },
        },
        required: ['category'],
      },
    },
    {
      name: 'navigateToProduct',
      description: 'Navigate to a specific product detail page. Use this when the user wants to see details about a specific product.',
      parameters: {
        type: 'object',
        properties: {
          productId: {
            type: 'number',
            description: 'The unique ID of the product to view',
          },
        },
        required: ['productId'],
      },
    },
    {
      name: 'applyCoupon',
      description: 'Apply a coupon code with a discount percentage to the cart. Use this when the user has a coupon code or when a discount has been negotiated.',
      parameters: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'The coupon code (e.g., "BDAY-20", "SUMMER-15")',
          },
          discountPercent: {
            type: 'number',
            description: 'The discount percentage (0-100)',
            minimum: 0,
            maximum: 100,
          },
        },
        required: ['code', 'discountPercent'],
      },
    },
    {
      name: 'searchProducts',
      description: 'Search for products using semantic search. Use this when the user is looking for specific products, styles, occasions, or features. This performs intelligent search across product names, descriptions, categories, and colors.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query describing what the user is looking for (e.g., "summer wedding outfit", "leather bag", "blue shirt", "formal shoes")',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'negotiateDiscount',
      description: 'Negotiate a discount with the customer (Haggle Mode). Use this when the user asks for a discount, lower price, or mentions reasons like birthday, buying multiple items, being a student, etc. The function evaluates the request and either approves a discount (generating a coupon code) or politely refuses. Good reasons get meaningful discounts (15-25%), neutral reasons get small discounts (5-10%), rude requests are refused.',
      parameters: {
        type: 'object',
        properties: {
          request: {
            type: 'string',
            description: 'The customer\'s discount request or reason (e.g., "It\'s my birthday", "I\'m buying two", "Can you give me a discount?", "I\'m a student")',
          },
          productId: {
            type: 'number',
            description: 'Optional: The product ID to negotiate for. If not provided, uses the current product or first cart item.',
          },
        },
        required: ['request'],
      },
    },
  ];
}

/**
 * System prompt for the AI Clerk
 */
export function getSystemPrompt() {
  return `You are a friendly, confident AI shopkeeper running Store Pilot, a premium e-commerce store.

Your role:
- Be helpful, witty, and human-like (not robotic)
- Understand user intent semantically, not just keywords
- Always check inventory truthfully - never invent products or prices
- Control the website UI through function calls, not just text responses
- Be confident but polite in negotiations
- Refuse unreasonable deals firmly but respectfully

Rules:
- NEVER invent products or prices - only use what exists in inventory
- ALWAYS call functions to control the UI (sorting, filtering, adding to cart, navigation)
- When showing products, include: name, price, rating, short description
- Use searchProducts() for semantic queries like "summer wedding outfit"
- Use filterCategory() for category-based browsing
- Use sortProducts() when users ask for cheaper/more expensive options
- Navigate to product pages with navigateToProduct() when users want details

Haggle Mode (Negotiation):
- When customers ask for discounts, use negotiateDiscount(request, productId)
- Good reasons (birthday, buying multiple, student, VIP) → meaningful discounts (15-25%)
- Neutral reasons → small discounts (5-10%)
- Rude requests or lowball offers → politely refuse
- The function automatically generates unique coupon codes and applies them
- Be confident but fair - you have a spine and won't accept unreasonable deals
- If a discount is approved, the coupon is automatically applied to the cart

Remember: You control the store. Act like a real shopkeeper who can actually change what customers see.`;
}
