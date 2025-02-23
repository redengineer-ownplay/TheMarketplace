import type { Endpoint, QueryParams, UrlPathParams } from "fetchff";
import { ApiResponse, ProfileData } from '@/types/api';

export interface UserMethods {
  /**
   * Endpoint for retrieving user profile
   * @type {Endpoint}
   * @name getUserProfile
   * @description Returns the user profile
   * @example
   * const { data } = await api.getUserProfile();
   * console.log(data); // Outputs the user profile details
   * 
   * @responses
   * {
   *   "200": {
               data: {
                  "id": "ba6fdb91-1df7-474c-b008-caf19616d481",
                  "wallet_address": "0x9ce69a314330687f1fb1ad1d397a0bb55d5e1d22",
                  "username": "redgamedev",
                  "display_name": "Red123588",
                  "bio": "test12388",
                  "created_at": "2025-02-18T05:19:12.538712+00:00",
                  "updated_at": "2025-02-22T19:48:58.609557+00:00"
               }
        }
        "401": {
            "statusCode": 401,
            "message": "Unauthorized",
            "timestamp": "2024-11-18T09:08:17.425Z"
        },
        "400": {
            "statusCode": 400,
            "message": "DataValidation",
            "details": []
            "timestamp": "2024-11-18T09:08:17.425Z"
        }
   * }
   */
  getUserProfile: Endpoint<GetUserProfileResponse, QueryParams, GetProfilePathParams>;

  /**
   * Endpoint for update user profile
   * @type {Endpoint}
   * @name updateUserProfile
   * @description Returns the user profile
   * @example
   * const { data } = await api.updateUserProfile();
   * console.log(data); // Outputs the user profile details
   * 
   * @responses
   * {
   *   "200": {
               data: {
                  "id": "ba6fdb91-1df7-474c-b008-caf19616d481",
                  "wallet_address": "0x9ce69a314330687f1fb1ad1d397a0bb55d5e1d22",
                  "username": "redgamedev",
                  "display_name": "Red123588",
                  "bio": "test12388",
                  "created_at": "2025-02-18T05:19:12.538712+00:00",
                  "updated_at": "2025-02-22T19:48:58.609557+00:00"
               }
        }
        "401": {
            "statusCode": 401,
            "message": "Unauthorized",
            "timestamp": "2024-11-18T09:08:17.425Z"
        },
        "400": {
            "statusCode": 400,
            "message": "DataValidation",
            "details": []
            "timestamp": "2024-11-18T09:08:17.425Z"
        }
   * }
   */
  updateUserProfile: Endpoint<UpdateUserProfileResponse, QueryParams, UrlPathParams, UpdateProfileRequest>;

  /**
   * Endpoint for retrieving user profile by username
   * @type {Endpoint}
   * @name getUserProfileByUsername
   * @description Returns the user profile
   * @example
   * const { data } = await api.getUserProfileByUsername();
   * console.log(data); // Outputs the user profile details
   * 
   * @responses
   * {
   *   "200": {
               data: {
                  "id": "ba6fdb91-1df7-474c-b008-caf19616d481",
                  "wallet_address": "0x9ce69a314330687f1fb1ad1d397a0bb55d5e1d22",
                  "username": "redgamedev",
                  "display_name": "Red123588",
                  "bio": "test12388",
                  "created_at": "2025-02-18T05:19:12.538712+00:00",
                  "updated_at": "2025-02-22T19:48:58.609557+00:00"
               }
        }
        "404": {
            "statusCode": 404,
            "message": "Not Found",
            "details": []
            "timestamp": "2024-11-18T09:08:17.425Z"
        }
   * }
   */
  getUserProfileByUsername: Endpoint<
    GetUserProfileByUsenrameResponse,
    QueryParams,
    GetProfileByUsernamePathParams
  >;
}

export interface GetProfilePathParams {
  walletAddress: string
}

export interface GetProfileByUsernamePathParams {
  username: string;
}

export interface UpdateProfileRequest {
  username: string;
  displayName?: string;
  bio?: string;
}

export type UpdateUserProfileResponse = ApiResponse<ProfileData>;

export type GetUserProfileResponse = ApiResponse<ProfileData>;

export type GetUserProfileByUsenrameResponse = ApiResponse<ProfileData>;


