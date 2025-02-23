import { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react'
import { ethers } from 'ethers'
import { useToast } from '@/hooks/useToast'
import { getStoredAuth } from '@/services/api/auth'
import { useAuth } from '@/hooks/useAuth'

interface WalletContextType {
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
  isInitializing: boolean
  error: string | null
  chainId: number | null
  network: string | null
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
  isInitializing: true,
  error: null,
  chainId: null,
  network: null
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { login, logout } = useAuth()

  const network = useMemo(() => {
    if (!chainId) return null;
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 137: return 'Polygon Mainnet';
      case 80001: return 'Polygon Mumbai';
      default: return `Chain ID: ${chainId}`;
    }
  }, [chainId]);

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const accounts = await provider.listAccounts()
      
      if (accounts.length > 0) {
        const network = await provider.getNetwork()
        setChainId(network.chainId)
        setAddress(accounts[0])
      }
    } catch (err) {
      console.error('Error checking connection:', err)
    }
  }, [])

  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: 'MetaMask Required',
        description: 'Please install MetaMask to use this application',
        variant: 'destructive',
      })
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const accountsPromise = window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      const accounts = await Promise.race([
        accountsPromise,
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timed out. Please try again.')), 30000)
        )
      ]);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please check your wallet.')
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const network = await provider.getNetwork()
      setChainId(network.chainId)
      
      const signer = provider.getSigner()
      const currentAddress = await signer.getAddress()

      // Check if we're on Polygon or a testnet
      if (network.chainId !== 137 && network.chainId !== 80001) {
        toast({
          title: 'Wrong Network',
          description: 'Please connect to Polygon Mainnet or Mumbai Testnet',
          variant: 'destructive',
        })
      }

      const nonce = Math.floor(Math.random() * 1000000).toString()
      const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`
      
      const signaturePromise = signer.signMessage(message);
      const signature = await Promise.race([
        signaturePromise,
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Signing timed out. Please try again.')), 30000)
        )
      ]);

      if (!signature) {
        throw new Error('Signature required to authenticate');
      }

      const response = await login({
        walletAddress: currentAddress,
        message,
        signature,
      });

      setAddress(response.user.walletAddress);
      
      toast({
        title: 'Connected',
        description: `Connected to ${network.name}`,
      });
    } catch (err: unknown) {
      console.error('Connection error:', err)
      if (err && typeof err === 'object' && 'code' in err && err.code === 4001) {
        toast({
          title: 'Connection Cancelled',
          description: 'You cancelled the connection request',
        });
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
        setError(errorMessage)
        toast({
          title: 'Connection Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsConnecting(false)
    }
  }, [toast, login])

  const disconnect = useCallback(() => {
    setAddress(null)
    setChainId(null)
    logout()
    toast({
      title: 'Disconnected',
      description: 'Wallet disconnected successfully',
    });
  }, [logout, toast])

  useEffect(() => {
    const init = async () => {
      const { token, walletAddress } = getStoredAuth();
      
      if (walletAddress && token && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const accounts = await provider.listAccounts()
          const network = await provider.getNetwork()
          
          if (accounts.length > 0 && accounts[0].toLowerCase() === walletAddress.toLowerCase()) {
            setAddress(walletAddress)
            setChainId(network.chainId)
          } else {
            disconnect()
          }
        } catch (err) {
          console.error('Error checking connection:', err)
          disconnect()
        }
      }
      setIsInitializing(false)
    }

    init()
  }, [disconnect])

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else if (address) {
          const newAddress = accounts[0]
          if (newAddress.toLowerCase() !== address.toLowerCase()) {
            disconnect()
            setAddress(newAddress)
            toast({
              title: 'Wallet Changed',
              description: 'Please reconnect your wallet to continue',
            });
          }
        }
      }

      const handleChainChanged = (chainIdHex: string) => {
        const chainIdDec = parseInt(chainIdHex, 16)
        setChainId(chainIdDec)
        
        const networkName = 
          chainIdDec === 1 ? 'Ethereum Mainnet' :
          chainIdDec === 137 ? 'Polygon Mainnet' :
          chainIdDec === 80001 ? 'Polygon Mumbai' :
          `Chain ID: ${chainIdDec}`;
          
        toast({
          title: 'Network Changed',
          description: `Connected to ${networkName}`,
        });
        
        if (chainIdDec !== 137 && chainIdDec !== 80001) {
          toast({
            title: 'Wrong Network',
            description: 'Please connect to Polygon Mainnet or Mumbai Testnet',
            variant: 'destructive',
          });
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      checkConnection()

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [address, disconnect, checkConnection, toast])

  const contextValue = useMemo(() => ({
    address,
    connect,
    disconnect,
    isConnecting,
    isInitializing,
    error,
    chainId,
    network
  }), [
    address,
    connect,
    disconnect,
    isConnecting,
    isInitializing,
    error,
    chainId,
    network
  ])

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)