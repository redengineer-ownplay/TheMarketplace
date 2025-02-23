import { api } from '@/services/api';
import { LoginRequest, LoginResponse } from '@/types/api/auth';
import { getAppStore } from '@/providers/store';

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.login({
    body,
  });

  const response = data.data;

  localStorage.setItem('jwt_token', response.token);
  localStorage.setItem('wallet_address', response.user.walletAddress);

  if (response.user.username) {
    const { setUserProfile } = getAppStore().getState();
    setUserProfile({
      id: response.user.id,
      wallet_address: response.user.walletAddress,
      username: response.user.username,
      display_name: null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return response;
}

export function logout(): void {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('wallet_address');

  const { clearUserProfile } = getAppStore().getState();
  clearUserProfile();
}

export function getStoredAuth(): { token: string | null; walletAddress: string | null } {
  return {
    token: localStorage.getItem('jwt_token'),
    walletAddress: localStorage.getItem('wallet_address'),
  };
}
