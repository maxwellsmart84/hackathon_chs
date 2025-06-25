import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

import './globals.css';
import Header from '@/components/layout/Header';
import KnockWrapper from '@/components/layout/KnockWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hackathon Innovation Engine',
  description: 'Connecting MedTech startups with Hackathon resources and expertise',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <KnockWrapper>
            <Header />
            <div className="bg-background min-h-screen">{children}</div>
          </KnockWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
