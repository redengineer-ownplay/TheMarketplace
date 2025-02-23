import { useWallet } from '@/providers/WalletProvider'
import { Loader2 } from 'lucide-react'

export function ConnectWalletPrompt() {
  const { connect, isConnecting } = useWallet()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Connect your wallet to access your NFTs and manage your transactions.
      </p>
      <button
        onClick={connect}
        disabled={isConnecting}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
    </div>
  )
}