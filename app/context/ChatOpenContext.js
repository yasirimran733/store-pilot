'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ChatOpenContext = createContext(undefined);

export function ChatOpenProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <ChatOpenContext.Provider value={{ isOpen, setIsOpen, openChat, closeChat, toggleChat }}>
      {children}
    </ChatOpenContext.Provider>
  );
}

export function useChatOpen() {
  const ctx = useContext(ChatOpenContext);
  if (!ctx) return { isOpen: false, setIsOpen: () => {}, openChat: () => {}, closeChat: () => {}, toggleChat: () => {} };
  return ctx;
}
