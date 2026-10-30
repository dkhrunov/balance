import { describe, expect, it } from 'vitest';
import { isDateInRange, resolveDateRangePreset } from './date-range';

describe('resolveDateRangePreset', () => {
    const today = new Date(2026, 8, 21); // 21 Sep 2026 local

    it('resolves this month from the 1st', () => {
        expect(resolveDateRangePreset('thisMonth', today)).toEqual({
            from: '2026-09-01',
            to: '2026-09-21',
        });
    });

    it('resolves last 30 days inclusively', () => {
        expect(resolveDateRangePreset('last30Days', today)).toEqual({
            from: '2026-08-23',
            to: '2026-09-21',
        });
    });

    it('leaves all open', () => {
        expect(resolveDateRangePreset('all', today)).toEqual({ from: null, to: null });
    });
});

describe('isDateInRange', () => {
    it('filters by inclusive bounds', () => {
        const range = { from: '2026-09-01', to: '2026-09-21' };
        expect(isDateInRange('2026-09-01', range)).toBe(true);
        expect(isDateInRange('2026-09-21', range)).toBe(true);
        expect(isDateInRange('2026-08-31', range)).toBe(false);
        expect(isDateInRange('2026-09-22', range)).toBe(false);
    });
});
