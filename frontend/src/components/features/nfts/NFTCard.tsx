import { memo } from 'react'
import { NFT } from '@/types/nft'
import SafeImage from '@/components/ui/SafeImage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { shortenAddress } from '@/utils/string/shortenWeb3Address'

interface NFTCardProps {
  nft: NFT
  onTransferClick: () => void
  className?: string
  style?: React.CSSProperties
}

export const NFTCard = memo(function NFTCard({ 
  nft, 
  onTransferClick,
  className = '',
  style
}: NFTCardProps) {
  return (
    <Card 
      className={`transition-transform duration-200 hover:scale-102 ${className}`} 
      style={style}
    >
      <CardHeader className="p-0">
        <div className="aspect-square relative rounded-t-lg overflow-hidden">
          {nft.metadata.image && (
            <SafeImage 
              src={nft.metadata.image}
              alt={nft.metadata.name || 'NFT'}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2 truncate">
          {nft.metadata.name || 'Unnamed NFT'}
        </CardTitle>
        {nft.metadata.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {nft.metadata.description}
          </p>
        )}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground break-all p-4">
            Token ID: {shortenAddress(nft.tokenId)}
          </span>
          <button
            onClick={onTransferClick}
            className="button button-secondary text-sm"
          >
            Transfer
          </button>
        </div>
      </CardContent>
    </Card>
  );
});