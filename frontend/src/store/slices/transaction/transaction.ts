import { StateCreator } from 'zustand';
import { createComputed } from 'zustand-computed';
import { GlobalStore } from '@/store/types';
import { Transaction } from '@/types/api';

export interface TransactionState {
  transactions: Transaction[];

  transactionListHasMore: boolean;
  transactionListOffset: number;
  transactionListTotal: number;
}

/**
 * Transaction computed state
 */
export type TransactionComputed = {
  hasTransactions: boolean;
};

const computed = createComputed<TransactionState, TransactionComputed>(state => ({
  hasTransactions: state.transactions.length > 0,
}));

/**
 * Transaction actions
 */
export interface TransactionActions {
  setTransactions: (transactions: Transaction[]) => void;
  appendTransactions: (transactions: Transaction[]) => void;

  setTransactionListHasMore: (hasMore: boolean) => void;
  setTransactionListOffset: (offset: number) => void;
  setTransactionListTotal: (total: number) => void;

  clearTransactions: () => void;
}

/**
 * Transaction slice
 */
export type TransactionSlice = TransactionState & TransactionComputed & TransactionActions;

/**
 * Default state for the transaction state
 */
export const defaultInitState: TransactionState = {
  transactions: [],

  transactionListHasMore: false,
  transactionListOffset: 0,
  transactionListTotal: 0,
};

export const createTransactionState: StateCreator<
  GlobalStore,
  [['zustand/devtools', never], ['chrisvander/zustand-computed', TransactionComputed]],
  [['chrisvander/zustand-computed', TransactionComputed]],
  TransactionSlice
> = computed(set => ({
  ...defaultInitState,

  setTransactions: (transactions: Transaction[]) => set({ transactions }),
  appendTransactions: (newTransactions: Transaction[]) =>
    set(state => ({
      transactions: [...state.transactions, ...newTransactions],
    })),

  setTransactionListHasMore: (transactionListHasMore: boolean) => set({ transactionListHasMore }),
  setTransactionListOffset: (transactionListOffset: number) => set({ transactionListOffset }),
  setTransactionListTotal: (transactionListTotal: number) => set({ transactionListTotal }),

  clearTransactions: () =>
    set(() => ({
      transactions: [],
      transactionListHasMore: false,
      transactionListOffset: 0,
      transactionListTotal: 0,
    })),
}));
