'use client'

import { useState, useEffect, useCallback, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { useToast } from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';
import Web3 from 'web3';
import { TransactionStatus } from '@/components/features/transfers/TransactionStatus';
import { useAppStore } from '@/store';
import { useWallet } from '@/providers/WalletProvider';
import { NFT } from '@/types/nft';
import { getUserProfileByUsername } from '@/services/api/userProfile';
import { useTransferNFT } from '@/services/api/nft/hooks';
import { debounce } from '@/utils/performance/debounce';

const ERC721_ABI = [
  {
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "operator", "type": "address" },
      { "name": "approved", "type": "bool" }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const ERC1155_ABI = [
  {
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "id", "type": "uint256" },
      { "name": "amount", "type": "uint256" },
      { "name": "data", "type": "bytes" }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "operator", "type": "address" },
      { "name": "approved", "type": "bool" }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

interface TransferModalProps {
  nft: NFT;
  isOpen: boolean;
  onClose: () => void;
  onTransferComplete: () => void;
}

export const TransferModal = memo(function TransferModal({ 
  nft, 
  isOpen, 
  onClose, 
  onTransferComplete 
}: TransferModalProps) {
  const { address } = useWallet();
  const { toast } = useToast();
  const { transfer, updateStatus } = useTransferNFT();
  const [recipientUsername, setRecipientUsername] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);

  const activeTransfer = useAppStore().use.activeTransfer();
  const isTransferring = useAppStore().use.isTransferring();
  const transferStatus = useAppStore().use.transferStatus();
  const transferStatusType = useAppStore().use.transferStatusType();
  const { setTransferStatus, resetTransfer, setActiveTransfer, setTransferring } = useAppStore().getState();

  useEffect(() => {
    if (!isOpen) {
      resetTransfer();
      setRecipientUsername('');
      setRecipientAddress('');
      setShowTransactionStatus(false);
    }
  }, [isOpen, resetTransfer]);

  const validateUsername = useCallback(
    debounce(async (username: string) => {
      if (!username) {
        setRecipientAddress('');
        setIsValidating(false);
        return;
      }

      setIsValidating(true);
      try {
        const response = await getUserProfileByUsername({ username });

        if (response?.wallet_address) {
          setRecipientUsername(response.username || '');
          setRecipientAddress(response.wallet_address);
        } else {
          setRecipientAddress('');
        }
      } catch (error) {
        console.error('Error validating username:', error);
        toast({
          title: 'Error',
          description: 'Username not found',
          variant: 'destructive',
        });
        setRecipientAddress('');
      } finally {
        setIsValidating(false);
      }
    }, 500),
    [toast]
  );

  useEffect(() => {
    validateUsername(recipientUsername);
  }, [recipientUsername, validateUsername]);

  const waitForTransaction = useCallback(async (web3: Web3, txHash: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const checkReceipt = async () => {
        try {
          const receipt = await web3.eth.getTransactionReceipt(txHash);
          if (receipt) {
            if (receipt.status) {
              resolve();
            } else {
              reject(new Error('Transaction failed'));
            }
          } else {
            setTimeout(checkReceipt, 2000);
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('Transaction not found')) {
            setTimeout(checkReceipt, 2000);
          } else {
            reject(error);
          }
        }
      };
      checkReceipt();
    });
  }, []);

  const handleTransfer = useCallback(async () => {
    if (!window.ethereum || !address || !recipientAddress) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet and enter a valid recipient',
        variant: 'destructive',
      });
      return;
    }

    setTransferring(true);

    try {
      const web3 = new Web3(window.ethereum);
      const abi = nft.tokenType === 'ERC721' ? ERC721_ABI : ERC1155_ABI;
      const contract = new web3.eth.Contract(abi, nft.contractAddress);

      const response = await transfer({
        walletAddress: address,
      },{
        recipient: recipientAddress,
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId,
        tokenType: nft.tokenType,
      });
      
      const transferId = response.id;
      
      setActiveTransfer({
        id: transferId,
        fromAddress: address,
        toAddress: recipientAddress,
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setTransferStatus('Requesting approval...', "warning");
      const approvalTx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: nft.contractAddress,
          data: contract.methods.setApprovalForAll(nft.contractAddress, true).encodeABI()
        }],
      });

      setTransferStatus('Waiting for approval confirmation...', "warning");
      await waitForTransaction(web3, approvalTx);

      setTransferStatus('Transferring NFT...', "success");
      const transferData = nft.tokenType === 'ERC721' 
        ? contract.methods.transferFrom(address, recipientAddress, nft.tokenId).encodeABI()
        : contract.methods.safeTransferFrom(address, recipientAddress, nft.tokenId, 1, '0x').encodeABI();

      const transferTx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: nft.contractAddress,
          data: transferData
        }],
      });

      setTransferStatus('Waiting for transfer confirmation...', "warning");
      await waitForTransaction(web3, transferTx);

      await updateStatus(
        { id: transferId },
        {
          status: 'completed',
          txHash: transferTx
        }
      );

      setShowTransactionStatus(true);
      onTransferComplete();

    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to transfer NFT',
        variant: 'destructive',
        duration: 5000,
      });

      if (activeTransfer?.id) {
        try {
          await updateStatus(
            { id: activeTransfer.id },
            {
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            }
          );
          
          setTransferStatus('Unable to transfer', "error");
        } catch (updateError) {
          console.error('Failed to update transfer status:', updateError);
        }
      }
    } finally {
      setTransferring(false);
    }
  }, [
    address, 
    nft, 
    recipientAddress, 
    toast, 
    transfer, 
    updateStatus, 
    setActiveTransfer, 
    setTransferStatus, 
    setTransferring, 
    waitForTransaction, 
    activeTransfer, 
    onTransferComplete
  ]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer NFT</DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            <div className="p-4 bg-secondary/20 rounded-lg">
              <h3 className="font-medium text-foreground">{nft?.metadata?.name || 'NFT'}</h3>
              <p className="text-sm text-muted-foreground">Token ID: {nft?.tokenId}</p>
              <p className="text-sm text-muted-foreground">Type: {nft?.tokenType}</p>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-foreground mb-1">
                Recipient Username
              </label>
              <input
                type="text"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                className="input w-full"
                placeholder="Enter username"
                disabled={isTransferring}
              />
              {isValidating && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating username...
                </p>
              )}
              {recipientAddress && (
                <p className="text-sm text-success mt-1">Recipient found!</p>
              )}
            </div>

            {transferStatus && (
              <div className={`text-sm text-${transferStatusType} flex items-center animate-fade-in`}>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {transferStatus}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onClose}
                className="button button-secondary"
                disabled={isTransferring}
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={isTransferring || !recipientAddress}
                className="button button-primary flex items-center"
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Transfer NFT'
                )}
              </button>
            </div>

            {activeTransfer && (
              <TransactionStatus
                transferId={activeTransfer.id}
                isOpen={showTransactionStatus}
                onClose={() => {
                  setShowTransactionStatus(false);
                  resetTransfer();
                }}
                onComplete={onTransferComplete}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});