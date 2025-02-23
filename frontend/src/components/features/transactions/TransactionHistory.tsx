import { useState } from 'react'
import { useWallet } from '@/providers/WalletProvider'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowUpRight, ArrowDownLeft, Loader2, ExternalLink } from 'lucide-react'
import { formatDistance } from 'date-fns'
import { useGetTransactions } from '@/services/api/transaction/hooks'
import { getTransactions } from '@/services/api/transaction'
import { useAppStore } from '@/store'
import { shortenAddress } from '@/utils/string/shortenWeb3Address'
import { TransactionStatus } from '@/components/features/transactions/TransactionStatus'

export function TransactionHistory() {
  const { address } = useWallet()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  const transactions = useAppStore().use.transactions()
  const hasMore = useAppStore().use.transactionListHasMore()
  const offset = useAppStore().use.transactionListOffset()
  const hasTransactions = useAppStore().use.hasTransactions()

  const { isLoading } = useGetTransactions(
    { walletAddress: address || "" },
    { limit: 10, offset: 0 }
  )

  const handleLoadMore = async () => {
    if (!address || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      await getTransactions(
        { walletAddress: address },
        { limit: 10, offset }
      )
    } catch (error) {
      console.error('Error loading more transactions:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (isLoading && !hasTransactions) {
    return (
      <Card className='border-none'>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasTransactions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No transactions found
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="transaction-item">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {tx.from_address.toLowerCase() === address?.toLowerCase() ? (
                    <ArrowUpRight className="w-5 h-5 text-error" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5 text-success" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {tx.from_address.toLowerCase() === address?.toLowerCase()
                        ? 'Sent'
                        : 'Received'}{' '}
                      {tx.nftMetadata?.name || `NFT #${tx.token_id}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tx.from_address.toLowerCase() === address?.toLowerCase()
                        ? `To: ${shortenAddress(tx.to_address)}`
                        : `From: ${shortenAddress(tx.from_address)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {formatDistance(new Date(tx.created_at), new Date(), {
                      addSuffix: true,
                    })}
                  </p>
                  <div className="mt-1">
                    <TransactionStatus status={tx.status} />
                  </div>
                </div>
              </div>
              {tx.tx_hash && (
                <Link
                  href={`https://polygonscan.com/tx/${tx.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-sm text-muted-foreground hover:text-muted-foreground/80"
                >
                  View on PolygonScan
                  <ExternalLink className="w-4 h-4 ml-1" />
                </Link>
              )}
            </div>
          ))}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="w-full py-2 text-muted-foreground hover:text-muted-foreground/80 disabled:text-muted-foreground flex items-center justify-center"
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
  )
}