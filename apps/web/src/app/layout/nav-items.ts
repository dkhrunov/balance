export type AppNavItem = {
    id: string;
    label: string;
    path: string;
};

/** Destinations for desktop SideNav and mobile home shortcuts. */
export const APP_NAV_ITEMS: AppNavItem[] = [
    { id: 'transactions', label: 'Transactions', path: '/transactions' },
    { id: 'accounts', label: 'Accounts', path: '/accounts' },
    { id: 'categories', label: 'Categories', path: '/categories' },
    { id: 'settings', label: 'Settings', path: '/settings' },
];

/** Sections linked from the mobile home screen (excludes current home). */
export const HOME_SHORTCUTS: AppNavItem[] = APP_NAV_ITEMS.filter(
    (item) => item.id !== 'transactions',
);
