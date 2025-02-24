import { StateCreator } from 'zustand';
import { createComputed } from 'zustand-computed';
import { GlobalStore } from '@/store/types';
import { NFT } from '@/types/nft';
import { TransactionStatus } from '@/types/api';

export type TransferStatusType = 'warning' | 'success' | 'error' | 'pending' | 'unknown';

export interface NFTState {
  nfts: NFT[];

  nftListHasMore: boolean;
  nftListOffset: number;
  nftListTotal: number;

  activeTransfer: TransactionStatus | null;
  isTransferring: boolean;
  transferStatus: string;
  transferStatusType: TransferStatusType;
}

/**
 * NFT computed state
 */
export type NFTComputed = {
  hasNFTs: boolean;
};

const computed = createComputed<NFTState, NFTComputed>(state => ({
  hasNFTs: state.nfts.length > 0,
}));

/**
 * NFT actions
 */
export interface NFTActions {
  setNFTs: (nfts: NFT[]) => void;
  appendNFTs: (nfts: NFT[]) => void;

  setNFTListHasMore: (hasMore: boolean) => void;
  setNFTListOffset: (offset: number) => void;
  setNFTListTotal: (total: number) => void;

  setActiveTransfer: (transfer: TransactionStatus | null) => void;
  setTransferring: (isTransferring: boolean) => void;
  setTransferStatus: (status: string, type: TransferStatusType) => void;

  clearNFTs: () => void;
  resetTransfer: () => void;
}

/**
 * NFT slice
 */
export type NFTSlice = NFTState & NFTComputed & NFTActions;

/**
 * Default state for the NFT state
 */
export const defaultInitState: NFTState = {
  nfts: [],

  nftListHasMore: false,
  nftListOffset: 0,
  nftListTotal: 0,

  activeTransfer: null,
  isTransferring: false,
  transferStatus: '',
  transferStatusType: 'unknown',
};

export const createNFTState: StateCreator<
  GlobalStore,
  [['zustand/devtools', never], ['chrisvander/zustand-computed', NFTComputed]],
  [['chrisvander/zustand-computed', NFTComputed]],
  NFTSlice
> = computed(set => ({
  ...defaultInitState,

  setNFTs: (nfts: NFT[]) => set({ nfts }),
  appendNFTs: (newNfts: NFT[]) => set(state => ({ nfts: [...state.nfts, ...newNfts] })),

  setNFTListHasMore: (nftListHasMore: boolean) => set({ nftListHasMore }),
  setNFTListOffset: (nftListOffset: number) => set({ nftListOffset }),
  setNFTListTotal: (nftListTotal: number) => set({ nftListTotal }),

  setActiveTransfer: (activeTransfer: TransactionStatus | null) => set({ activeTransfer }),
  setTransferring: (isTransferring: boolean) => set({ isTransferring }),
  setTransferStatus: (transferStatus: string, transferStatusType: TransferStatusType) =>
    set({ transferStatus, transferStatusType }),

  clearNFTs: () =>
    set(() => ({
      nfts: [],
      nftListHasMore: false,
      nftListOffset: 0,
      nftListTotal: 0,
    })),
  resetTransfer: () =>
    set(() => ({
      activeTransfer: null,
      isTransferring: false,
      transferStatus: '',
    })),
}));
