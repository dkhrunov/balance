/**
 * Opaque Carbon icon component name stored on an account (e.g. `Wallet`, `Money`).
 * The API does not restrict values to a fixed catalog; the web icon-picker chooses
 * from `@carbon/react/icons` and unknown names should fall back in the UI.
 */
export type AccountIcon = string;

/** Default Carbon icon name when create omits `icon`. */
export const DEFAULT_ACCOUNT_ICON: AccountIcon = 'Wallet';
