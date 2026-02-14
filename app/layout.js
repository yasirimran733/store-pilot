import { Inter } from 'next/font/google';
import './globals.css';
import StoreProviderWrapper from './StoreProviderWrapper';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'Store Pilot - AI-Powered Shopping Experience',
  description: 'Shop with an AI shopkeeper that understands you. Chat-controlled e-commerce with semantic search and haggle mode.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <StoreProviderWrapper>{children}</StoreProviderWrapper>
      </body>
    </html>
  );
}
