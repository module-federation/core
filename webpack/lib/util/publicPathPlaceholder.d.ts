export const PUBLIC_PATH_AUTO: "__WEBPACK_CSS_PUBLIC_PATH_AUTO__";
export const PUBLIC_PATH_FULL_HASH: "__WEBPACK_CSS_PUBLIC_PATH_FULL_HASH_";
/**
 * Scan `content` for `PUBLIC_PATH_FULL_HASH` placeholders and invoke `onMatch`
 * once per well-formed occurrence. The placeholder spans the half-open range
 * `[start, end)` and encodes the requested hash length (`0` means the full
 * hash). Callers substitute the build-time hash or a runtime expression
 * depending on context.
 * @param {string} content text to scan
 * @param {(start: number, end: number, length: number) => void} onMatch placeholder callback
 * @returns {void}
 */
export function walkFullHashPlaceholders(content: string, onMatch: (start: number, end: number, length: number) => void): void;
