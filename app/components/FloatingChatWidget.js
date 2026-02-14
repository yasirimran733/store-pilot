'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/app/context/StoreContext';
import { useChatOpen } from '@/app/context/ChatOpenContext';
import { useToast } from '@/app/context/ToastContext';

/** Remove image URLs from AI message content so they are not shown in chat. */
function stripImageUrls(text) {
  if (typeof text !== 'string') return text;
  // Remove lines that are only image URLs (absolute or relative)
  const imageUrlLine = /^\s*(https?:\/\/[^\s]*\.(png|jpg|jpeg|gif|webp)(\?[^\s]*)?|\/images\/[^\s]*)\s*$/gim;
  // Remove inline image URLs
  const inlineImageUrl = /https?:\/\/[^\s]*\.(png|jpg|jpeg|gif|webp)(\?[^\s]*)?|\/images\/[^\s]*(?=\s|$)/gim;
  let out = text.replace(imageUrlLine, '').replace(inlineImageUrl, '');
  out = out.replace(/\n{3,}/g, '\n\n').trim();
  return out;
}

export default function FloatingChatWidget() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI shopkeeper. Ask me to find products, add to cart, sort by price, or even haggle for a discount.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const store = useStore();
  const { isOpen, setIsOpen, closeChat } = useChatOpen();
  const { addToast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const executeFunctionCall = (functionName, params) => {
    try {
      switch (functionName) {
        case 'addToCart': {
          const result = store.addToCart(params.productId);
          if (result?.success && result?.product) {
            addToast(`Added "${result.product.name}" to cart`, 'success');
          }
          break;
        }
        case 'removeFromCart':
          store.removeFromCart(params.productId);
          break;
        case 'sortProducts':
          store.sortProducts(params.order);
          break;
        case 'filterCategory':
          store.filterCategory(params.category);
          break;
        case 'navigateToProduct': {
          const res = store.navigateToProduct(params.productId);
          if (res?.success && params.productId) {
            router.push(`/products/${params.productId}`);
          }
          break;
        }
        case 'applyCoupon': {
          store.applyCoupon(params.code, params.discountPercent);
          addToast(`Coupon ${params.code} applied`, 'coupon');
          break;
        }
        case 'searchProducts':
          store.searchProducts(params.query);
          break;
        case 'negotiateDiscount':
          store.negotiateDiscount(params.request, params.productId);
          break;
        case 'recommendProducts':
          store.recommendProducts();
          break;
        default:
          console.warn(`Unknown function: ${functionName}`);
      }
    } catch (error) {
      console.error(`Error executing ${functionName}:`, error);
      addToast('Something went wrong. Please try again.', 'error');
    }
  };

  const executeFunctionChain = (executedFunction) => {
    if (executedFunction.previousFunction) {
      executeFunctionChain(executedFunction.previousFunction);
    }
    executeFunctionCall(executedFunction.name, executedFunction.params);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const conversationHistory = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, conversationHistory }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      if (data.executedFunction) {
        executeFunctionChain(data.executedFunction);
        await new Promise((r) => requestAnimationFrame(r));
        await new Promise((r) => requestAnimationFrame(r));
        await new Promise((r) => setTimeout(r, 50));
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || "I've updated the store for you!",
          executedFunction: data.executedFunction,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I ran into an error. Please try again.",
          error: true,
        },
      ]);
      addToast('Chat request failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center animate-soft-pulse"
          aria-label="Open AI Shopkeeper"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed z-50 flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden animate-panel-slide
            bottom-6 right-6 w-[calc(100vw-3rem)] max-w-md h-[85vh] max-h-[640px]
            md:max-h-[680px]"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80">
            <div>
              <h3 className="font-semibold text-slate-900">AI Shopkeeper</h3>
              <p className="text-xs text-slate-600">Ask me anything</p>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 transition-colors"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-br-md'
                      : msg.error
                      ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-md'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-sm rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.role === 'assistant' ? stripImageUrls(msg.content) : msg.content}
                  </p>
                  {msg.executedFunction && (
                    <p className="text-xs mt-2 text-slate-600">✓ Action completed</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 border-t border-slate-200 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="input-field flex-1 py-2.5 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="btn-primary py-2.5 px-4 text-sm shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
