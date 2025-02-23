'use client'

import { NFTGallery } from '@/components/features/nfts/NFTGallery'
import { Protected } from '@/components/features/wallet/Protected'

export default function NFTsPage() {
  return (
    <Protected>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My NFTs</h1>
        <p className="text-muted-foreground">View and manage your NFT collection on the Polygon blockchain.</p>
        <NFTGallery />
      </div>
    </Protected>
  )
}