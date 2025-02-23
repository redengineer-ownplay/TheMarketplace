import { memo } from 'react'
import { useWallet } from '@/providers/WalletProvider'
import { Loader2 } from 'lucide-react'
import { shortenAddress } from '@/utils/string/shortenWeb3Address'

export const WalletConnect = memo(function WalletConnect() {
  const { address, connect, disconnect, isConnecting } = useWallet()

  if (isConnecting) {
    return (
      <button 
        className="flex items-center space-x-2 px-4 py-2 bg-secondary/30 text-muted-foreground rounded-lg"
        disabled
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Connecting...</span>
      </button>
    )
  }

  if (address) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm font-mono bg-secondary/20 px-3 py-1 rounded-md text-muted-foreground">
          {shortenAddress(address)}
        </span>
        <button
          onClick={disconnect}
          className="text-sm text-error hover:text-error/80 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connect}
      className="button button-primary"
    >
      Connect Wallet
    </button>
  )
})