import { ApiErrorResponse } from "@/types/api";
import type { ResponseError } from "fetchff";

export class RPCError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "RPCError";
  }
}

export type GenericErrorResponse<Details> = ApiErrorResponse<Details>

/**
 * Handles a fetchff ResponseError by updating the global error state in the Zustand store and rethrowing the error.
 *
 * @param {ResponseError<GenericErrorResponse>} error - The error to handle.
 */
export const handleErrorResponse = async (
  error: ResponseError<GenericErrorResponse<[]>>,
): Promise<void> => {
  if (error.status === 401) {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('wallet_address');
    window.location.href = '/';
  }

  if (error.response) {
    console.error('API error', error.response);
  } else {
    console.error('API Network Error', error);
  }
};
