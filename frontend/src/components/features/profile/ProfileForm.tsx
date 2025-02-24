import { useEffect, useState } from 'react';
import { useWallet } from '@/providers/WalletProvider';
import { useToast } from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';
import { useGetUserProfile } from '@/services/api/userProfile/hooks';
import { useAppStore } from '@/store';
import { UpdateProfileRequest } from '@/types/api/userProfile';
import { updateUserProfile } from '@/services/api/userProfile';

interface ProfileFormData {
  username: string;
  display_name: string;
  bio: string;
}

export function ProfileForm() {
  const { address } = useWallet();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const profile = useAppStore().use.profile();
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    display_name: '',
    bio: '',
  });

  const { isLoading } = useGetUserProfile({
    walletAddress: address || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData: UpdateProfileRequest = {
        username: formData.username,
        displayName: formData.display_name || undefined,
        bio: formData.bio || undefined,
      };

      await updateUserProfile(updateData);

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in space-y-6">
      <div className="form-group">
        <label className="mb-2 block text-sm font-medium" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={formData.username}
          onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
          className="input w-full"
          required
          pattern="^[a-zA-Z0-9_]+$"
          minLength={3}
          maxLength={30}
        />
        <p className="mt-1 text-sm text-muted-foreground">
          Only letters, numbers, and underscores. Length: 3-30 characters
        </p>
      </div>

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium" htmlFor="display-name">
          Display Name
        </label>
        <input
          id="display-name"
          type="text"
          value={formData.display_name}
          onChange={e => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
          className="input w-full"
          maxLength={50}
        />
      </div>

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          className="input w-full resize-none"
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="button button-primary flex items-center space-x-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  );
}
