import { useQuery } from '@tanstack/react-query';
import { listPayments, PaymentListParams } from '../api';

/**
 * Fetch payments from the API with TanStack Query.
 * The query key includes the filter params so changing the filter refetches.
 */
export function usePayments(params: PaymentListParams = {}) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => listPayments(params),
  });
}
