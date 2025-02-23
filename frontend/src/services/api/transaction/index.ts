import { getAppStore } from '@/providers/store';
import { api } from '@/services/api';
import { TransactionsResponse } from '@/types/api';
import { GetTransactionsPathParams, GetTransactionsQueryParams } from '@/types/api/transaction';

export async function getTransactions(
  urlPathParams: GetTransactionsPathParams,
  queryParams?: GetTransactionsQueryParams,
): Promise<TransactionsResponse> {
  const {
    setTransactions,
    appendTransactions,
    setTransactionListHasMore,
    setTransactionListTotal,
    setTransactionListOffset,
  } = getAppStore().getState();

  const { data } = await api.getTransactions({
    urlPathParams,
    params: queryParams,
  });

  const response = data.data;

  if (queryParams?.offset === 0) {
    setTransactions(response.data);
  } else {
    appendTransactions(response.data);
  }

  setTransactionListHasMore(response.hasMore);
  setTransactionListTotal(response.total);
  setTransactionListOffset(response.offset + response.limit);

  return response;
}
