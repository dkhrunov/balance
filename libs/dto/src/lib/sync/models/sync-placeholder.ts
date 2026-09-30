/** Wire schema version for forward-compatible sync payloads. */
export type SchemaVersion = number & { readonly __schemaVersion?: never };

/**
 * Placeholder for synchronization payloads.
 * The protocol is added with the offline-first synchronization feature.
 */
export interface SyncContractPlaceholder {
    readonly schemaVersion: SchemaVersion;
}
