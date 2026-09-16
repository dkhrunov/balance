import { ApiErrorResponse } from '@balance/contracts/common';
import { ApiError } from './api-error';

type ApiRequestOptionsWithoutBody = Omit<RequestInit, 'method' | 'body'>;

type SessionExpiredHandler = () => void;

const AUTH_PATHS_WITHOUT_RETRY = new Set(['/auth/login', '/auth/refresh', '/auth/logout']);

let onSessionExpired: SessionExpiredHandler = noopSessionExpiredHandler;
let pendingRefresh: Promise<void> | null = null;

/**
 * Registers a callback invoked when refresh fails after a 401,
 * indicating the session can no longer be restored.
 */
export function registerSessionExpiredHandler(handler: SessionExpiredHandler): void {
    onSessionExpired = handler;
}

/**
 * HTTP API client with cookie credentials and automatic token refresh on 401.
 */
export const ApiClient = {
    /**
     * Sends a GET request and returns the parsed JSON response body.
     */
    get<TResponse>(path: string, options: ApiRequestOptionsWithoutBody = {}): Promise<TResponse> {
        return request<TResponse>(path, { ...options, method: 'GET' });
    },

    /**
     * Sends a POST request with an optional JSON body.
     */
    post<TResponse>(path: string, body?: unknown, options: ApiRequestOptionsWithoutBody = {}): Promise<TResponse> {
        return request<TResponse>(path, withJsonBody('POST', body, options));
    },

    /**
     * Sends a PUT request with an optional JSON body.
     */
    put<TResponse>(path: string, body?: unknown, options: ApiRequestOptionsWithoutBody = {}): Promise<TResponse> {
        return request<TResponse>(path, withJsonBody('PUT', body, options));
    },

    /**
     * Sends a PATCH request with an optional JSON body.
     */
    patch<TResponse>(path: string, body?: unknown, options: ApiRequestOptionsWithoutBody = {}): Promise<TResponse> {
        return request<TResponse>(path, withJsonBody('PATCH', body, options));
    },

    /**
     * Sends a DELETE request and returns the parsed JSON response body when present.
     */
    delete<TResponse>(path: string, options: ApiRequestOptionsWithoutBody = {}): Promise<TResponse> {
        return request<TResponse>(path, { ...options, method: 'DELETE' });
    },
};

/**
 * Performs an authenticated API request with cookie credentials.
 * On 401, attempts a single token refresh and retries the request once.
 */
async function request<TResponse>(
    path: string,
    fetchOptions: RequestInit = {},
    isRetryAfterRefresh = false,
): Promise<TResponse> {
    const response = await fetch(`/api${path}`, withDefaultHeaders(fetchOptions));

    if (response.status === 401 && !isRetryAfterRefresh && !AUTH_PATHS_WITHOUT_RETRY.has(path)) {
        try {
            await refreshSessionOnce();
        } catch {
            onSessionExpired();
            throw await toApiError(response);
        }

        return request<TResponse>(path, fetchOptions, true);
    }

    if (!response.ok) {
        throw await toApiError(response);
    }

    if (response.status === 204) {
        return undefined as TResponse;
    }

    return response.json() as Promise<TResponse>;
}

function withJsonBody(method: string, body: unknown, options: ApiRequestOptionsWithoutBody): RequestInit {
    return {
        ...options,
        method,
        body: body === undefined ? undefined : JSON.stringify(body),
    };
}

function withDefaultHeaders(options: RequestInit): RequestInit {
    return {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };
}

function refreshSessionOnce(): Promise<void> {
    if (!pendingRefresh) {
        pendingRefresh = performRefreshRequest().finally(() => {
            pendingRefresh = null;
        });
    }

    return pendingRefresh;
}

async function performRefreshRequest(): Promise<void> {
    const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw await toApiError(response);
    }
}

/** Clears the session-expired callback on AuthProvider unmount. */
export function noopSessionExpiredHandler(): void {
    // Default and cleanup handler before AuthProvider registers a real callback.
}

async function toApiError(response: Response): Promise<ApiError> {
    try {
        const payload = (await response.json()) as ApiErrorResponse;

        return new ApiError(response.status, payload.code, payload.message);
    } catch {
        return new ApiError(response.status, 'NETWORK_ERROR', 'The request could not be completed');
    }
}
