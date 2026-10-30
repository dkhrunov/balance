import { describe, expect, it } from 'vitest';
import { ICON_GROUPS } from '../icons';
import { scopeIconCatalog } from './icon-picker-control';

describe('scopeIconCatalog', () => {
    it('returns the full catalog when neither filter is set', () => {
        expect(scopeIconCatalog()).toBe(ICON_GROUPS);
        expect(scopeIconCatalog([], [])).toBe(ICON_GROUPS);
    });

    it('filters by top-level group ids', () => {
        const scoped = scopeIconCatalog(['income', 'accounts']);

        expect(scoped.map((group) => group.id)).toEqual(['accounts', 'income']);
        expect(scoped.every((group) => group.icons.length > 0)).toBe(true);
    });

    it('returns a single ordered set when only icons are provided', () => {
        const scoped = scopeIconCatalog(undefined, ['Wallet', 'PiggyBank', 'Wallet']);

        expect(scoped).toHaveLength(1);
        expect(scoped[0]?.icons).toEqual(['Wallet', 'PiggyBank']);
    });

    it('intersects groups with icons when both are set', () => {
        const scoped = scopeIconCatalog(['expenses'], ['Wallet', 'Calendar', 'PiggyBank']);
        const names = scoped.flatMap((group) => [...group.icons]);

        expect(names).toEqual(['Calendar']);
        expect(scoped.every((group) => group.id === 'expenses')).toBe(true);
    });
});
