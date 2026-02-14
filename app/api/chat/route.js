import { NextResponse } from 'next/server';
import { openai, getStoreFunctions, getSystemPrompt } from '@/app/lib/openai';
import { executeFunctionCall, createStoreActions } from '@/app/lib/storeActions';
import inventoryProducts from '@/data/products.json';

/**
 * POST /api/chat
 * Handles chat messages and OpenAI function calling for Store Pilot
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Get function definitions for OpenAI
    const functions = getStoreFunctions();
    const systemPrompt = getSystemPrompt();

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Call OpenAI with function calling enabled
    // Default: gpt-4o-mini for cheaper testing. Override with OPENAI_MODEL for different model (e.g. gpt-4o for best accuracy).
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    // const model = process.env.OPENAI_MODEL || 'gpt-4o';

    
    const completion = await openai.chat.completions.create({
      model,
      messages,
      functions,
      function_call: 'auto', // Let AI decide when to call functions
      temperature: 0.5, // Slightly lower for more consistent function calling
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0].message;
    let responseMessage = assistantMessage.content || '';
    let executedFunction = null;
    let updatedState = null;

    // Handle function calls from AI
    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments || '{}');

      // Execute the function call server-side
      const functionResult = executeFunctionCall(functionName, functionArgs, {
        products: inventoryProducts,
      });

      if (functionResult.success) {
        executedFunction = {
          name: functionName,
          params: functionArgs,
        };

        // Build updated state preview based on function result
        updatedState = buildUpdatedStatePreview(functionName, functionArgs, functionResult);

        // Get a follow-up message from OpenAI with function result
        const followUpMessages = [
          ...messages,
          assistantMessage,
          {
            role: 'function',
            name: functionName,
            content: JSON.stringify(functionResult),
          },
        ];

        const followUpCompletion = await openai.chat.completions.create({
          model,
          messages: followUpMessages,
          functions,
          function_call: 'auto',
          temperature: 0.5,
          max_tokens: 1000,
        });

        const followUpMessage = followUpCompletion.choices[0].message;

        // If AI wants to call another function, handle it
        if (followUpMessage.function_call) {
          const secondFunctionName = followUpMessage.function_call.name;
          const secondFunctionArgs = JSON.parse(
            followUpMessage.function_call.arguments || '{}'
          );

          const secondResult = executeFunctionCall(secondFunctionName, secondFunctionArgs, {
            products: inventoryProducts,
          });

          if (secondResult.success) {
            // Merge function calls (e.g., search then add to cart)
            executedFunction = {
              name: secondFunctionName,
              params: secondFunctionArgs,
              previousFunction: executedFunction,
            };

            updatedState = mergeStateUpdates(
              updatedState,
              buildUpdatedStatePreview(secondFunctionName, secondFunctionArgs, secondResult)
            );
          }

          // Get final message after second function call
          const finalMessages = [
            ...followUpMessages,
            followUpMessage,
            {
              role: 'function',
              name: secondFunctionName,
              content: JSON.stringify(secondResult),
            },
          ];

          const finalCompletion = await openai.chat.completions.create({
            model,
            messages: finalMessages,
            temperature: 0.5,
            max_tokens: 1000,
          });

          responseMessage = finalCompletion.choices[0].message.content || responseMessage;
        } else {
          responseMessage = followUpMessage.content || responseMessage;
        }
      } else {
        // Function execution failed
        responseMessage = `I encountered an error: ${functionResult.error}. ${responseMessage}`;
      }
    }

    return NextResponse.json({
      message: responseMessage,
      executedFunction,
      updatedState,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Build a preview of updated state based on function execution
 * This gives the client an idea of what will change
 */
function buildUpdatedStatePreview(functionName, params, result) {
  const state = {
    products: inventoryProducts,
    visibleProducts: inventoryProducts,
    cartItems: [],
    currentPage: 'home',
    currentProductId: null,
    appliedCoupon: null,
  };

  switch (functionName) {
    case 'searchProducts':
      if (result.products) {
        state.visibleProducts = result.products;
      }
      break;

    case 'filterCategory':
      if (result.products) {
        state.visibleProducts = result.products;
      }
      break;

    case 'sortProducts':
      // Client will apply sort to current visibleProducts
      state.sortOrder = params.order;
      break;

    case 'addToCart':
      if (result.product) {
        state.cartItems = [{ product: result.product, quantity: 1 }];
      }
      break;

    case 'removeFromCart':
      // Cart removal handled client-side
      state.cartItems = [];
      break;

    case 'navigateToProduct':
      if (result.product) {
        state.currentPage = 'product';
        state.currentProductId = params.productId;
      }
      break;

    case 'applyCoupon':
      if (result.code && result.discountPercent !== undefined) {
        state.appliedCoupon = {
          code: result.code,
          discountPercent: result.discountPercent,
        };
      }
      break;

    case 'negotiateDiscount':
      // Negotiation handled client-side, but include coupon if approved
      if (result.approved && result.couponCode) {
        state.appliedCoupon = {
          code: result.couponCode,
          discountPercent: result.discountPercent,
        };
      } else if (result.penaltyCouponCode) {
        // Include penalty coupon for rude behavior
        state.appliedCoupon = {
          code: result.penaltyCouponCode,
          discountPercent: -result.priceIncreasePercent, // Negative = price increase
        };
      }
      break;

    case 'recommendProducts':
      if (result.products) {
        state.recommendedProducts = result.products;
      }
      break;

    default:
      break;
  }

  return state;
}

/**
 * Merge state updates from multiple function calls
 */
function mergeStateUpdates(state1, state2) {
  return {
    ...state1,
    ...state2,
    // Merge arrays intelligently
    visibleProducts: state2.visibleProducts || state1.visibleProducts,
    cartItems: [...(state1.cartItems || []), ...(state2.cartItems || [])],
  };
}
