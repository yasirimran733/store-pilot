/**
 * Store Actions - Function handlers for OpenAI function calling
 * These functions can be called from the API route and work with store state
 */

import inventoryProducts from '@/data/products.json';

/**
 * Normalize text for search
 */
function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenize search query
 */
function tokenize(value) {
  const text = normalizeText(value);
  if (!text) return [];
  const tokens = text.split(' ');
  return tokens.filter((t) => t.length >= 2 || /^\d+$/.test(t));
}

/**
 * Build searchable text from product
 */
function buildProductSearchText(product) {
  const colors = Array.isArray(product?.colors) ? product.colors.join(' ') : product?.colors;
  return normalizeText(
    [product?.name, product?.description, product?.category, colors].filter(Boolean).join(' ')
  );
}

/**
 * Score product relevance for search
 */
function scoreProduct({ product, queryTokens, queryText }) {
  if (!queryTokens.length) return 0;

  const name = normalizeText(product?.name);
  const category = normalizeText(product?.category);
  const description = normalizeText(product?.description);
  const colors = normalizeText(Array.isArray(product?.colors) ? product.colors.join(' ') : product?.colors);

  const haystackAll = [name, category, description, colors].filter(Boolean).join(' ');

  let score = 0;

  if (queryText && queryText.length >= 3 && haystackAll.includes(queryText)) score += 8;
  if (queryText && queryText.length >= 3 && name.includes(queryText)) score += 10;

  for (const token of queryTokens) {
    if (!token) continue;

    if (name.includes(token)) score += 6;
    else if (category.includes(token)) score += 5;
    else if (colors.includes(token)) score += 4;
    else if (description.includes(token)) score += 3;

    if (
      haystackAll.includes(` ${token} `) ||
      haystackAll.startsWith(`${token} `) ||
      haystackAll.endsWith(` ${token}`)
    ) {
      score += 0.5;
    }
  }

  const rating = Number(product?.rating) || 0;
  score += Math.min(rating, 5) * 0.15;

  return score;
}

/**
 * Create store action handlers
 * These functions work with the store state and can be called from API routes
 */
export function createStoreActions(storeState) {
  const products = storeState?.products || inventoryProducts;

  return {
    /**
     * Add product to cart by ID
     * CRITICAL: This function validates the product exists before returning success
     */
    addToCart: (productId) => {
      if (!productId || typeof productId !== 'number') {
        return { success: false, error: 'Invalid product ID. Product ID must be a number.' };
      }

      const product = products.find((p) => p.id === productId);
      if (!product) {
        return { 
          success: false, 
          error: `Product with ID ${productId} not found in inventory. Please use searchProducts() first to find the correct product ID.`,
          productId,
        };
      }

      // Return instruction for client to execute with product details for verification
      return {
        success: true,
        action: 'addToCart',
        productId,
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
        },
        message: `Ready to add ${product.name} (ID: ${product.id}, Category: ${product.category}) to cart`,
      };
    },

    /**
     * Remove product from cart by ID
     */
    removeFromCart: (productId) => {
      if (!productId || typeof productId !== 'number') {
        return { success: false, error: 'Invalid product ID' };
      }

      const product = products.find((p) => p.id === productId);
      if (!product) {
        return { success: false, error: 'Product not found' };
      }

      return {
        success: true,
        action: 'removeFromCart',
        productId,
        product,
        message: `Removed ${product.name} from cart`,
      };
    },

    /**
     * Sort products by price
     */
    sortProducts: (order) => {
      if (order !== 'asc' && order !== 'desc') {
        return { success: false, error: 'Invalid sort order. Must be "asc" or "desc"' };
      }

      const orderText = order === 'asc' ? 'lowest to highest' : 'highest to lowest';
      return {
        success: true,
        action: 'sortProducts',
        order,
        message: `Products sorted by price (${orderText})`,
      };
    },

    /**
     * Filter products by category
     */
    filterCategory: (category) => {
      if (!category || typeof category !== 'string') {
        return { success: false, error: 'Invalid category' };
      }

      const normalizedCategory = category.toLowerCase().trim();
      const filtered = products.filter((product) => 
        product.category?.toLowerCase() === normalizedCategory
      );

      if (filtered.length === 0) {
        return { success: false, error: `No products found in category "${category}"` };
      }

      return {
        success: true,
        action: 'filterCategory',
        category: normalizedCategory,
        count: filtered.length,
        products: filtered,
        message: `Found ${filtered.length} product${filtered.length !== 1 ? 's' : ''} in ${normalizedCategory}`,
      };
    },

    /**
     * Navigate to product detail page
     */
    navigateToProduct: (productId) => {
      if (!productId || typeof productId !== 'number') {
        return { success: false, error: 'Invalid product ID' };
      }

      const product = products.find((p) => p.id === productId);
      if (!product) {
        return { success: false, error: 'Product not found' };
      }

      return {
        success: true,
        action: 'navigateToProduct',
        productId,
        product,
        message: `Navigating to ${product.name}`,
      };
    },

    /**
     * Apply coupon code
     */
    applyCoupon: (code, discountPercent) => {
      if (!code || typeof code !== 'string') {
        return { success: false, error: 'Invalid coupon code' };
      }

      if (typeof discountPercent !== 'number' || discountPercent < 0 || discountPercent > 100) {
        return { success: false, error: 'Invalid discount percentage. Must be between 0 and 100' };
      }

      return {
        success: true,
        action: 'applyCoupon',
        code: code.toUpperCase(),
        discountPercent,
        message: `Coupon ${code.toUpperCase()} applied: ${discountPercent}% off`,
      };
    },

    /**
     * Search products semantically
     */
    searchProducts: (query) => {
      if (!query || typeof query !== 'string') {
        return { success: false, error: 'Invalid search query' };
      }

      const queryText = normalizeText(query);
      const queryTokens = tokenize(queryText);

      if (!queryText || queryTokens.length === 0) {
        return {
          success: true,
          action: 'searchProducts',
          query: '',
          count: products.length,
          products,
          message: `Showing all ${products.length} products`,
        };
      }

      const scored = products
        .map((product) => ({
          product,
          score: scoreProduct({ product, queryTokens, queryText }),
          searchText: buildProductSearchText(product),
        }))
        .filter((x) => x.score > 0 || (queryText.length >= 3 && x.searchText.includes(queryText)))
        .sort((a, b) => b.score - a.score);

      const results = scored.slice(0, 8).map((x) => x.product);

      return {
        success: true,
        action: 'searchProducts',
        query: queryText,
        count: results.length,
        products: results,
        message: `Found ${results.length} product${results.length !== 1 ? 's' : ''} matching "${query}"`,
      };
    },

    /**
     * Negotiate discount (Haggle Mode)
     */
    negotiateDiscount: (request, productId = null) => {
      if (!request || typeof request !== 'string') {
        return { success: false, error: 'Invalid negotiation request' };
      }

      // This will be handled client-side via StoreContext
      // Return instruction for client to execute
      return {
        success: true,
        action: 'negotiateDiscount',
        request,
        productId,
        message: 'Negotiation request received',
      };
    },

    /**
     * Recommend products based on user activity
     */
    recommendProducts: () => {
      // This will be handled client-side via StoreContext
      return {
        success: true,
        action: 'recommendProducts',
        message: 'Recommendations generated',
      };
    },
  };
}

/**
 * Execute a function call from OpenAI
 * Returns the result that should be sent back to OpenAI
 */
export function executeFunctionCall(functionName, args, storeState) {
  const actions = createStoreActions(storeState);

  if (!actions[functionName]) {
    return {
      success: false,
      error: `Unknown function: ${functionName}`,
    };
  }

  try {
    return actions[functionName](...Object.values(args || {}));
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Function execution failed',
    };
  }
}
