import { memo } from 'react';
import { useWallet } from '@/providers/WalletProvider';
import { Loader2 } from 'lucide-react';

export const ConnectWalletPrompt = memo(function ConnectWalletPrompt() {
  const { connect, isConnecting } = useWallet();

  return (
    <div className="animate-fade-in flex min-h-[400px] flex-col items-center justify-center rounded-lg bg-secondary/10 p-8 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold text-foreground">Connect Your Wallet</h2>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        Connect your wallet to access your NFTs and manage your transactions.
      </p>
      <button onClick={connect} disabled={isConnecting} className="button button-primary">
        {isConnecting ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Connecting...</span>
          </div>
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
    </div>
  );
});
