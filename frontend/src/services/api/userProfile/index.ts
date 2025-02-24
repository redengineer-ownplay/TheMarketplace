import { getAppStore } from '@/providers/store';
import { api } from '@/services/api';
import { ProfileData } from '@/types/api';
import {
  GetProfileByUsernamePathParams,
  GetProfilePathParams,
  UpdateProfileRequest,
} from '@/types/api/userProfile';

export async function getUserProfile(urlPathParams: GetProfilePathParams): Promise<ProfileData> {
  const { setUserProfile } = getAppStore().getState();

  const { data } = await api.getUserProfile({
    urlPathParams,
  });

  setUserProfile(data.data);

  return data.data;
}

export async function updateUserProfile(body: UpdateProfileRequest): Promise<ProfileData> {
  const { setUserProfile } = getAppStore().getState();

  const { data } = await api.updateUserProfile({
    body,
  });

  setUserProfile(data.data);

  return data.data;
}

export async function getUserProfileByUsername(
  urlPathParams: GetProfileByUsernamePathParams,
): Promise<ProfileData> {
  const { data } = await api.getUserProfileByUsername({
    urlPathParams,
  });

  return data.data;
}
