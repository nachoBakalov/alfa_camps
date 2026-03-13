import { ApiClientError, normalizeApiError } from '../lib/errors';
import { getAccessToken } from '../store/auth.store';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type RequestOptions = {
  token?: string | null;
  headers?: Record<string, string>;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';

function resolveToken(explicitToken?: string | null): string | null {
  if (explicitToken !== undefined) {
    return explicitToken;
  }

  return getAccessToken();
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function request<TResponse>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
  const token = resolveToken(options.token);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    const normalized = normalizeApiError(payload, {
      statusCode: response.status,
      path,
      message: response.statusText,
    });

    throw new ApiClientError(normalized);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (payload as TResponse) ?? ({} as TResponse);
}

async function requestFormData<TResponse>(
  method: HttpMethod,
  path: string,
  body: FormData,
  options: RequestOptions = {},
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
  const token = resolveToken(options.token);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    const normalized = normalizeApiError(payload, {
      statusCode: response.status,
      path,
      message: response.statusText,
    });

    throw new ApiClientError(normalized);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (payload as TResponse) ?? ({} as TResponse);
}

export function apiGet<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
  return request<TResponse>('GET', path, undefined, options);
}

export function apiPost<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
  options?: RequestOptions,
): Promise<TResponse> {
  return request<TResponse>('POST', path, body, options);
}

export function apiPatch<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
  options?: RequestOptions,
): Promise<TResponse> {
  return request<TResponse>('PATCH', path, body, options);
}

export function apiDelete<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
  return request<TResponse>('DELETE', path, undefined, options);
}

export function apiPostFormData<TResponse>(
  path: string,
  body: FormData,
  options?: RequestOptions,
): Promise<TResponse> {
  return requestFormData<TResponse>('POST', path, body, options);
}
