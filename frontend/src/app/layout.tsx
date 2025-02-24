import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import { Toaster } from '@/components/ui/Toaster';
import { ErrorToast } from '@/components/features/notifications/ErrorToast';
import { Navbar } from '@/components/layout/Navbar';
import { Metadata } from 'next';
import { generateMetadata } from '@/config/seo/metadata';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  ...generateMetadata({
    title: 'Web3 Wallet Platform',
    description: 'Manage your NFTs and tokens with our Web3 Wallet Platform',
  }),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="animate-fade-in container mx-auto flex-1 px-4 py-8">{children}</main>
            <Toaster />
            <ErrorToast />
          </div>
        </Providers>
      </body>
    </html>
  );
}
