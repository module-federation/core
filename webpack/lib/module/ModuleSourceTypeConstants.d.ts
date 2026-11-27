/**
 * Defines the all types type used by this module.
 */
export type AllTypes = "javascript" | "runtime" | "webassembly" | "asset" | "asset-url" | "css" | "css-import" | "css-text" | "html" | "share-init" | "remote" | "consume-shared" | "unknown";
/**
 * @type {ReadonlySet<"asset-url" | "asset">}
 */
export const ASSET_AND_ASSET_URL_TYPES: ReadonlySet<"asset-url" | "asset">;
/**
 * @type {ReadonlySet<"javascript" | "asset-url" | "asset">}
 */
export const ASSET_AND_JAVASCRIPT_AND_ASSET_URL_TYPES: ReadonlySet<"javascript" | "asset-url" | "asset">;
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
 * @type {Readonly<"asset-url">}
 */
export const ASSET_URL_TYPE: Readonly<"asset-url">;
/**
 * @type {ReadonlySet<"asset-url">}
 */
export const ASSET_URL_TYPES: ReadonlySet<"asset-url">;
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
 * @type {Readonly<"css-text">}
 */
export const CSS_TEXT_TYPE: Readonly<"css-text">;
/**
 * @type {ReadonlySet<"css-text">}
 */
export const CSS_TEXT_TYPES: ReadonlySet<"css-text">;
/**
 * @type {Readonly<"css">}
 */
export const CSS_TYPE: Readonly<"css">;
/**
 * @type {ReadonlySet<"css">}
 */
export const CSS_TYPES: ReadonlySet<"css">;
/**
 * @type {Readonly<"html">}
 */
export const HTML_TYPE: Readonly<"html">;
/**
 * @type {ReadonlySet<"html">}
 */
export const HTML_TYPES: ReadonlySet<"html">;
/**
 * @type {ReadonlySet<"javascript" | "asset-url">}
 */
export const JAVASCRIPT_AND_ASSET_URL_TYPES: ReadonlySet<"javascript" | "asset-url">;
/**
 * @type {ReadonlySet<"javascript" | "css-text">}
 */
export const JAVASCRIPT_AND_CSS_TEXT_TYPES: ReadonlySet<"javascript" | "css-text">;
/**
 * @type {ReadonlySet<"javascript" | "css">}
 */
export const JAVASCRIPT_AND_CSS_TYPES: ReadonlySet<"javascript" | "css">;
/**
 * @type {Readonly<"javascript">}
 */
export const JAVASCRIPT_TYPE: Readonly<"javascript">;
/**
 * @type {ReadonlySet<"javascript">}
 */
export const JAVASCRIPT_TYPES: ReadonlySet<"javascript">;
/**
 * Defines the all types type used by this module.
 * @typedef {JAVASCRIPT_TYPE | RUNTIME_TYPE | WEBASSEMBLY_TYPE | ASSET_TYPE | ASSET_URL_TYPE | CSS_TYPE | CSS_IMPORT_TYPE | CSS_TEXT_TYPE | HTML_TYPE | SHARED_INIT_TYPE | REMOTE_GENERATOR_TYPE | CONSUME_SHARED_GENERATOR_TYPE | UNKNOWN_TYPE} AllTypes
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
