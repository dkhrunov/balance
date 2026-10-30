/**
 * Canonical in-app pathnames.
 * Prefer these over string literals in navigate / Link / Route.
 */
export const ROUTES = {
    home: '/',
    login: '/login',
    settings: '/settings',
    profile: '/profile',
} as const;

/** Union of all known app pathnames. */
export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
