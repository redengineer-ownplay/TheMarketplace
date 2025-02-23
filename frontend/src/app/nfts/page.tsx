import { Metadata } from 'next'
import { generateMetadata } from '@/config/seo/metadata'
import NFTsPageComponent from '@/components/pages/NftPage'

export const metadata: Metadata = generateMetadata({
  title: 'My NFTs | Web3 Wallet Platform',
  description: 'View and manage your NFT collection on the Polygon blockchain.',
  path: '/nfts',
})

export default function NFTsPage() {
  return <NFTsPageComponent />
}