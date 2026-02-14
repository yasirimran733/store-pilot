'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/app/context/StoreContext';

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI shopkeeper. How can I help you find something perfect today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const store = useStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const executeFunctionCall = (functionName, params) => {
    try {
      switch (functionName) {
        case 'addToCart':
          store.addToCart(params.productId);
          break;
        case 'removeFromCart':
          store.removeFromCart(params.productId);
          break;
        case 'sortProducts':
          store.sortProducts(params.order);
          break;
        case 'filterCategory':
          store.filterCategory(params.category);
          break;
        case 'navigateToProduct':
          store.navigateToProduct(params.productId);
          break;
        case 'applyCoupon':
          store.applyCoupon(params.code, params.discountPercent);
          break;
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

      // Execute function calls BEFORE updating messages to ensure UI updates immediately
      if (data.executedFunction) {
        executeFunctionChain(data.executedFunction);
        // Wait for React to process state updates - use double RAF for reliability
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
        // Small delay to ensure all state updates are batched and processed
        await new Promise(resolve => setTimeout(resolve, 50));
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
          content: "I'm sorry, I encountered an error. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-slate-800 text-white p-4 rounded-full shadow-lg hover:bg-slate-700 transition-all hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col border border-stone-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-stone-200 bg-slate-800 text-white rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold">AI Shopkeeper</h3>
              <p className="text-xs text-stone-300">Your shopping assistant</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-stone-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-800 text-white'
                      : msg.error
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-white text-slate-800 border border-stone-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.executedFunction && (
                    <p className="text-xs mt-1 opacity-70 italic">
                      ✓ {msg.executedFunction.name} executed
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-stone-200 bg-white rounded-b-lg">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
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
