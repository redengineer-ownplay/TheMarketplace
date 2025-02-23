'use client'

import { Protected } from '@/components/Protected'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { TransactionHistory } from '@/components/transactions/TransactionHistory'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useWallet } from '@/providers/WalletProvider'

export default function ProfilePage() {
  const { address } = useWallet()
  return (
    <Protected>
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500">Wallet Address</h3>
            <p className="mt-1 text-base font-mono">{address}</p>
          </div>
            <ProfileForm />
          </CardContent>
        </Card>

        <TransactionHistory />
      </div>
    </Protected>
  )
}