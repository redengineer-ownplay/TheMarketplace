import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import { Providers } from '@/providers'
import { Toaster } from '@/components/ui/Toaster'
import { ErrorToast } from '@/components/notifications/ErrorToast'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
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