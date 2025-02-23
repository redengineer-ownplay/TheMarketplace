import { memo } from 'react'
import { useWallet } from '@/providers/WalletProvider'
import { Loader2 } from 'lucide-react'

export const ConnectWalletPrompt = memo(function ConnectWalletPrompt() {
  const { connect, isConnecting } = useWallet()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-secondary/10 rounded-lg shadow-sm animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Connect Your Wallet</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Connect your wallet to access your NFTs and manage your transactions.
      </p>
      <button
        onClick={connect}
        disabled={isConnecting}
        className="button button-primary"
      >
        {isConnecting ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Connecting...</span>
          </div>
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
    </div>
  )
})