/**
 * Opaque Carbon icon component name stored on a category (e.g. `Wallet`, `ShoppingCart`).
 * The API does not restrict values to a fixed catalog; the web icon-picker chooses
 * from `@carbon/react/icons` and unknown names should fall back in the UI.
 */
export type CategoryIcon = string;

/** Default Carbon icon name when create omits `icon`. */
export const DEFAULT_CATEGORY_ICON: CategoryIcon = 'Wallet';

/** Minimum stored length for a category icon name. */
export const CATEGORY_ICON_MIN_LENGTH = 1;

/** Maximum stored length for a category icon name. */
export const CATEGORY_ICON_MAX_LENGTH = 64;
