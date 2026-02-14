'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import inventoryProducts from '@/data/products.json';

const StoreContext = createContext(undefined);

const CART_STORAGE_KEY = 'store-pilot-cart';
const COUPON_STORAGE_KEY = 'store-pilot-coupon';

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
    penalty: 'PENALTY', // For rude behavior price increases
    default: 'SAVE',
  };

  const prefix = codeMap[reasonType] || codeMap.default;
  const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const value = Math.abs(discountPercent); // Use absolute value for code
  return `${prefix}-${value}-${suffix}`;
}

/**
 * Evaluate discount request and determine negotiation outcome
 * Returns: { approved: boolean, discountPercent: number, reason: string, couponCode: string | null }
 */
function evaluateDiscountRequest(request, product, cartItems) {
  const requestLower = normalizeText(request);
  const tokens = tokenize(requestLower);

  // Check for rude/lowball indicators
  // Comprehensive list of abusive, uncivilized, and unethical words/phrases
  // If ANY of these are detected, the request is considered rude and gets penalty
  const rudeKeywords = [
    // Direct insults and profanity
    'idiot', 'idot', 'idiot', 'idit', 'id10t',
    'stupid', 'stuped', 'stupidest',
    'dumb', 'dumbass', 'dumba',
    'moron', 'moronic',
    'fool', 'foolish',
    'retard', 'retarded',
    'asshole', 'ass', 'a-hole',
    'bastard', 'basterd',
    'bitch', 'biatch',
    'damn', 'damned',
    'hell', 'hellish',
    'crap', 'crappy',
    'shit', 'shity', 'shitty',
    'fuck', 'fucking', 'fucked', 'fucker',
    'piss', 'pissed',
    'screw', 'screwed',
    'suck', 'sucks', 'sucker',
    
    // Abusive language
    'hate', 'hated', 'hating',
    'kill', 'killing',
    'die', 'dying', 'death',
    'worthless', 'worthless',
    'useless', 'useless',
    'pathetic', 'pathet',
    'disgusting', 'disgust',
    'horrible', 'horrible',
    'terrible', 'terrible',
    'awful', 'awfull',
    'crap', 'crappy',
    'garbage', 'garbag',
    'trash', 'tras',
    'junk', 'junky',
    'scam', 'scammer', 'scamming',
    'fraud', 'fraudulent',
    'cheat', 'cheating', 'cheater',
    'liar', 'lying', 'lie',
    'thief', 'steal', 'stealing',
    'rob', 'robbing', 'robber',
    
    // Aggressive/Threatening language
    'sue', 'suing', 'lawsuit',
    'legal', 'lawyer',
    'report', 'reporting',
    'complaint', 'complain',
    'refund', 'refunding',
    'cancel', 'cancelling',
    'return', 'returning',
    'demand', 'demanding',
    'threat', 'threatening',
    'angry', 'anger', 'angry',
    'mad', 'madness',
    'furious', 'fury',
    'rage', 'raging',
    
    // Disrespectful/Uncivilized language
    'shut up', 'shutup',
    'shut your', 'shut ur',
    'shut the',
    'go away', 'goaway',
    'leave me', 'leave',
    'stop', 'stopping',
    'enough', 'enough already',
    'annoying', 'annoy',
    'irritating', 'irritate',
    'bother', 'bothering',
    'nonsense', 'nonsens',
    'ridiculous', 'ridicul',
    'absurd', 'absurdity',
    'crazy', 'craz',
    'insane', 'insanity',
    
    // Price-related abuse
    'ripoff', 'rip off', 'ripoff',
    'overpriced', 'over priced', 'overprice',
    'expensive', 'expensiv',
    'cheap', 'cheaply',
    'free', 'freely',
    'waste', 'wasting', 'wasted',
    'money', 'monies',
    'expensive', 'expensiv',
    
    // Unethical/Unprofessional language
    'unethical', 'unethic',
    'unprofessional', 'unprofession',
    'dishonest', 'dishonesty',
    'corrupt', 'corruption',
    'greedy', 'greed',
    'selfish', 'selfishness',
    'rude', 'rudeness',
    'impolite', 'impolit',
    'disrespectful', 'disrespect',
    'offensive', 'offend',
    'insult', 'insulting',
    'mock', 'mocking',
    'mockery',
    
    // Common misspellings/variations
    'fuk', 'fuking', 'fuked',
    'shyt', 'shyte',
    'damm', 'dam',
    'hel', 'hel',
    'crap', 'crap',
    'sux', 'suxx',
    'suk', 'sukk',
  ];
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
  // IMPORTANT: Rude behavior ALWAYS overrides good reasons
  let discountPercent = 0;
  let approved = false;
  let reason = '';
  let priceIncreasePercent = 0; // For rude behavior

  // Rude behavior check MUST come FIRST - it overrides everything
  if (isRude) {
    // Rude/abusive/uncivilized behavior: raise price (penalty)
    // NO discount regardless of good reasons (birthday, multiple items, etc.)
    approved = false;
    reason = 'rude_behavior';
    discountPercent = 0;
    // Generate price increase penalty (10-20%)
    priceIncreasePercent = Math.floor(Math.random() * 11) + 10; // 10-20% increase
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
  
  // Generate penalty coupon code for rude behavior (price increase)
  const penaltyCouponCode = isRude && priceIncreasePercent > 0 
    ? generateCouponCode('penalty', priceIncreasePercent) 
    : null;

  return {
    approved,
    discountPercent,
    priceIncreasePercent, // Add price increase for rude behavior
    reason,
    couponCode,
    penaltyCouponCode, // Penalty coupon that increases price
  };
}

export function StoreProvider({ children }) {
  // Product UI State
  const initialInventory = Array.isArray(inventoryProducts) ? inventoryProducts : [];
  const [products, setProducts] = useState(initialInventory);
  const [visibleProducts, setVisibleProducts] = useState(initialInventory);
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  // Cart State (hydrated from localStorage in useEffect)
  const [cartItems, setCartItems] = useState([]);

  // Coupon State (hydrated from localStorage in useEffect)
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Hydrate cart and coupon from localStorage once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (rawCart) {
        const parsed = JSON.parse(rawCart);
        if (Array.isArray(parsed) && parsed.length > 0 && initialInventory.length > 0) {
          const rehydrated = parsed
            .map(({ productId, quantity }) => {
              const product = initialInventory.find((p) => p.id === productId);
              return product && quantity > 0 ? { product: { ...product }, quantity } : null;
            })
            .filter(Boolean);
          if (rehydrated.length > 0) setCartItems(rehydrated);
        }
      }
      const rawCoupon = window.localStorage.getItem(COUPON_STORAGE_KEY);
      if (rawCoupon) {
        const coupon = JSON.parse(rawCoupon);
        if (coupon && typeof coupon.code === 'string' && typeof coupon.discountPercent === 'number') {
          setAppliedCoupon({ code: coupon.code, discountPercent: coupon.discountPercent });
        }
      }
    } catch (_) {
      // ignore parse errors
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount; initialInventory is static

  // Persist cart and coupon to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const toStore = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(toStore));
    } catch (_) {}
  }, [cartItems]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (appliedCoupon) {
        window.localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify({
          code: appliedCoupon.code,
          discountPercent: appliedCoupon.discountPercent,
        }));
      } else {
        window.localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (_) {}
  }, [appliedCoupon]);

  // Haggle/Negotiation State
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [generatedCouponCodes, setGeneratedCouponCodes] = useState(new Set());

  // Navigation State
  const [currentPage, setCurrentPage] = useState('home');
  const [currentProductId, setCurrentProductId] = useState(null);

  // User Activity Tracking (for recommendations)
  const [userActivity, setUserActivity] = useState({
    viewed: [],
    searched: [],
    addedToCart: [],
  });

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

    // Update sort order state first
    setSortOrder(order);
    
    // Force re-render by creating new array reference
    setVisibleProducts((prev) => {
      // Create a completely new array to ensure React detects the change
      const newArray = [...prev];
      newArray.sort((a, b) => {
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;
        return order === 'asc' ? priceA - priceB : priceB - priceA;
      });
      // Return new array reference
      return newArray;
    });

    const orderText = order === 'asc' ? 'lowest to highest' : 'highest to lowest';
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

    // Use functional update to ensure we always work with latest state
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        // Create new array with updated quantity
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : { ...item } // Create new object reference for other items too
        );
      }
      
      // Add new item - create new array reference
      return [...prev, { product: { ...product }, quantity: 1 }];
    });
  }, []);

  // Helper function: Find product by name (fuzzy matching)
  const findProductByName = useCallback((productName) => {
    if (!productName || typeof productName !== 'string') {
      return null;
    }

    const searchTerm = normalizeText(productName);
    const searchTokens = tokenize(searchTerm);

    // Try exact match first
    let product = products.find((p) => 
      normalizeText(p.name).includes(searchTerm) || 
      normalizeText(p.name) === searchTerm
    );

    if (product) return product;

    // Try fuzzy match with tokens
    const scored = products.map((p) => {
      const productNameLower = normalizeText(p.name);
      const productDescLower = normalizeText(p.description || '');
      const productCategoryLower = normalizeText(p.category || '');
      
      let score = 0;
      for (const token of searchTokens) {
        if (productNameLower.includes(token)) score += 10;
        else if (productCategoryLower.includes(token)) score += 5;
        else if (productDescLower.includes(token)) score += 3;
      }
      
      return { product: p, score };
    }).filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.length > 0 ? scored[0].product : null;
  }, [products]);

  // AI-callable function: Add product to cart by ID
  // CRITICAL: AI should always search first, then use the product ID from search results
  const addToCart = useCallback((productId) => {
    if (!productId || typeof productId !== 'number') {
      return { success: false, error: 'Invalid product ID. Please search for products first using searchProducts().' };
    }

    const product = products.find((p) => p.id === productId);
    if (!product) {
      return { 
        success: false, 
        error: `Product with ID ${productId} not found. Please search for products first using searchProducts() to get the correct product ID.` 
      };
    }

    addToCartInternal(product);
    
    // Track cart addition for recommendations
    setUserActivity((prev) => ({
      ...prev,
      addedToCart: [...prev.addedToCart.filter((id) => id !== productId), productId].slice(-10),
    }));
    
    return { 
      success: true, 
      product, 
      message: `Added ${product.name} (ID: ${product.id}, Category: ${product.category}) to cart` 
    };
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
      } else if (negotiation.reason === 'rude_behavior' && negotiation.priceIncreasePercent > 0) {
        // Rude behavior: Apply price increase penalty
        const priceIncrease = negotiation.priceIncreasePercent;
        const increasedPrice = product.price * (1 + priceIncrease / 100);
        
        // Apply penalty coupon (negative discount = price increase)
        const penaltyCoupon = {
          code: negotiation.penaltyCouponCode || `PENALTY-${priceIncrease}`,
          discountPercent: -priceIncrease, // Negative = price increase
          isPenalty: true,
        };
        
        setGeneratedCouponCodes((prev) => {
          const newSet = new Set(prev);
          if (negotiation.penaltyCouponCode) {
            newSet.add(negotiation.penaltyCouponCode);
          }
          return newSet;
        });
        setAppliedCoupon(penaltyCoupon);

        return {
          success: true,
          approved: false,
          discountPercent: 0,
          priceIncreasePercent: priceIncrease,
          reason: negotiation.reason,
          penaltyCouponCode: penaltyCoupon.code,
          product: {
            id: product.id,
            name: product.name,
            originalPrice: product.price,
            increasedPrice: increasedPrice,
          },
          message: `I understand you're looking for a deal, but I maintain professional standards. Due to the nature of your request, I've applied a ${priceIncrease}% price adjustment. The new price for ${product.name} is $${increasedPrice.toFixed(2)}.`,
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
    
    // Update URL to product page route
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/products/${productId}`);
    }
    
    return { success: true, product };
  }, [products]);

  // Cart Total Calculation (with coupon and penalty)
  const cartTotal = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product.price) || 0;
      return sum + price * item.quantity;
    }, 0);

    if (appliedCoupon) {
      const discountPercent = appliedCoupon.discountPercent || 0;
      
      if (discountPercent > 0) {
        // Regular discount
        const discount = subtotal * (discountPercent / 100);
        return {
          subtotal,
          discount,
          total: subtotal - discount,
          coupon: appliedCoupon,
          isPenalty: false,
        };
      } else if (discountPercent < 0) {
        // Penalty (price increase) - negative discount means increase
        const penalty = subtotal * (Math.abs(discountPercent) / 100);
        return {
          subtotal,
          discount: -penalty, // Negative discount = penalty
          total: subtotal + penalty, // Add penalty to total
          coupon: appliedCoupon,
          isPenalty: true,
        };
      }
    }

    return {
      subtotal,
      discount: 0,
      total: subtotal,
      coupon: null,
      isPenalty: false,
    };
  }, [cartItems, appliedCoupon]);

  // Cart Item Count
  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // AI-callable function: Get product recommendations based on user activity
  const getRecommendations = useCallback(() => {
    const { viewed, addedToCart, searched } = userActivity;
    
    if (viewed.length === 0 && addedToCart.length === 0) {
      // No activity yet - recommend top-rated products
      return products
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);
    }

    // Get categories from viewed/carted products
    const activityProductIds = [...new Set([...viewed, ...addedToCart])];
    const activityProducts = products.filter((p) => activityProductIds.includes(p.id));
    const categories = [...new Set(activityProducts.map((p) => p.category))];
    
    // Get colors from activity
    const colors = [...new Set(activityProducts.flatMap((p) => p.colors || []))];

    // Recommend products in same categories or with same colors, excluding already viewed/carted
    const recommendations = products
      .filter((p) => {
        // Don't recommend products already viewed or in cart
        if (activityProductIds.includes(p.id)) return false;
        
        // Match by category or color
        const categoryMatch = categories.includes(p.category);
        const colorMatch = p.colors && p.colors.some((c) => colors.includes(c));
        
        return categoryMatch || colorMatch;
      })
      .sort((a, b) => {
        // Prefer higher rated products
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, 4);

    // If not enough recommendations, add top-rated products
    if (recommendations.length < 4) {
      const topRated = products
        .filter((p) => !activityProductIds.includes(p.id))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4 - recommendations.length);
      return [...recommendations, ...topRated].slice(0, 4);
    }

    return recommendations;
  }, [products, userActivity]);

  // AI-callable function: Recommend products (for AI to call)
  const recommendProducts = useCallback(() => {
    const recommendations = getRecommendations();
    return {
      success: true,
      products: recommendations,
      count: recommendations.length,
      message: `Based on your activity, here are ${recommendations.length} products you might like:`,
    };
  }, [getRecommendations]);

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

    // Recommendations
    recommendProducts,
    getRecommendations,

    // Helper functions
    findProductByName,
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
