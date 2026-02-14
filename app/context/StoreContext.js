'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import inventoryProducts from '@/data/products.json';

const StoreContext = createContext(undefined);

function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  const text = normalizeText(value);
  if (!text) return [];
  const tokens = text.split(' ');
  // Drop very short tokens (noise) but keep numbers (e.g., "20")
  return tokens.filter((t) => t.length >= 2 || /^\d+$/.test(t));
}

function buildProductSearchText(product) {
  const colors = Array.isArray(product?.colors) ? product.colors.join(' ') : product?.colors;
  return normalizeText(
    [product?.name, product?.description, product?.category, colors].filter(Boolean).join(' ')
  );
}

function scoreProduct({ product, queryTokens, queryText }) {
  if (!queryTokens.length) return 0;

  const name = normalizeText(product?.name);
  const category = normalizeText(product?.category);
  const description = normalizeText(product?.description);
  const colors = normalizeText(Array.isArray(product?.colors) ? product.colors.join(' ') : product?.colors);

  const haystackAll = [name, category, description, colors].filter(Boolean).join(' ');

  let score = 0;

  // Strong signal: exact/substring phrase match (esp. multi-word queries).
  if (queryText && queryText.length >= 3 && haystackAll.includes(queryText)) score += 8;
  if (queryText && queryText.length >= 3 && name.includes(queryText)) score += 10;

  // Token overlap with field weighting.
  for (const token of queryTokens) {
    if (!token) continue;

    if (name.includes(token)) score += 6;
    else if (category.includes(token)) score += 5;
    else if (colors.includes(token)) score += 4;
    else if (description.includes(token)) score += 3;

    // Slight boost for exact token boundary matches in the combined text.
    if (haystackAll.includes(` ${token} `) || haystackAll.startsWith(`${token} `) || haystackAll.endsWith(` ${token}`)) {
      score += 0.5;
    }
  }

  // Tie-breakers: prefer higher rating when relevance is similar.
  const rating = Number(product?.rating) || 0;
  score += Math.min(rating, 5) * 0.15;

  return score;
}

/**
 * Generate a unique coupon code based on reason type
 */
function generateCouponCode(reasonType, discountPercent) {
  const codeMap = {
    birthday: 'BDAY',
    multiple: 'DOUBLE',
    vip: 'VIP',
    student: 'STUDENT',
    first: 'FIRST',
    loyalty: 'LOYAL',
    special: 'SPECIAL',
    default: 'SAVE',
  };

  const prefix = codeMap[reasonType] || codeMap.default;
  const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${discountPercent}-${suffix}`;
}

/**
 * Evaluate discount request and determine negotiation outcome
 * Returns: { approved: boolean, discountPercent: number, reason: string, couponCode: string | null }
 */
function evaluateDiscountRequest(request, product, cartItems) {
  const requestLower = normalizeText(request);
  const tokens = tokenize(requestLower);

  // Check for rude/lowball indicators
  const rudeKeywords = ['idiot', 'stupid', 'ripoff', 'overpriced', 'cheap', 'garbage', 'trash'];
  const lowballPatterns = [
    /\$\d+\s*(only|just|max)/i,
    /half\s*price/i,
    /50\s*percent/i,
    /free/i,
  ];

  const isRude = rudeKeywords.some((keyword) => requestLower.includes(keyword));
  const isLowball = lowballPatterns.some((pattern) => pattern.test(request));

  // Check for good reasons
  const goodReasons = {
    birthday: ['birthday', 'bday', 'born', 'turning'],
    multiple: ['two', 'three', 'multiple', 'buying', 'several', 'both'],
    vip: ['vip', 'regular', 'customer', 'loyal'],
    student: ['student', 'college', 'university', 'school'],
    first: ['first', 'new', 'first time'],
    loyalty: ['loyal', 'repeat', 'always', 'often'],
  };

  let reasonType = 'default';
  let reasonScore = 0;

  // Score the request
  for (const [type, keywords] of Object.entries(goodReasons)) {
    const matches = keywords.filter((kw) => requestLower.includes(kw)).length;
    if (matches > reasonScore) {
      reasonScore = matches;
      reasonType = type;
    }
  }

  // Calculate discount based on reason quality
  let discountPercent = 0;
  let approved = false;
  let reason = '';

  if (isRude) {
    // Rude behavior: refuse or increase price
    approved = false;
    reason = 'rude_behavior';
    discountPercent = 0;
  } else if (isLowball) {
    // Lowball offer: refuse politely
    approved = false;
    reason = 'lowball_offer';
    discountPercent = 0;
  } else if (reasonScore >= 2 || reasonType === 'birthday' || reasonType === 'multiple') {
    // Good reason: meaningful discount (15-25%)
    discountPercent = Math.floor(Math.random() * 11) + 15; // 15-25%
    approved = true;
    reason = reasonType;
  } else if (reasonScore === 1) {
    // Neutral reason: small discount (5-10%)
    discountPercent = Math.floor(Math.random() * 6) + 5; // 5-10%
    approved = true;
    reason = reasonType;
  } else {
    // No good reason: no discount
    approved = false;
    reason = 'no_reason';
    discountPercent = 0;
  }

  // Check if discount would go below bottom_price
  if (approved && product) {
    const currentPrice = parseFloat(product.price) || 0;
    const bottomPrice = parseFloat(product.bottom_price) || 0;
    const discountedPrice = currentPrice * (1 - discountPercent / 100);

    if (discountedPrice < bottomPrice) {
      // Adjust discount to not go below bottom_price
      const maxDiscount = Math.floor(((currentPrice - bottomPrice) / currentPrice) * 100);
      if (maxDiscount > 0) {
        discountPercent = Math.min(discountPercent, maxDiscount);
        approved = discountPercent > 0;
      } else {
        approved = false;
        reason = 'below_bottom_price';
        discountPercent = 0;
      }
    }
  }

  // Generate coupon code if approved
  const couponCode = approved ? generateCouponCode(reasonType, discountPercent) : null;

  return {
    approved,
    discountPercent,
    reason,
    couponCode,
  };
}

export function StoreProvider({ children }) {
  // Product UI State
  const initialInventory = Array.isArray(inventoryProducts) ? inventoryProducts : [];
  const [products, setProducts] = useState(initialInventory);
  const [visibleProducts, setVisibleProducts] = useState(initialInventory);
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  // Cart State
  const [cartItems, setCartItems] = useState([]);

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Haggle/Negotiation State
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [generatedCouponCodes, setGeneratedCouponCodes] = useState(new Set());

  // Navigation State
  const [currentPage, setCurrentPage] = useState('home');
  const [currentProductId, setCurrentProductId] = useState(null);

  // Product UI Functions
  const updateProducts = useCallback((productsArray) => {
    setProducts(productsArray);
    setVisibleProducts(productsArray);
    setActiveCategory(null);
    setSortOrder(null);
  }, []);

  // AI-callable function: Sort products by price
  const sortProducts = useCallback((order) => {
    if (order !== 'asc' && order !== 'desc') {
      return { success: false, error: 'Invalid sort order. Must be "asc" or "desc"' };
    }

    setSortOrder(order);
    setVisibleProducts((prev) => {
      // Create a new array to avoid mutation
      const sorted = [...prev].sort((a, b) => {
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;
        return order === 'asc' ? priceA - priceB : priceB - priceA;
      });
      return sorted;
    });

    const orderText = order === 'asc' ? 'lowest to highest' : 'highest to lowest';
    // Get count from current visibleProducts length
    return { success: true, message: `Products sorted by price (${orderText})` };
  }, []);

  // AI-callable function: Filter products by category
  const filterCategory = useCallback((category) => {
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

    setActiveCategory(normalizedCategory);
    
    // Create a new array copy before sorting to avoid mutation
    let result = [...filtered];
    // Apply current sort order if exists
    if (sortOrder) {
      result = result.sort((a, b) => {
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }
    
    // Update state with new array reference
    setVisibleProducts([...result]);
    return { success: true, category: normalizedCategory, count: result.length, products: result };
  }, [products, sortOrder]);

  const resetFilters = useCallback(() => {
    setActiveCategory(null);
    setSortOrder(null);
    // Create new array reference to trigger re-render
    setVisibleProducts([...products]);
  }, [products]);

  // AI-callable function: Semantic search for products
  const searchProducts = useCallback(
    (query) => {
      if (!query || typeof query !== 'string') {
        return { success: false, error: 'Invalid search query' };
      }

      const queryText = normalizeText(query);
      const queryTokens = tokenize(queryText);

      if (!queryText || queryTokens.length === 0) {
        // Reset to all products - create new array reference
        setVisibleProducts(() => [...products]);
        return { success: true, query: '', count: products.length, products };
      }

      // Create new arrays to avoid mutation
      const scored = products
        .map((product) => ({
          product,
          score: scoreProduct({ product, queryTokens, queryText }),
          searchText: buildProductSearchText(product),
        }))
        .filter((x) => x.score > 0 || (queryText.length >= 3 && x.searchText.includes(queryText)))
        .sort((a, b) => b.score - a.score);

      const results = scored.slice(0, 8).map((x) => x.product);
      // Create new array reference for state update
      setVisibleProducts(() => [...results]);
      
      return {
        success: true,
        query: queryText,
        count: results.length,
        products: results,
        message: `Found ${results.length} product${results.length !== 1 ? 's' : ''} matching "${query}"`,
      };
    },
    [products]
  );

  // Cart Functions (internal - accepts product object)
  const addToCartInternal = useCallback((product) => {
    if (!product || !product.id) {
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  // AI-callable function: Add product to cart by ID
  const addToCart = useCallback((productId) => {
    if (!productId || typeof productId !== 'number') {
      return { success: false, error: 'Invalid product ID' };
    }

    const product = products.find((p) => p.id === productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    addToCartInternal(product);
    return { success: true, product, message: `Added ${product.name} to cart` };
  }, [products, addToCartInternal]);

  // AI-callable function: Remove product from cart by ID
  const removeFromCart = useCallback((productId) => {
    if (!productId || typeof productId !== 'number') {
      return { success: false, error: 'Invalid product ID' };
    }

    // Use functional update to avoid stale closure
    let removedProduct = null;
    setCartItems((prev) => {
      const cartItem = prev.find((item) => item.product.id === productId);
      if (!cartItem) {
        return prev; // Keep current state if not found
      }
      removedProduct = cartItem.product;
      // Create new array without the item
      return prev.filter((item) => item.product.id !== productId);
    });

    if (!removedProduct) {
      return { success: false, error: 'Product not in cart' };
    }

    return { success: true, product: removedProduct, message: `Removed ${removedProduct.name} from cart` };
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // AI-callable function: Apply coupon code
  const applyCoupon = useCallback((code, discountPercent) => {
    if (!code || typeof code !== 'string') {
      return { success: false, error: 'Invalid coupon code' };
    }

    if (typeof discountPercent !== 'number' || discountPercent < 0 || discountPercent > 100) {
      return { success: false, error: 'Invalid discount percentage. Must be between 0 and 100' };
    }

    setAppliedCoupon({
      code: code.toUpperCase(),
      discountPercent,
    });

    return {
      success: true,
      coupon: { code: code.toUpperCase(), discountPercent },
      message: `Coupon ${code.toUpperCase()} applied: ${discountPercent}% off`,
    };
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  // AI-callable function: Negotiate discount (Haggle Mode)
  const negotiateDiscount = useCallback(
    (request, productId = null) => {
      if (!request || typeof request !== 'string') {
        return {
          success: false,
          error: 'Invalid negotiation request',
          approved: false,
        };
      }

      // Determine which product to negotiate for
      let product = null;
      if (productId) {
        product = products.find((p) => p.id === productId);
      } else if (cartItems.length > 0) {
        // If no productId, use first cart item
        product = cartItems[0].product;
      } else if (currentProductId) {
        // Use current product if viewing details
        product = products.find((p) => p.id === currentProductId);
      }

      if (!product) {
        return {
          success: false,
          error: 'No product specified for negotiation',
          approved: false,
        };
      }

      // Evaluate the discount request
      const negotiation = evaluateDiscountRequest(request, product, cartItems);

      // Log negotiation history
      const negotiationRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        request,
        productId: product.id,
        productName: product.name,
        approved: negotiation.approved,
        discountPercent: negotiation.discountPercent,
        reason: negotiation.reason,
        couponCode: negotiation.couponCode,
      };

      setNegotiationHistory((prev) => [...prev, negotiationRecord]);

      if (negotiation.approved && negotiation.couponCode) {
        // Apply coupon immediately if approved - use functional update
        setGeneratedCouponCodes((prev) => {
          const newSet = new Set(prev);
          newSet.add(negotiation.couponCode);
          return newSet;
        });
        setAppliedCoupon({
          code: negotiation.couponCode,
          discountPercent: negotiation.discountPercent,
        });

        return {
          success: true,
          approved: true,
          discountPercent: negotiation.discountPercent,
          couponCode: negotiation.couponCode,
          product: {
            id: product.id,
            name: product.name,
            originalPrice: product.price,
            discountedPrice: product.price * (1 - negotiation.discountPercent / 100),
          },
          message: `Great! I've approved a ${negotiation.discountPercent}% discount. Your coupon code ${negotiation.couponCode} has been applied to your cart.`,
        };
      } else {
        // Negotiation refused
        let refusalMessage = '';
        switch (negotiation.reason) {
          case 'rude_behavior':
            refusalMessage =
              "I appreciate your interest, but I can't offer a discount at this time. Is there something specific you'd like to know about the product?";
            break;
          case 'lowball_offer':
            refusalMessage = `I understand you're looking for a deal, but I can't go that low. The best I can do is respect our pricing. Would you like to see similar products at different price points?`;
            break;
          case 'below_bottom_price':
            refusalMessage = `I'm sorry, but I can't go below our minimum price for this item. The current price is already competitive.`;
            break;
          default:
            refusalMessage = `I appreciate your interest, but I can't offer a discount right now. However, I'd be happy to help you find something that fits your budget!`;
        }

        return {
          success: true,
          approved: false,
          discountPercent: 0,
          reason: negotiation.reason,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
          },
          message: refusalMessage,
        };
      }
    },
    [products, cartItems, currentProductId]
  );

  // Navigation Functions
  const navigateTo = useCallback((page, productId = null) => {
    const validPages = ['home', 'products', 'product', 'cart', 'checkout'];
    
    if (!validPages.includes(page)) {
      return;
    }

    setCurrentPage(page);
    setCurrentProductId(productId);

    // Handle route navigation for Next.js
    if (typeof window !== 'undefined') {
      if (page === 'home') {
        window.history.pushState({}, '', '/');
      } else if (page === 'products') {
        window.history.pushState({}, '', '/products');
      } else if (page === 'cart') {
        window.history.pushState({}, '', '/cart');
      } else if (page === 'checkout') {
        window.history.pushState({}, '', '/checkout');
      } else if (page === 'product' && productId) {
        // Product detail stays as modal, no route change
      }
    }
  }, []);

  // AI-callable function: Navigate to product detail page
  const navigateToProduct = useCallback((productId) => {
    if (!productId || typeof productId !== 'number') {
      return { success: false, error: 'Invalid product ID' };
    }

    const product = products.find((p) => p.id === productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Update navigation state immediately
    setCurrentPage('product');
    setCurrentProductId(productId);
    
    // Also call navigateTo for URL updates
    navigateTo('product', productId);
    return { success: true, product };
  }, [products, navigateTo]);

  // Cart Total Calculation (with coupon)
  const cartTotal = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product.price) || 0;
      return sum + price * item.quantity;
    }, 0);

    if (appliedCoupon && appliedCoupon.discountPercent > 0) {
      const discount = subtotal * (appliedCoupon.discountPercent / 100);
      return {
        subtotal,
        discount,
        total: subtotal - discount,
        coupon: appliedCoupon,
      };
    }

    return {
      subtotal,
      discount: 0,
      total: subtotal,
      coupon: null,
    };
  }, [cartItems, appliedCoupon]);

  // Cart Item Count
  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const value = {
    // Product UI State
    products,
    visibleProducts,
    activeCategory,
    sortOrder,
    setProducts: updateProducts,
    sortProducts,
    filterCategory,
    resetFilters,
    searchProducts,

    // Cart State
    cartItems,
    cartTotal,
    cartItemCount,
    addToCart,
    removeFromCart,
    clearCart,

    // Coupon State
    appliedCoupon,
    applyCoupon,
    removeCoupon,

    // Haggle/Negotiation State
    negotiationHistory,
    negotiateDiscount,

    // Navigation State
    currentPage,
    currentProductId,
    navigateTo,
    navigateToProduct,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  
  return context;
}

/**
 * Execute a function call from OpenAI API route
 * This helper can be called client-side to execute function calls returned from the API
 */
export function createFunctionExecutor(storeContext) {
  return {
    addToCart: (productId) => storeContext.addToCart(productId),
    removeFromCart: (productId) => storeContext.removeFromCart(productId),
    sortProducts: (order) => storeContext.sortProducts(order),
    filterCategory: (category) => storeContext.filterCategory(category),
    navigateToProduct: (productId) => storeContext.navigateToProduct(productId),
    applyCoupon: (code, discountPercent) => storeContext.applyCoupon(code, discountPercent),
    searchProducts: (query) => storeContext.searchProducts(query),
    negotiateDiscount: (request, productId) => storeContext.negotiateDiscount(request, productId),
  };
}
