"use client";

import Link from 'next/link'
import { ConnectWallet } from '@/components/WalletConnect'
import { useWallet } from '@/providers/WalletProvider';

export default function Navbar() {
  const { address } = useWallet()

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Web3 Wallet
            </Link>
            {address && (
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/nfts"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  My NFTs
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  Profile
                </Link>
              </div>
            )}
          </div>
          <ConnectWallet />
        </div>
      </div>
    </nav>
  )
}