'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { useToast } from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';
import Web3 from 'web3';
import { TransactionStatus } from '@/components/features/transactions/TransactionStatus';
import { useAppStore } from '@/store';
import { useWallet } from '@/providers/WalletProvider';
import { NFT } from '@/types/nft';
import { getUserProfileByUsername } from '@/services/api/userProfile';
import { useTransferNFT } from '@/services/api/nft/hooks';

interface TransferModalProps {
  nft: NFT;
  isOpen: boolean;
  onClose: () => void;
  onTransferComplete: () => void;
}

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

export function TransferModal({ nft, isOpen, onClose, onTransferComplete }: TransferModalProps) {
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
  const { setTransferStatus, resetTransfer, setActiveTransfer, setTransferring } = useAppStore().getState();

  useEffect(() => {
    if (!isOpen) {
      resetTransfer();
      setRecipientUsername('');
      setRecipientAddress('');
      setShowTransactionStatus(false);
    }
  }, [isOpen, resetTransfer]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (recipientUsername) {
        validateUsername(recipientUsername);
      } else {
        setRecipientAddress('');
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [recipientUsername]);

  const validateUsername = async (username: string) => {
    setIsValidating(true);
    try {
      const response = await getUserProfileByUsername({ username });

      if (response?.wallet_address) {
        setRecipientUsername(response.username || '');
        setRecipientAddress(response.wallet_address);
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
  };

  const waitForTransaction = async (web3: Web3, txHash: string): Promise<void> => {
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
  };

  const handleTransfer = async () => {
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
        recipient: address,
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId,
        tokenType: nft.tokenType,
      })
      
      const transferId = response.id
      
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

      setTransferStatus('Requesting approval...');
      const approvalTx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: nft.contractAddress,
          data: contract.methods.setApprovalForAll(nft.contractAddress, true).encodeABI()
        }],
      });

      setTransferStatus('Waiting for approval confirmation...');
      await waitForTransaction(web3, approvalTx);

      setTransferStatus('Transferring NFT...');
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

      setTransferStatus('Waiting for transfer confirmation...');
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
      onClose();

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
        } catch (updateError) {
          console.error('Failed to update transfer status:', updateError);
        }
      }
    } finally {
      setTransferring(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer NFT</DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">{nft?.metadata?.name || 'NFT'}</h3>
              <p className="text-sm text-gray-500">Token ID: {nft?.tokenId}</p>
              <p className="text-sm text-gray-500">Type: {nft?.tokenType}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Username
              </label>
              <input
                type="text"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter username"
                disabled={isTransferring}
              />
              {isValidating && (
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating username...
                </p>
              )}
              {recipientAddress && (
                <p className="text-sm text-green-600 mt-1">Recipient found!</p>
              )}
            </div>

            {transferStatus && (
              <div className="text-sm text-blue-600 flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {transferStatus}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                disabled={isTransferring}
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={isTransferring || !recipientAddress}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
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
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
}