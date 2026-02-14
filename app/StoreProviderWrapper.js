'use client';

import { StoreProvider } from '@/app/context/StoreContext';
import { ToastProvider } from '@/app/context/ToastContext';
import { ChatOpenProvider } from '@/app/context/ChatOpenContext';
import FloatingChatWidget from '@/app/components/FloatingChatWidget';

export default function StoreProviderWrapper({ children }) {
  return (
    <StoreProvider>
      <ToastProvider>
        <ChatOpenProvider>
          {children}
          <FloatingChatWidget />
        </ChatOpenProvider>
      </ToastProvider>
    </StoreProvider>
  );
}
