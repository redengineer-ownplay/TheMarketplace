'use client'

import { useState } from 'react'
import { useWallet } from '@/providers/WalletProvider'
import { useToast } from '@/hooks/useToast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { formatDistance } from 'date-fns'
import { useGetTransactions } from '@/services/api/transaction/hooks'
import { getTransactions } from '@/services/api/transaction'
import { useAppStore } from '@/store'
import { shortenAddress } from '@/utils/string/shortenWeb3Address'

export function TransactionHistory() {
  const { address } = useWallet()
  const { toast } = useToast()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  const transactions = useAppStore().use.transactions()
  const transactionListHasMore = useAppStore().use.transactionListHasMore()
  const transactionListOffset = useAppStore().use.transactionListOffset()
  const hasTransactions = useAppStore().use.hasTransactions()

  const { isLoading, error } = useGetTransactions(
    { walletAddress: address || "" },
    { limit: 10, offset: 0 }
  );

  const handleLoadMore = async () => {
    if (!address || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      await getTransactions(
        { walletAddress: address },
        { limit: 10, offset: transactionListOffset }
      );
    } catch (error) {
      console.error('Error loading more transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load more transactions',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to load transaction history',
      variant: 'destructive',
    });
  }

  if (isLoading && !hasTransactions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasTransactions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {tx.from_address.toLowerCase() === address?.toLowerCase() ? (
                    <ArrowUpRight className="w-5 h-5 text-red-500" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium">
                      {tx.from_address.toLowerCase() === address?.toLowerCase()
                        ? 'Sent'
                        : 'Received'}{' '}
                      {tx.nftMetadata?.name || `NFT #${tx.token_id}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {tx.from_address.toLowerCase() === address?.toLowerCase()
                        ? `To: ${shortenAddress(tx.to_address)}`
                        : `From: ${shortenAddress(tx.from_address)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {formatDistance(new Date(tx.created_at), new Date(), {
                      addSuffix: true,
                    })}
                  </p>
                  <div className="mt-1">
                    {tx.status === 'completed' ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Completed
                      </span>
                    ) : tx.status === 'pending' ? (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {tx.tx_hash && (
                <a
                  href={`https://polygonscan.com/tx/${tx.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-blue-500 hover:text-blue-600"
                >
                  View on PolygonScan →
                </a>
              )}
            </div>
          ))}

          {transactionListHasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="w-full py-2 text-blue-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}