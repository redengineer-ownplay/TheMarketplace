'use client';

import { StateCreator } from 'zustand';
import { GlobalStore } from '@/store/types';

export interface ErrorMessage {
  message: string;
  type: ErrorType;
  meta?: object;
}

/**
 * The error actions.
 */
export interface ErroActions {
  setErrors: (message: ErrorMessage[]) => void;
  clearErrors: () => void;
}

export type ErrorType = 'API_ERROR' | 'GENERIC_CLIENT_ERROR' | 'NETWORK_ERROR' | '';

/**
 * The error state.
 */
export interface ErrorState {
  errors: ErrorMessage[];
}

/**
 * The error slice.
 */
export type ErrorSlice = ErrorState & ErroActions;

/**
 * Default state for the error state.
 */
export const defaultInitState: ErrorState = {
  errors: [],
};

/**
 * This is an example of an error state.
 * @param set
 * @returns
 */

export const createErrorState: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  ErrorSlice
> = set => ({
  ...defaultInitState,
  setErrors: errors => set({ errors }),
  clearErrors: () => set({ errors: [] }),
});
