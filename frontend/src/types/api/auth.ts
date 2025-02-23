import type { Endpoint } from 'fetchff';
import { ApiResponse } from '@/types/api';

export interface AuthMethods {
  /**
   * Endpoint for wallet-based authentication
   */
  login: Endpoint<LoginResponse, never, never, LoginRequest>;
}

export interface LoginRequest {
  walletAddress: string;
  message: string;
  signature: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    walletAddress: string;
    username: string | null;
  };
}

export type WalletAuthResponse = ApiResponse<LoginResponse>;
