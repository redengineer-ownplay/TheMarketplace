import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/useToast';
import { getStoredAuth } from '@/services/api/auth';
import { useAuth } from '@/hooks/useAuth';

interface WalletContextType {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  isInitializing: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
  isInitializing: true,
  error: null,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { login, logout } = useAuth();

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: 'MetaMask Required',
        description: 'Please install MetaMask to use this application',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum
        .request({
          method: 'eth_requestAccounts',
        })
        .catch((err: { code: number; message?: string }) => {
          if (err.code === 4001) {
            throw new Error('Please connect your wallet to continue');
          }
          throw err;
        });

      const signer = provider.getSigner();
      const currentAddress = await signer.getAddress();

      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`;

      const signature = await signer.signMessage(message);

      try {
        const response = await login({
          walletAddress: currentAddress,
          message,
          signature,
        });

        setAddress(response.user.walletAddress);
      } catch (err: unknown) {
        console.error('Connection error:', err);
        if (err && typeof err === 'object' && 'code' in err && err.code !== 4001) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
          setError(errorMessage);
          toast({
            title: 'Connection Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }
    } catch (err: unknown) {
      console.error('Connection error:', err);
      if (err && typeof err === 'object' && 'code' in err && err.code !== 4001) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
        setError(errorMessage);
        toast({
          title: 'Connection Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    logout();
  };

  useEffect(() => {
    const init = async () => {
      const { token, walletAddress } = getStoredAuth();

      if (walletAddress && token && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();

          if (accounts.length > 0 && accounts[0].toLowerCase() === walletAddress.toLowerCase()) {
            setAddress(walletAddress);
          } else {
            disconnect();
          }
        } catch (err) {
          console.error('Error checking connection:', err);
          disconnect();
        }
      }
      setIsInitializing(false);
    };

    init();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          const newAddress = accounts[0];
          if (address && newAddress.toLowerCase() !== address.toLowerCase()) {
            disconnect();
          }
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [address]);

  return (
    <WalletContext.Provider
      value={{
        address,
        connect,
        disconnect,
        isConnecting,
        isInitializing,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
