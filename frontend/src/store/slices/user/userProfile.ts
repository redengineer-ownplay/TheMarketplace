/**
 * UserProfile state
 */

import { StateCreator } from 'zustand';
import { createComputed } from 'zustand-computed';
import { GlobalStore } from '@/store/types';
import { ProfileData } from '@/types/api';

export interface UserProfileState {
  profile: ProfileData;
}

/**
 * UserProfile computed
 */
export type UserProfileComputed = object;

/**
 * This is an example of a UserProfile state that depends on other states.
 * @documentation https://github.com/chrisvander/zustand-computed
 */
const computed = createComputed(() => ({}));

/**
 * UserProfile actions
 */
export interface UserProfileActions {
  setUserProfile: (profile: ProfileData) => void;
  clearUserProfile: () => void;
}

/**
 * UserProfile slice
 */
export type UserProfileSlice = UserProfileState & UserProfileComputed & UserProfileActions;

/**
 * Default state for the user profile state.
 */
export const defaultInitState: UserProfileState = {
  profile: {
    id: '',
    username: '',
    display_name: '',
    bio: '',
    wallet_address: '',
    created_at: '',
    updated_at: '',
  },
};

export const createUserProfileState: StateCreator<
  GlobalStore,
  [['zustand/devtools', never], ['chrisvander/zustand-computed', UserProfileComputed]],
  [['chrisvander/zustand-computed', UserProfileComputed]],
  UserProfileSlice
> = computed(set => ({
  ...defaultInitState,
  setUserProfile: (profile: ProfileData) => set({ profile }),
  clearUserProfile: () => set({ profile: defaultInitState.profile }),
}));
