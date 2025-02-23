import { useWallet } from '@/providers/WalletProvider'
import { ConnectWalletPrompt } from '@/components/wallet/ConnectWalletPrompt'

interface ProtectedProps {
  children: React.ReactNode
}

export function Protected({ children }: ProtectedProps) {
  const { address } = useWallet()

  if (!address) {
    return <ConnectWalletPrompt />
  }

  return <>{children}</>
}