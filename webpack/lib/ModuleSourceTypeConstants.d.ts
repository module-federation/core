export type AllTypes = "javascript" | "runtime" | "webassembly" | "asset" | "css" | "css-import" | "css-url" | "share-init" | "remote" | "consume-shared" | "unknown";
/**
 * @type {ReadonlySet<"css-url" | "asset">}
 */
export const ASSET_AND_CSS_URL_TYPES: ReadonlySet<"css-url" | "asset">;
/**
 * @type {ReadonlySet<"javascript" | "css-url" | "asset">}
 */
export const ASSET_AND_JAVASCRIPT_AND_CSS_URL_TYPES: ReadonlySet<"javascript" | "css-url" | "asset">;
/**
 * @type {ReadonlySet<"asset" | "javascript" | "asset">}
 */
export const ASSET_AND_JAVASCRIPT_TYPES: ReadonlySet<"asset" | "javascript" | "asset">;
/**
 * @type {Readonly<"asset">}
 */
export const ASSET_TYPE: Readonly<"asset">;
/**
 * @type {ReadonlySet<"asset">}
 */
export const ASSET_TYPES: ReadonlySet<"asset">;
/**
 * @type {ReadonlySet<"consume-shared">}
 */
export const CONSUME_SHARED_TYPES: ReadonlySet<"consume-shared">;
/**
 * @type {Readonly<"css-import">}
 */
export const CSS_IMPORT_TYPE: Readonly<"css-import">;
/**
 * @type {ReadonlySet<"css-import">}
 */
export const CSS_IMPORT_TYPES: ReadonlySet<"css-import">;
/**
 * @type {Readonly<"css">}
 */
export const CSS_TYPE: Readonly<"css">;
/**
 * @type {ReadonlySet<"css">}
 */
export const CSS_TYPES: ReadonlySet<"css">;
/**
 * @type {Readonly<"css-url">}
 */
export const CSS_URL_TYPE: Readonly<"css-url">;
/**
 * @type {ReadonlySet<"css-url">}
 */
export const CSS_URL_TYPES: ReadonlySet<"css-url">;
/**
 * @type {ReadonlySet<"javascript" | "css">}
 */
export const JAVASCRIPT_AND_CSS_TYPES: ReadonlySet<"javascript" | "css">;
/**
 * @type {ReadonlySet<"javascript" | "css-url">}
 */
export const JAVASCRIPT_AND_CSS_URL_TYPES: ReadonlySet<"javascript" | "css-url">;
/**
 * @type {Readonly<"javascript">}
 */
export const JAVASCRIPT_TYPE: Readonly<"javascript">;
/**
 * @type {ReadonlySet<"javascript">}
 */
export const JAVASCRIPT_TYPES: ReadonlySet<"javascript">;
/**
 * @typedef {JAVASCRIPT_TYPE |
 * RUNTIME_TYPE |
 * WEBASSEMBLY_TYPE |
 * ASSET_TYPE |
 * CSS_TYPE |
 * CSS_IMPORT_TYPE |
 * CSS_URL_TYPE |
 * SHARED_INIT_TYPE |
 * REMOTE_GENERATOR_TYPE |
 * CONSUME_SHARED_GENERATOR_TYPE |
 * UNKNOWN_TYPE} AllTypes
 */
/**
 * @type {ReadonlySet<never>}
 */
export const NO_TYPES: ReadonlySet<never>;
/**
 * @type {ReadonlySet<"remote" | "share-init">}
 */
export const REMOTE_AND_SHARE_INIT_TYPES: ReadonlySet<"remote" | "share-init">;
/**
 * @type {Readonly<"runtime">}
 */
export const RUNTIME_TYPE: Readonly<"runtime">;
/**
 * @type {ReadonlySet<"runtime">}
 */
export const RUNTIME_TYPES: ReadonlySet<"runtime">;
/**
 * @type {Readonly<"share-init">}
 */
export const SHARED_INIT_TYPE: Readonly<"share-init">;
/**
 * @type {ReadonlySet<"share-init">}
 */
export const SHARED_INIT_TYPES: ReadonlySet<"share-init">;
/**
 * @type {Readonly<"unknown">}
 */
export const UNKNOWN_TYPE: Readonly<"unknown">;
/**
 * @type {Readonly<"webassembly">}
 */
export const WEBASSEMBLY_TYPE: Readonly<"webassembly">;
/**
 * @type {ReadonlySet<"webassembly">}
 */
export const WEBASSEMBLY_TYPES: ReadonlySet<"webassembly">;
