'use client'

import { PropsWithChildren, Suspense } from "react";
import { WalletProvider } from './WalletProvider'
import { AppStoreProvider } from './store';

export function Providers({ children }: PropsWithChildren) {
  return (
    <Suspense>
        <AppStoreProvider>
          <WalletProvider>{children}</WalletProvider>
      </AppStoreProvider>
    </Suspense>
  )
}