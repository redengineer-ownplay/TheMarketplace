'use client';

import { useWallet } from '@/providers/WalletProvider';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { address } = useWallet();

  return (
    <div className="animate-fade-in mx-auto max-w-4xl py-20">
      <div className="mb-12 text-center">
        <h1 className="mb-6 text-5xl font-bold text-foreground">Web3 Wallet Platform</h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Securely manage your NFTs on Polygon. Connect your wallet to view and transfer your
          digital assets with ease.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card className="p-6 transition-transform hover:scale-102">
          <h2 className="mb-3 text-xl font-semibold">View Your NFTs</h2>
          <p className="mb-6 text-muted-foreground">
            Connect your wallet to view all your NFTs in one place with rich metadata and previews.
          </p>
          <Link
            href={address ? '/nfts' : '#'}
            className={`button button-primary inline-flex items-center ${!address && 'cursor-not-allowed opacity-50'}`}
            onClick={e => !address && e.preventDefault()}
          >
            Browse NFTs <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Card>

        <Card className="p-6 transition-transform hover:scale-102">
          <h2 className="mb-3 text-xl font-semibold">Send NFTs by Username</h2>
          <p className="mb-6 text-muted-foreground">
            Transfer your NFTs easily by using recipient usernames instead of complex wallet
            addresses.
          </p>
          <Link
            href={address ? '/profile' : '#'}
            className={`button button-primary inline-flex items-center ${!address && 'cursor-not-allowed opacity-50'}`}
            onClick={e => !address && e.preventDefault()}
          >
            Manage Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Card>
      </div>

      {!address && (
        <div className="mt-12 text-center">
          <p className="mb-4 text-muted-foreground">Connect your wallet to get started</p>
        </div>
      )}
    </div>
  );
}
