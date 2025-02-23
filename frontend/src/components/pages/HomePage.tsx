'use client'

import { useWallet } from '@/providers/WalletProvider'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { ArrowRight } from 'lucide-react'

export default function HomePage() {
  const { address } = useWallet()

  return (
    <div className="max-w-4xl mx-auto py-20 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-6 text-foreground">
          Web3 Wallet Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Securely manage your NFTs on Polygon. Connect your wallet to view and transfer your digital assets with ease.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <Card className="p-6 hover:scale-102 transition-transform">
          <h2 className="text-xl font-semibold mb-3">View Your NFTs</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view all your NFTs in one place with rich metadata and previews.
          </p>
          <Link 
            href={address ? "/nfts" : "#"} 
            className={`button button-primary inline-flex items-center ${!address && 'opacity-50 cursor-not-allowed'}`}
            onClick={(e) => !address && e.preventDefault()}
          >
            Browse NFTs <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Card>
        
        <Card className="p-6 hover:scale-102 transition-transform">
          <h2 className="text-xl font-semibold mb-3">Send NFTs by Username</h2>
          <p className="text-muted-foreground mb-6">
            Transfer your NFTs easily by using recipient usernames instead of complex wallet addresses.
          </p>
          <Link 
            href={address ? "/profile" : "#"} 
            className={`button button-primary inline-flex items-center ${!address && 'opacity-50 cursor-not-allowed'}`}
            onClick={(e) => !address && e.preventDefault()}
          >
            Manage Profile <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Card>
      </div>

      {!address && (
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Connect your wallet to get started
          </p>
        </div>
      )}
    </div>
  )
}