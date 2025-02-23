'use client'

import { NFTGallery } from '@/components/nfts/NFTGallery'
import { Protected } from '@/components/Protected'

export default function NFTsPage() {
  return (
    <Protected>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">My NFTs</h1>
        <NFTGallery />
      </div>
    </Protected>
  )
}