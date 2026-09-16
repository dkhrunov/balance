import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './api-error';
import { ApiClient, noopSessionExpiredHandler, registerSessionExpiredHandler } from './api-request';

function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function emptyResponse(status: number): Response {
    return new Response(null, { status });
}

describe('ApiClient', () => {
    beforeEach(() => {
        registerSessionExpiredHandler(noopSessionExpiredHandler);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns parsed JSON for successful GET responses', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { id: '1' })));

        await expect(ApiClient.get<{ id: string }>('/accounts')).resolves.toEqual({ id: '1' });
    });

    it('serializes POST body as JSON', async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }));

        vi.stubGlobal('fetch', fetchMock);

        await expect(ApiClient.post('/auth/login', { email: 'a@b.c', password: 'x' })).resolves.toEqual({ ok: true });

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/auth/login',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ email: 'a@b.c', password: 'x' }),
            }),
        );
    });

    it('retries once after refresh on 401', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse(401, { code: 'AUTH_REQUIRED', message: 'Unauthorized', details: {} }))
            .mockResolvedValueOnce(emptyResponse(204))
            .mockResolvedValueOnce(jsonResponse(200, { user: { id: 'u1' } }));

        vi.stubGlobal('fetch', fetchMock);

        await expect(ApiClient.get<{ user: { id: string } }>('/auth/me')).resolves.toEqual({
            user: { id: 'u1' },
        });

        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/auth/me');
        expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/auth/refresh');
        expect(fetchMock.mock.calls[2]?.[0]).toBe('/api/auth/me');
    });

    it('deduplicates concurrent refresh calls', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse(401, { code: 'AUTH_REQUIRED', message: 'Unauthorized', details: {} }))
            .mockResolvedValueOnce(jsonResponse(401, { code: 'AUTH_REQUIRED', message: 'Unauthorized', details: {} }))
            .mockResolvedValueOnce(emptyResponse(204))
            .mockResolvedValueOnce(jsonResponse(200, { a: 1 }))
            .mockResolvedValueOnce(jsonResponse(200, { b: 2 }));

        vi.stubGlobal('fetch', fetchMock);

        const [first, second] = await Promise.all([
            ApiClient.get<{ a: number }>('/accounts/a'),
            ApiClient.get<{ b: number }>('/accounts/b'),
        ]);

        expect(first).toEqual({ a: 1 });
        expect(second).toEqual({ b: 2 });

        const refreshCalls = fetchMock.mock.calls.filter(([url]) => url === '/api/auth/refresh');
        expect(refreshCalls).toHaveLength(1);
    });

    it('invokes session-expired handler when refresh fails', async () => {
        const onSessionExpired = vi.fn();

        registerSessionExpiredHandler(onSessionExpired);

        vi.stubGlobal(
            'fetch',
            vi
                .fn()
                .mockResolvedValueOnce(
                    jsonResponse(401, { code: 'AUTH_REQUIRED', message: 'Unauthorized', details: {} }),
                )
                .mockResolvedValueOnce(
                    jsonResponse(401, { code: 'AUTH_INVALID_REFRESH', message: 'Invalid', details: {} }),
                ),
        );

        await expect(ApiClient.get('/auth/me')).rejects.toBeInstanceOf(ApiError);
        expect(onSessionExpired).toHaveBeenCalledTimes(1);
    });

    it('does not refresh on 401 for login', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValue(
                jsonResponse(401, { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid credentials', details: {} }),
            );

        vi.stubGlobal('fetch', fetchMock);

        await expect(ApiClient.post('/auth/login', { email: 'a@b.c', password: 'x' })).rejects.toMatchObject({
            status: 401,
            code: 'AUTH_INVALID_CREDENTIALS',
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
