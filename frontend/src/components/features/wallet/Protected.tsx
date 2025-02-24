import { memo } from 'react';
import { useWallet } from '@/providers/WalletProvider';
import { ConnectWalletPrompt } from '@/components/features/wallet/ConnectWalletPrompt';

interface ProtectedProps {
  children: React.ReactNode;
}

export const Protected = memo(function Protected({ children }: ProtectedProps) {
  const { address } = useWallet();

  if (!address) {
    return <ConnectWalletPrompt />;
  }

  return <>{children}</>;
});
