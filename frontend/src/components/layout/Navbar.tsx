'use client';

import { memo } from 'react';
import Link from 'next/link'
import { WalletConnect } from '@/components/features/wallet/WalletConnect'
import { useWallet } from '@/providers/WalletProvider';

export const Navbar = memo(function Navbar() {
  const { address } = useWallet()

  return (
    <nav className="bg-secondary/5 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-foreground">
              Web3 Wallet
            </Link>
            {address && (
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/nfts"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
                >
                  My NFTs
                </Link>
                <Link
                  href="/profile"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
                >
                  Profile
                </Link>
              </div>
            )}
          </div>
          <WalletConnect />
        </div>
      </div>
    </nav>
  )
})