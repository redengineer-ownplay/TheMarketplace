import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { NFT } from '@/types/nft';
import { LoadingSpinner } from '@/components/ui/progress/LoadingSpinner';

interface TransactionConfirmationProps {
  nft: NFT;
  recipientUsername: string;
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TransactionConfirmation({
  nft,
  recipientUsername,
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
}: TransactionConfirmationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm NFT Transfer</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to transfer the following NFT:
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <h3 className="font-medium">{nft.metadata.name}</h3>
              <p className="text-sm text-gray-500">Token ID: {nft.tokenId}</p>
              <p className="mt-2 text-sm text-gray-500">To: {recipientUsername}</p>
            </div>
            <p className="mt-4 font-medium text-amber-600">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={e => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            {isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Confirming...
              </div>
            ) : (
              'Confirm Transfer'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
