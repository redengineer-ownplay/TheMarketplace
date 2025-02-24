import useSWRImmutable from 'swr/immutable';
import { EndpointsKeys } from '@/services/api';
import {
  getUserProfile,
  getUserProfileByUsername,
  updateUserProfile,
} from '@/services/api/userProfile';
import {
  GetProfileByUsernamePathParams,
  GetProfilePathParams,
  UpdateProfileRequest,
} from '@/types/api/userProfile';

export const useGetUserProfile = (urlPathParams: GetProfilePathParams) => {
  return useSWRImmutable(`${EndpointsKeys.getUserProfile}-${JSON.stringify(urlPathParams)}`, () =>
    getUserProfile(urlPathParams),
  );
};

export const useUpdateUserProfile = (body: UpdateProfileRequest) => {
  return useSWRImmutable(`${EndpointsKeys.updateUserProfile}-${JSON.stringify(body)}`, () =>
    updateUserProfile(body),
  );
};

export const useGetUserProfileByUsername = (urlPathParams: GetProfileByUsernamePathParams) => {
  return useSWRImmutable(
    `${EndpointsKeys.getUserProfileByUsername}-${JSON.stringify(urlPathParams)}`,
    () => getUserProfileByUsername(urlPathParams),
  );
};
