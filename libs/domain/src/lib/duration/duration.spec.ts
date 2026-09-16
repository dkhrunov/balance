import { describe, expect, it } from 'vitest';
import { Duration, DurationValidationError } from './duration';

describe('Duration', () => {
    it('parses supported duration units to seconds', () => {
        expect(new Duration('30s').toSeconds()).toBe(30);
        expect(new Duration('15m').toSeconds()).toBe(900);
        expect(new Duration('2h').toSeconds()).toBe(7200);
        expect(new Duration('1d').toSeconds()).toBe(86400);
    });

    it('includes the field name in validation errors', () => {
        expect(() => new Duration('bad')).toThrow(DurationValidationError);
        expect(() => new Duration('bad')).toThrow('Duration must use a positive integer with s, m, h, or d suffix');
    });

    it('rejects zero, negative, and out-of-range values', () => {
        expect(() => new Duration('0s')).toThrow(DurationValidationError);
        expect(() => new Duration('-1d')).toThrow(DurationValidationError);
        expect(() => new Duration('999d')).toThrow('is outside the allowed duration range');
    });
});
