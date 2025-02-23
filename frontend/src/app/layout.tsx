import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { Toaster } from '@/components/ui/Toaster'
import { ErrorToast } from '@/components/features/notifications/ErrorToast'
import { Navbar } from '@/components/layout/Navbar'
import { Metadata } from 'next'
import { generateMetadata } from '@/config/seo/metadata'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  ...generateMetadata({
    title: 'Web3 Wallet Platform',
    description: 'Manage your NFTs and tokens with our Web3 Wallet Platform',
  }),
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 animate-fade-in">
              {children}
            </main>
            <Toaster />
            <ErrorToast />
          </div>
        </Providers>
      </body>
    </html>
  )
}