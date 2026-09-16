/** Optimistic-concurrency version carried by mutable entities. */
export type EntityVersion = number & { readonly __entityVersion?: never };
