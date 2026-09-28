import { API_BASE_URL } from '../config';
import { ApiError, ApiErrorBody } from './errors';

/**
 * Thin fetch wrapper used by the typed API client.
 * - Prefixes the configured base URL.
 * - Attaches the JWT bearer token when present.
 * - Parses JSON responses and throws typed ApiError on non-2xx.
 */

export interface RequestOptions {
  /** JSON body to send (will be stringified). */
  body?: unknown;
  /** Extra headers to merge in. */
  headers?: Record<string, string>;
  /** Bearer token to attach. Overrides the default token provider. */
  token?: string | null;
}

export type TokenProvider = () => string | null;

let tokenProvider: TokenProvider = () => null;

/** Register a function that returns the current auth token (e.g. from the store). */
export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

async function parseErrorBody(res: Response): Promise<ApiErrorBody | null> {
  try {
    const data = (await res.json()) as ApiErrorBody;
    return data;
  } catch {
    return null;
  }
}

/**
 * Perform a JSON request against the backend.
 * @param method HTTP method
 * @param path  Path starting with `/` (e.g. `/dashboard/v1/payments`)
 */
export async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const token = options.token !== undefined ? options.token : tokenProvider();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    // Network-level failure (backend down, CORS, etc.)
    throw new ApiError(0, null, `Network error reaching ${url}: ${(err as Error).message}`);
  }

  if (!res.ok) {
    const body = await parseErrorBody(res);
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
