import { ErrorState, ErrorSlice } from '@/store/slices/error';
import { UserProfileSlice, UserProfileState } from '@/store/slices/user/userProfile';
import { NFTSlice, NFTState } from './slices/nft/nft';
import { TransactionSlice, TransactionState } from './slices/transaction/transaction';

/**
 * The global store state.
 */
export type StoreState = ErrorState & UserProfileState & NFTState & TransactionState;

/**
 * The global store.
 */
export type GlobalStore = ErrorSlice & UserProfileSlice & NFTSlice & TransactionSlice;
