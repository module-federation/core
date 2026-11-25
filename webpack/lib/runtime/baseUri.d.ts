/**
 * Whether `new URL(path, baseUri)` can resolve against it. Parsing is not the question:
 * an opaque scheme like `data:` or `mailto:` is a valid url and still no base for
 * anything, so the resolution itself is what gets asked.
 * @param {string} baseUri an entry's base uri
 * @returns {boolean} true when a relative path resolves against it
 */
export function isAbsoluteBaseUri(baseUri: string): boolean;
/**
 * Whether a base names a place relative to the chunk, so a literal can spell it. A
 * scheme makes it a base of its own, and a protocol-relative one takes its scheme from
 * wherever the chunk was loaded — neither is something a literal can state.
 * @param {string} baseUri an entry's base uri
 * @returns {boolean} true when it can be baked beside the chunk
 */
export function isChunkRelativeBaseUri(baseUri: string): boolean;
/**
 * Assignment of `__webpack_require__.b` for a chunk. An entry `baseUri` replaces the
 * base an asset url resolves against, but only an absolute one is a base by itself —
 * a relative one is read against the base this target would use without it, so it
 * lands beside the chunk rather than throwing wherever the runtime reads it.
 * @param {string | undefined} baseUri the entry's base uri, if it set one
 * @param {string} fallback expression for the base this target uses without one
 * @returns {string} the assignment, ending with `;`
 */
export function renderBaseUri(baseUri: string | undefined, fallback: string): string;
