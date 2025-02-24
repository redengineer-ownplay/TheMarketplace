'use client';

import { Protected } from '@/components/features/wallet/Protected';
import { ProfileForm } from '@/components/features/profile/ProfileForm';
import { TransactionHistory } from '@/components/features/transactions/TransactionHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useWallet } from '@/providers/WalletProvider';

export default function ProfilePage() {
  const { address } = useWallet();
  return (
    <Protected>
      <div className="mx-auto max-w-3xl space-y-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground">Wallet Address</h3>
              <p className="mt-1 truncate rounded-md bg-secondary/10 p-2 font-mono text-base">
                {address}
              </p>
            </div>
            <ProfileForm />
          </CardContent>
        </Card>

        <TransactionHistory />
      </div>
    </Protected>
  );
}
