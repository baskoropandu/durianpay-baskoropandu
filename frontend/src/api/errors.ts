/**
 * API error shape returned by the backend.
 * Matches the `Error` schema in openapi.yaml.
 */
export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * A typed error thrown by the API client when a request fails.
 * Carries the HTTP status code and the parsed error body when available.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null, message?: string) {
    super(message ?? body?.message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}
