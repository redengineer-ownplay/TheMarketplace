import { useCallback, useEffect, useRef, useState } from 'react'
import { useWallet } from '@/providers/WalletProvider'
import { useToast } from '@/hooks/useToast'
import { useGetNFTs } from '@/services/api/nft/hooks'
import { getNFTs } from '@/services/api/nft'
import { useAppStore } from '@/store'
import { NFT } from '@/types/nft'
import { Loader2 } from 'lucide-react'
import { TransferModal } from '@/components/features/transfers/TransferModal'
import { NFTCard } from '@/components/features/nfts/NFTCard'

const ITEMS_PER_PAGE = 12;

export function NFTGallery() {
  const { address } = useWallet()
  const { toast } = useToast()
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  
  const nfts = useAppStore().use.nfts()
  const nftListHasMore = useAppStore().use.nftListHasMore()
  const nftListOffset = useAppStore().use.nftListOffset()
  const hasNFTs = useAppStore().use.hasNFTs()
  const { clearNFTs } = useAppStore().getState()

  const { isLoading, error } = useGetNFTs(
    { walletAddress: address || "" },
    { limit: ITEMS_PER_PAGE, offset: 0 }
  );

  useEffect(() => {
    if (!loadMoreRef.current || !nftListHasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [nftListHasMore, isLoadingMore]);

  const handleLoadMore = useCallback(async () => {
    if (!address || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      await getNFTs(
        { walletAddress: address },
        { limit: ITEMS_PER_PAGE, offset: nftListOffset }
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
  }, [address, nftListOffset, isLoadingMore, toast]);

  if (isLoading && !hasNFTs) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="nft-card animate-pulse">
            <div className="aspect-square bg-secondary/50 rounded-lg" />
            <div className="mt-4 space-y-3">
              <div className="h-4 bg-secondary/50 rounded w-3/4" />
              <div className="h-4 bg-secondary/50 rounded w-1/2" />
            </div>
          </div>
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
      <div className="text-center py-12 animate-fade-in">
        <h3 className="text-lg font-medium text-foreground">No NFTs found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Once you receive NFTs, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {nfts.map((nft, index) => (
          <NFTCard
            key={`${nft.contractAddress}-${nft.tokenId}`}
            nft={nft}
            onTransferClick={() => {
              setSelectedNFT(nft);
              setShowTransferModal(true);
            }}
            className={`animate-slide-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>

      {nftListHasMore && (
        <div 
          ref={loadMoreRef}
          className="mt-8 flex justify-center"
        >
          {isLoadingMore && (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {selectedNFT && (
        <TransferModal
          nft={selectedNFT}
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedNFT(null);
          }}
          onTransferComplete={() => {
            setShowTransferModal(false);
            setSelectedNFT(null);

            setTimeout(() => {
              clearNFTs();
              getNFTs(
                { walletAddress: address || "" },
                { limit: ITEMS_PER_PAGE, offset: 0 }
              )
            }, 1000)
          }}
        />
      )}
    </>
  );
}