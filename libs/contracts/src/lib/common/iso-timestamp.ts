/** ISO 8601 timestamp carried across the API boundary. */
export type IsoTimestamp = string & { readonly __isoTimestamp?: never };
