'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/app/context/StoreContext';

/** Remove image URLs from AI message content so they are not shown in chat. */
function stripImageUrls(text) {
  if (typeof text !== 'string') return text;
  const imageUrlLine = /^\s*(https?:\/\/[^\s]*\.(png|jpg|jpeg|gif|webp)(\?[^\s]*)?|\/images\/[^\s]*)\s*$/gim;
  const inlineImageUrl = /https?:\/\/[^\s]*\.(png|jpg|jpeg|gif|webp)(\?[^\s]*)?|\/images\/[^\s]*(?=\s|$)/gim;
  let out = text.replace(imageUrlLine, '').replace(inlineImageUrl, '');
  out = out.replace(/\n{3,}/g, '\n\n').trim();
  return out;
}

export default function ChatWidget() {
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Execute function calls from AI response
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

  // Handle multi-function calls (e.g., previousFunction chain)
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

    // Add user message to UI
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Build conversation history (excluding system message)
      const conversationHistory = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

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

      // Add AI response to messages
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
    <div className="flex flex-col h-full bg-stone-50 border-l border-stone-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-200 bg-white">
        <h2 className="text-xl font-semibold text-slate-800">Chat with Shopkeeper</h2>
        <p className="text-sm text-slate-600 mt-1">Your AI shopping assistant</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-slate-800 text-white'
                  : msg.error
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-white text-slate-800 border border-stone-200'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.role === 'assistant' ? stripImageUrls(msg.content) : msg.content}
              </p>
              {msg.executedFunction && (
                <p className="text-xs mt-2 text-slate-600 italic">
                  ✓ {msg.executedFunction.name} executed
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-lg px-4 py-2">
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
      <div className="px-6 py-4 border-t border-stone-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about our products..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 placeholder:text-slate-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
