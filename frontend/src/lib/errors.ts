export type ApiErrorResponse = {
  statusCode: number;
  error: string;
  message: string;
  details: string[] | null;
  timestamp: string;
  path: string;
};

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly error: string;
  public readonly details: string[] | null;
  public readonly timestamp: string;
  public readonly path: string;

  constructor(payload: ApiErrorResponse) {
    super(payload.message);
    this.name = 'ApiClientError';
    this.statusCode = payload.statusCode;
    this.error = payload.error;
    this.details = payload.details;
    this.timestamp = payload.timestamp;
    this.path = payload.path;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function normalizeApiError(
  payload: unknown,
  fallback: { statusCode: number; path: string; message?: string },
): ApiErrorResponse {
  if (isObject(payload)) {
    const statusCode =
      typeof payload.statusCode === 'number' ? payload.statusCode : fallback.statusCode;
    const error = typeof payload.error === 'string' ? payload.error : 'Request Error';
    const message =
      typeof payload.message === 'string'
        ? payload.message
        : fallback.message ?? 'Request failed';
    const details = Array.isArray(payload.details)
      ? payload.details.filter((item): item is string => typeof item === 'string')
      : null;
    const timestamp =
      typeof payload.timestamp === 'string' ? payload.timestamp : new Date().toISOString();
    const path = typeof payload.path === 'string' ? payload.path : fallback.path;

    return {
      statusCode,
      error,
      message,
      details,
      timestamp,
      path,
    };
  }

  return {
    statusCode: fallback.statusCode,
    error: 'Request Error',
    message: fallback.message ?? 'Request failed',
    details: null,
    timestamp: new Date().toISOString(),
    path: fallback.path,
  };
}
