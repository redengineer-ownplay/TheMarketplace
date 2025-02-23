import useSWRImmutable from 'swr/immutable';
import { EndpointsKeys } from '@/services/api';
import { getTransactions } from './index';
import { GetTransactionsPathParams, GetTransactionsQueryParams } from '@/types/api/transaction';

export const useGetTransactions = (
  urlPathParams: GetTransactionsPathParams,
  queryParams?: GetTransactionsQueryParams,
) => {
  return useSWRImmutable(
    `${EndpointsKeys.getTransactions}-${JSON.stringify(urlPathParams)}-${JSON.stringify(
      queryParams,
    )}`,
    () => getTransactions(urlPathParams, queryParams),
  );
};
