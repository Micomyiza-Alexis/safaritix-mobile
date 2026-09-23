import { API_BASE_URL } from '@/config/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status = 0, data: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = RequestInit & {
  token?: string | null;
  timeout?: number;
};

const DEFAULT_TIMEOUT = 15000;

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    token,
    timeout = DEFAULT_TIMEOUT,
    headers,
    ...fetchOptions
  } = options;

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') || '';

    let data: unknown = null;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message =
        typeof data === 'object' &&
        data !== null &&
        'error' in data &&
        typeof data.error === 'string'
          ? data.error
          : `Request failed with status ${response.status}`;

      throw new ApiError(message, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'The request took too long. Please check your connection and try again.',
      );
    }

    if (error instanceof Error) {
      throw new ApiError(
        error.message || 'Network request failed. Please try again.',
      );
    }

    throw new ApiError('An unexpected network error occurred.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get<T>(
    path: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ) {
    return apiRequest<T>(path, {
      ...options,
      method: 'GET',
    });
  },

  post<T>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions, 'method'> = {},
  ) {
    return apiRequest<T>(path, {
      ...options,
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },

  put<T>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions, 'method'> = {},
  ) {
    return apiRequest<T>(path, {
      ...options,
      method: 'PUT',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },

  patch<T>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions, 'method'> = {},
  ) {
    return apiRequest<T>(path, {
      ...options,
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },

  delete<T>(
    path: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ) {
    return apiRequest<T>(path, {
      ...options,
      method: 'DELETE',
    });
  },
};