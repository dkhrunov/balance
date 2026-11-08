import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { vi } from 'vitest';
import { persistCurrencies } from '../lib/currency';
import { CurrenciesProvider, useCurrencies } from './currency-provider';

const api = vi.hoisted(() => ({
    getVersion: vi.fn(),
    getCurrencies: vi.fn(),
}));

const auth = vi.hoisted(() => ({
    status: 'authenticated' as 'authenticated' | 'unauthenticated',
}));

vi.mock('../../../shared/api', () => ({
    CurrenciesApi: {
        getVersion: () => api.getVersion(),
        getCurrencies: () => api.getCurrencies(),
    },
}));

vi.mock('../../../shared/auth', () => ({
    useAuth: () => ({ status: auth.status, user: null }),
}));

const cached = {
    version: 'hash-1',
    items: [
        { key: 'EUR', symbol: '€' },
        { key: 'RUB', symbol: '₽' },
        { key: 'USD', symbol: '$' },
    ],
};

function Probe(): ReactNode {
    const currencies = useCurrencies();

    return (
        <p>
            {currencies.loadState}:{currencies.items.map((item) => `${item.key}${item.symbol}`).join(',')}
        </p>
    );
}

function renderDictionary(): void {
    render(
        <CurrenciesProvider>
            <Probe />
        </CurrenciesProvider>,
    );
}

describe('CurrenciesProvider', () => {
    beforeEach(() => {
        localStorage.clear();
        auth.status = 'authenticated';
        api.getVersion.mockReset();
        api.getCurrencies.mockReset();
    });

    it('keeps a warm cache when the version matches and does not load the list', async () => {
        persistCurrencies(cached);
        api.getVersion.mockResolvedValue({ version: 'hash-1' });

        renderDictionary();

        expect(screen.getByText('ready:EUR€,RUB₽,USD$')).toBeInTheDocument();

        await waitFor(() => {
            expect(api.getVersion).toHaveBeenCalled();
        });
        expect(api.getCurrencies).not.toHaveBeenCalled();
    });

    it('replaces open lists when the version changes', async () => {
        persistCurrencies(cached);
        api.getVersion.mockResolvedValue({ version: 'hash-2' });
        api.getCurrencies.mockResolvedValue({
            version: 'hash-2',
            items: [
                { key: 'EUR', symbol: '€' },
                { key: 'RUB', symbol: 'руб.' },
                { key: 'USD', symbol: '$' },
            ],
        });

        renderDictionary();

        expect(await screen.findByText('ready:EUR€,RUBруб.,USD$')).toBeInTheDocument();
    });

    it('keeps the cache when the version check fails', async () => {
        persistCurrencies(cached);
        api.getVersion.mockRejectedValue(new Error('401'));

        renderDictionary();

        await waitFor(() => {
            expect(api.getVersion).toHaveBeenCalled();
        });
        expect(screen.getByText('ready:EUR€,RUB₽,USD$')).toBeInTheDocument();
        expect(api.getCurrencies).not.toHaveBeenCalled();
    });

    it('returns the stored symbol and falls back to the key', () => {
        persistCurrencies(cached);
        api.getVersion.mockResolvedValue({ version: 'hash-1' });

        function SymbolProbe(): ReactNode {
            const currencies = useCurrencies();

            return (
                <p>
                    {currencies.symbol('RUB')}|{currencies.symbol('GBP')}
                </p>
            );
        }

        render(
            <CurrenciesProvider>
                <SymbolProbe />
            </CurrenciesProvider>,
        );

        expect(screen.getByText('₽|GBP')).toBeInTheDocument();
    });

    it('does not invent RUB, USD, or EUR when the cache is empty and the load fails', async () => {
        api.getCurrencies.mockRejectedValue(new Error('offline'));

        renderDictionary();

        expect(await screen.findByText('error:')).toBeInTheDocument();
        expect(screen.queryByText(/RUB|USD|EUR/)).not.toBeInTheDocument();
        expect(api.getVersion).not.toHaveBeenCalled();
    });
});
