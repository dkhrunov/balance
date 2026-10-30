/** Formats a Date as `yyyy-mm-dd` in local calendar fields. */
export function toIsoDate(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/** Today's date as `yyyy-mm-dd` (local). */
export function todayIsoDate(): string {
    return toIsoDate(new Date());
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Returns whether `value` matches `yyyy-mm-dd`. */
export function isIsoDate(value: string): boolean {
    return ISO_DATE_PATTERN.test(value);
}
