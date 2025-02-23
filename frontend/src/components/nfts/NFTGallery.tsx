'use client'

import { useState } from 'react'
import { useWallet } from '@/providers/WalletProvider'
import { useToast } from '@/hooks/useToast'
import { NFTCardSkeleton } from './ui/Loading'
import { TransferModal } from './TransferModal'
import SafeImage from './ui/SafeImage'
import { useGetNFTs } from '@/services/api/nft/hooks'
import { getNFTs } from '@/services/api/nft'
import { useAppStore } from '@/store'
import { NFT } from '@/types/nft'
import { Loader2 } from 'lucide-react'

export function NFTGallery() {
  const { address } = useWallet()
  const { toast } = useToast()
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  const nfts = useAppStore().use.nfts()
  const nftListHasMore = useAppStore().use.nftListHasMore()
  const nftListOffset = useAppStore().use.nftListOffset()
  const hasNFTs = useAppStore().use.hasNFTs()
  const { clearNFTs } = useAppStore().getState()

  const { isLoading, error } = useGetNFTs(
    { walletAddress: address || "" },
    { limit: 12, offset: 0 }
  );

  const handleLoadMore = async () => {
    if (!address || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      await getNFTs(
        { walletAddress: address },
        { limit: 12, offset: nftListOffset }
      );
    } catch (error) {
      console.error('Error loading more NFTs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load more NFTs',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading && !hasNFTs) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <NFTCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to load NFTs',
      variant: 'destructive',
    });
  }

  if (!hasNFTs) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No NFTs found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Once you receive NFTs, they will appear here.
        </p>
      </div>
    );
  }

  const handleTransferClick = (nft: NFT) => {
    setSelectedNFT(nft);
    setShowTransferModal(true);
  };

  const handleTransferComplete = () => {
    setShowTransferModal(false);
    setSelectedNFT(null);
    clearNFTs();
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.map((nft) => (
          <div
            key={`${nft.contractAddress}-${nft.tokenId}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square relative">
              {nft.metadata.image && (
                <SafeImage 
                  src={nft.metadata.image}
                  alt={nft.metadata.name || 'NFT'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate">
                {nft.metadata.name || 'Unnamed NFT'}
              </h3>
              {nft.metadata.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {nft.metadata.description}
                </p>
              )}
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Token ID: {nft.tokenId}
                </span>
                <button
                  onClick={() => handleTransferClick(nft)}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedNFT && (
        <TransferModal
          nft={selectedNFT}
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedNFT(null);
          }}
          onTransferComplete={handleTransferComplete}
        />
      )}
      
      {nftListHasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
}