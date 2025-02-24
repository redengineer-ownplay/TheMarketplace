import { endpoints } from "@/config/api/endpoints";
import type {
  EndpointNames,
  EndpointsConfig,
  EndpointsMethods,
} from "@/config/api/types";
import { handleErrorResponse } from "@/services/apiErrorHandler";
import type { ApiHandlerConfig } from "fetchff";
import { createApiFetcher } from "fetchff";

type IEndpointKeys = {
  [key in EndpointNames]: key;
};

const keys: EndpointNames[] = Object.keys(endpoints) as EndpointNames[];
export const EndpointsKeys = {} as IEndpointKeys;

for (const key of keys) {
  // @ts-expect-error It's fine
  EndpointsKeys[key] = key;
}

export const apiConfig = {
  apiUrl: process.env.NEXT_PUBLIC_BACKEND_URL || '',
  endpoints,
  timeout: 10 * 60 * 1000,
  dedupeTime: 2000,
  cancellable: true,
  retry: {
    retries: 1,
    retryOn: [401],
    shouldRetry: async (error, attempt) => {
      if (error.status === 404) return false;

      if (error.status === 204 && error.request?.apiUrl?.includes('sse')) {
        return attempt < 1;
      }
      return attempt < 1;
    },
  },
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  withCredentials: true,
  onRequest(config) {
    const accessToken = localStorage.getItem('jwt_token');

    if (accessToken) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;
  },

  /**
   * Handles API errors globally. If an error occurs, it will be passed to `handleErrorResponse` and
   * the global state will be updated.
   * @param error The error that has occurred.
   */
  onError(error) {
    try {
      handleErrorResponse(error);
    } catch (error) {
      console.error('Error handling error', error);
      throw error;
    }
  },
  logger: {
    error(...args) {
      console.error('Error log', ...args);
    },
    warn(...args) {
      console.warn('Warning log', ...args);
    },
  },
  async onResponse(response) {
    console.table(response);

    return response;
  },
} satisfies ApiHandlerConfig<EndpointsConfig>;

export const api = createApiFetcher<EndpointsMethods, EndpointsConfig>(
  apiConfig,
);
