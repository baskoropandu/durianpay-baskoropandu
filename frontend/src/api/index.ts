import { request } from './client';
import type { components } from './generated';

/**
 * Typed API functions for the Durianpay dashboard backend.
 * These mirror the endpoints defined in openapi.yaml and use the
 * generated types from `generated.ts`.
 */

export type User = components['schemas']['User'];
export type Payment = components['schemas']['Payment'];
export type PaymentStatus = Payment['status'];
export type PaymentSummary = components['schemas']['Summary'];

/** Paginated payments response. */
export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  summary?: PaymentSummary;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PaymentListParams {
  /** Filter by status: completed | processing | failed */
  status?: PaymentStatus;
  /** Sort field, prefix `-` for descending, e.g. `-created_at` */
  sort?: string;
  /** Filter by payment id */
  id?: string;
  /** Page number (1-based) */
  page?: number;
  /** Number of payments per page */
  limit?: number;
}

/** POST /dashboard/v1/auth/login */
export async function login(body: LoginRequest): Promise<User> {
  return request<User>('POST', '/dashboard/v1/auth/login', { body });
}

/** GET /dashboard/v1/payments */
export async function listPayments(params: PaymentListParams = {}): Promise<PaymentListResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.sort) query.set('sort', params.sort);
  if (params.id) query.set('id', params.id);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  const path = qs ? `/dashboard/v1/payments?${qs}` : '/dashboard/v1/payments';
  return request<PaymentListResponse>('GET', path);
}
