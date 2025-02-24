'use client'

import { memo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { toast } from '@/hooks/useToast';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useGetTransactionStatus } from '@/services/api/nft/hooks';
import { useAppStore } from '@/store';

interface TransactionStatusProps {
  transferId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const TransactionStatus = memo(function TransactionStatus({ 
  transferId, 
  isOpen, 
  onClose, 
  onComplete 
}: TransactionStatusProps) {
  const activeTransfer = useAppStore().use.activeTransfer();
  const { setActiveTransfer, resetTransfer } = useAppStore().getState();

  const { data: transaction, error } = useGetTransactionStatus(
    { id: transferId }
  );

  useEffect(() => {
    if (!transferId || !isOpen) return;

    if (error) {
      console.error('Error checking transaction status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to check transaction status',
        variant: 'destructive',
      });
      return;
    }

    if (transaction) {
      setActiveTransfer(transaction);

      if (transaction.status === 'completed') {
        toast({
          title: 'Success',
          description: 'NFT transferred successfully!',
          duration: 5000,
        });
        onComplete();
        setTimeout(() => {
          onClose();
          resetTransfer();
        }, 2000);
      } else if (transaction.status === 'failed') {
        toast({
          title: 'Error',
          description: transaction.error || 'Transfer failed',
          variant: 'destructive',
          duration: 5000,
        });
      }
    }
  }, [transferId, isOpen, transaction, error, setActiveTransfer, resetTransfer, onComplete, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Status</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="flex flex-col items-center justify-center">
            {!activeTransfer || activeTransfer.status === 'pending' ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="mt-4 text-lg">Processing transaction...</p>
                <p className="mt-2 text-sm text-gray-500">
                  Please wait while your transaction is being processed
                </p>
              </div>
            ) : activeTransfer.status === 'completed' ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <p className="mt-4 text-lg">Transaction completed!</p>
                {activeTransfer.txHash && (
                  <a
                    href={`https://polygonscan.com/tx/${activeTransfer.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm text-blue-500 hover:text-blue-600 flex items-center"
                  >
                    View on PolygonScan
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <XCircle className="w-12 h-12 text-red-500" />
                <p className="mt-4 text-lg">Transaction failed</p>
                {activeTransfer?.error && (
                  <p className="mt-2 text-sm text-red-600 text-center">
                    {activeTransfer.error}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
})