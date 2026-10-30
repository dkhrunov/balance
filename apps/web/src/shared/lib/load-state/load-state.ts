/**
 * Async load lifecycle for list/detail fetches.
 * `idle` — nothing to load yet (e.g. no selection); omit when a fetch always starts.
 */
export type LoadState = 'idle' | 'loading' | 'ready' | 'error';
