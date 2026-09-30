/** Persisted Carbon-compatible theme (`system` follows OS). */
export const THEMES = ['light', 'dark', 'system'] as const;

export type Theme = (typeof THEMES)[number];
