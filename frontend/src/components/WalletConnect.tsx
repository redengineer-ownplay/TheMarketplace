'use client'

import { useWallet } from '@/providers/WalletProvider'
import { Loader2 } from 'lucide-react'

export function ConnectWallet() {
  const { address, connect, disconnect, isConnecting } = useWallet()

  if (isConnecting) {
    return (
      <button 
        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
        disabled
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Connecting...
      </button>
    )
  }

  if (address) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </span>
        <button
          onClick={disconnect}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connect}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Connect Wallet
    </button>
  )
}