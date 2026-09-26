/**
 * Opaque Carbon icon component name stored on an account (e.g. `Wallet`, `Money`).
 * The API does not restrict values to a fixed catalog; the web icon-picker chooses
 * from `@carbon/react/icons` and unknown names should fall back in the UI.
 */
export type AccountIcon = string;

/** Default Carbon icon name when create omits `icon`. */
export const DEFAULT_ACCOUNT_ICON: AccountIcon = 'Wallet';

/** Minimum stored length for an account icon name. */
export const ACCOUNT_ICON_MIN_LENGTH = 1;

/** Maximum stored length for an account icon name. */
export const ACCOUNT_ICON_MAX_LENGTH = 64;
