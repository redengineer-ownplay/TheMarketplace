'use client'

import { useEffect, useState } from 'react'
import type { UpdateProfileRequest } from '@/types/api/userProfile'
import { useToast } from '@/hooks/useToast'
import { useWallet } from '@/providers/WalletProvider'
import { Loader2 } from 'lucide-react'
import { useGetUserProfile } from '@/services/api/userProfile/hooks'
import { useAppStore } from '@/store'
import { updateUserProfile } from '@/services/api/userProfile'

interface ProfileFormDataState {
  username: string
  display_name: string
  bio: string
}

export function ProfileForm() {
  const { address } = useWallet()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const profile = useAppStore().use.profile();
  const [newProfileData, setNewProfileData] = useState<ProfileFormDataState>({
    username: profile?.username || '',
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
  })
  const { isLoading } = useGetUserProfile({
    walletAddress: address || ""
  })

  useEffect(() => {
    setNewProfileData({
      username: profile?.username || '',
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
    })
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      const updateData: UpdateProfileRequest = {
        username: newProfileData?.username || '',
        displayName: newProfileData?.display_name || undefined,
        bio: newProfileData?.bio || undefined
      }

      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined)
      );

      await updateUserProfile(cleanedData as UpdateProfileRequest)

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={newProfileData?.username || ''}
            onChange={(e) => setNewProfileData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full p-2 border rounded-md"
            required
            pattern="^[a-zA-Z0-9_]+$"
            minLength={3}
            maxLength={30}
          />
          <p className="mt-1 text-sm text-gray-500">
            Only letters, numbers, and underscores. Length: 3-30 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="display-name">
            Display Name
          </label>
          <input
            id="display-name"
            type="text"
            value={newProfileData?.display_name || ''}
            onChange={(e) => setNewProfileData(prev => ({ ...prev, display_name: e.target.value }))}
            className="w-full p-2 border rounded-md"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            value={newProfileData?.bio || ''}
            onChange={(e) => setNewProfileData(prev => ({ ...prev, bio: e.target.value }))}
            className="w-full p-2 border rounded-md"
            rows={3}
            maxLength={500}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  )
}
