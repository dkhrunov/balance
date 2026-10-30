import { describe, expect, it } from 'vitest';
import Wallet from '@carbon/icons-react/es/Wallet';
import {
    FALLBACK_ICON,
    FALLBACK_ICON_NAME,
    ICON_NAME_SET,
    ICON_NAMES,
    coerceIconName,
    formatIconLabel,
    isIconName,
    resolveIcon,
} from './icons';

describe('icon catalog', () => {
    it('exposes a curated set of finance-oriented icons', () => {
        expect(ICON_NAMES.length).toBeGreaterThan(40);
        expect(ICON_NAMES.length).toBeLessThan(120);
        expect(ICON_NAME_SET.has('Wallet')).toBe(true);
        expect(ICON_NAME_SET.has('ShoppingCart')).toBe(true);
        expect(ICON_NAME_SET.has('Icon')).toBe(false);
    });
});

describe('resolveIcon', () => {
    it('resolves known icons synchronously', () => {
        expect(resolveIcon('ShoppingCart')).toBeTruthy();
        expect(resolveIcon('Wallet')).toBe(Wallet);
    });

    it('falls back to Wallet for unknown names', () => {
        expect(resolveIcon('NotARealIcon')).toBe(FALLBACK_ICON);
        expect(resolveIcon(undefined)).toBe(FALLBACK_ICON);
        expect(FALLBACK_ICON_NAME).toBe('Wallet');
    });
});

describe('isIconName / coerceIconName', () => {
    it('detects catalog membership', () => {
        expect(isIconName('Wallet')).toBe(true);
        expect(isIconName('Nope')).toBe(false);
    });

    it('coerces unknown values to Wallet', () => {
        expect(coerceIconName('Car')).toBe('Car');
        expect(coerceIconName('Nope')).toBe('Wallet');
    });
});

describe('formatIconLabel', () => {
    it('splits PascalCase and underscores for display/search', () => {
        expect(formatIconLabel('ShoppingCart')).toBe('Shopping Cart');
        expect(formatIconLabel('Drink_01')).toBe('Drink 01');
    });
});
