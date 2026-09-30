/** Category kinds kept separate so income and expense catalogs do not mix. */
export const CATEGORY_TYPES = ['INCOME', 'EXPENSE'] as const;

export type CategoryType = (typeof CATEGORY_TYPES)[number];
