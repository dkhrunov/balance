import { toIsoDate } from '../../lib/iso-date';

export type DateRangePreset = 'thisMonth' | 'last30Days' | 'last90Days' | 'all';

export type DateRange = {
    readonly from: string | null;
    readonly to: string | null;
};

/**
 * Resolves a dashboard date-range preset to inclusive ISO date bounds (`YYYY-MM-DD`).
 * `all` leaves both bounds null (no date filter).
 *
 * @param preset Named range preset.
 * @param today Reference calendar day (defaults to local today).
 */
export function resolveDateRangePreset(preset: DateRangePreset, today: Date = new Date()): DateRange {
    if (preset === 'all') {
        return { from: null, to: null };
    }

    const to = toIsoDate(today);

    if (preset === 'thisMonth') {
        const fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from: toIsoDate(fromDate), to };
    }

    const days = preset === 'last30Days' ? 30 : 90;
    const fromDate = new Date(today);

    fromDate.setDate(fromDate.getDate() - (days - 1));

    return { from: toIsoDate(fromDate), to };
}

/**
 * Whether an ISO calendar date falls within an inclusive range (null bound = open).
 *
 * @param date ISO date `YYYY-MM-DD`.
 * @param range Inclusive bounds.
 */
export function isDateInRange(date: string, range: DateRange): boolean {
    if (range.from && date < range.from) {
        return false;
    }

    if (range.to && date > range.to) {
        return false;
    }

    return true;
}
