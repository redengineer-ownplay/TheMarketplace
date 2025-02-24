'use client';

import { type ReactNode, createContext, useRef, useContext } from 'react';

import { createAppStore, initAppStore } from '@/store';
import { type GlobalStore } from '@/store/types';
import {
  createSelectorFunctions,
  createSelectorHooks,
  ZustandFuncSelectors,
  ZustandHookSelectors,
} from 'auto-zustand-selectors-hook';

export type AppStoreApi = ReturnType<typeof createAppStore>;

let appStore: AppStoreApi;

export const AppStoreContext = createContext<AppStoreApi | undefined>(undefined);

export interface AppStoreProviderProps {
  children: ReactNode;
}

export const getAppStore = (): AppStoreApi => {
  if (!appStore) {
    appStore = createAppStore(initAppStore());
  }
  return appStore;
};

export const AppStoreProvider = ({ children }: AppStoreProviderProps) => {
  const storeRef = useRef<AppStoreApi>(null);
  if (!storeRef.current) {
    storeRef.current = getAppStore();
  }

  return <AppStoreContext.Provider value={storeRef.current}>{children}</AppStoreContext.Provider>;
};

/**
 * Create a hook to use the store with hook selectors
 * @documentation https://github.com/Albert-Gao/auto-zustand-selectors-hook
 * @returns The store hook with the necessary selectors and hooks.
 */
export const useAppStoreHook = () => {
  const appStoreContext = useContext(AppStoreContext);

  if (!appStoreContext) {
    throw new Error(`useAppStoreHook must be used within AppStoreProvider`);
  }

  return createSelectorHooks(appStoreContext) as typeof appStoreContext &
    ZustandHookSelectors<GlobalStore>;
};

/**
 * Create a hook to use the store with non-hook selectors
 * @documentation https://github.com/Albert-Gao/auto-zustand-selectors-hook
 * @returns The store hook with the necessary selectors and non-hooks.
 */
export const useAppStore = () => {
  const appStoreContext = useContext(AppStoreContext);

  if (!appStoreContext) {
    throw new Error(`useAppStore must be used within AppStoreProvider`);
  }

  return createSelectorFunctions(appStoreContext) as typeof appStoreContext &
    ZustandFuncSelectors<GlobalStore>;
};
