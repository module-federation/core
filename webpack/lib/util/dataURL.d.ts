/**
 * A `data:` URI split into the parts a caller has to put back together.
 * `parameters` is every `;…` after the media type (`;base64` included) and
 * `payload` the text after the comma, both in the form they were written.
 */
export type ParsedDataURI = {
    mediaType: string;
    parameters: string;
    base64: boolean;
    payload: string;
};
/**
 * One embedded body a print offered but could not wait for, and the text to
 * print around the answer once it is in: {@link import ("./SourceProcessor").DeferredWrite},
 * plus what the grammar has to say about what it offered. `as` names which of
 * that language's productions the body is, where it has more than one — an HTML
 * `style=""` is `"block-contents"` rather than a whole stylesheet.
 */
export type DeferredEmbeddedSource = import("./SourceProcessor").DeferredWrite & {
    type: string;
    hostType: string;
    as?: string;
};
/**
 * What a renderer made of one embedded body: the minified text, and anything it
 * has to report about it. A bare string is the text alone.
 */
export type EmbeddedSourceResult = {
    code?: string;
    warnings?: (Error | string)[];
    errors?: (Error | string)[];
};
/**
 * Every language `languageOfMediaType` can name, for a consumer that has to say
 * up front which of them it handles. Stated here rather than at each such
 * consumer: adding one below adds it to every ability that names this.
 * @type {string[]}
 */
export const EMBEDDED_LANGUAGES: string[];
export const JSON_TYPE: "json";
export const SVG_TYPE: "svg";
export const URIRegEx: RegExp;
/**
 * One embedded body a print offered but could not wait for, and the text to
 * print around the answer once it is in: {@link import("./SourceProcessor").DeferredWrite},
 * plus what the grammar has to say about what it offered. `as` names which of
 * that language's productions the body is, where it has more than one — an HTML
 * `style=""` is `"block-contents"` rather than a whole stylesheet.
 * @typedef {import("./SourceProcessor").DeferredWrite & { type: string, hostType: string, as?: string }} DeferredEmbeddedSource
 */
/**
 * What a renderer made of one embedded body: the minified text, and anything it
 * has to report about it. A bare string is the text alone.
 * @typedef {{ code?: string, warnings?: (Error | string)[], errors?: (Error | string)[] }} EmbeddedSourceResult
 */
/**
 * Ask a renderer for one embedded body and keep what it reported. Anything it
 * throws is a renderer that did not answer rather than an asset that fails to
 * serialize: the rest of the print stands, the body is spelled as an untapped
 * run spells it, and why it was is not lost.
 * @param {(source: string, info: { type: string, hostType: string, as?: string }) => Promise<string | EmbeddedSourceResult | undefined> | string | EmbeddedSourceResult | undefined} render the caller's renderer
 * @param {{ source: string, type: string, hostType: string, as?: string }} hole the body to offer
 * @param {EmbeddedSourceResult[]} reported collects what each says about them
 * @returns {Promise<string | EmbeddedSourceResult | undefined>} what it answered, or undefined where it declined or threw
 */
export function askEmbeddedRenderer(render: (source: string, info: {
    type: string;
    hostType: string;
    as?: string;
}) => Promise<string | EmbeddedSourceResult | undefined> | string | EmbeddedSourceResult | undefined, hole: {
    source: string;
    type: string;
    hostType: string;
    as?: string;
}, reported: EmbeddedSourceResult[]): Promise<string | EmbeddedSourceResult | undefined>;
/**
 * Rebuild a `data:` URI around a new payload, in the form it was written in.
 * @param {ParsedDataURI} parsed the split URI
 * @param {string} text the new payload as text
 * @returns {string} the rebuilt URI
 */
export function buildDataURI(parsed: ParsedDataURI, text: string): string;
/**
 * Everything a run's renderers reported, in the shape a minifier returns —
 * an empty list is left off, so a run nothing was reported over is exactly
 * what it always was.
 * @param {{ warnings?: (Error | string)[], errors?: (Error | string)[] }[]} reported what each answered with
 * @returns {{ warnings?: (Error | string)[], errors?: (Error | string)[] }} the collected diagnostics
 */
export function collectEmbeddedDiagnostics(reported: {
    warnings?: (Error | string)[];
    errors?: (Error | string)[];
}[]): {
    warnings?: (Error | string)[];
    errors?: (Error | string)[];
};
/**
 * Decodes the provided uri.
 * @param {string} uri data URI
 * @returns {Buffer | null} decoded data
 */
export function decodeDataURI(uri: string): Buffer | null;
/**
 * The payload as text, or `null` when reading it would not round-trip. A raw
 * `#` is read as content, as webpack's own `data:` modules read it, so a
 * rebuilt URI escapes it rather than cutting the payload short.
 * @param {ParsedDataURI} parsed the split URI
 * @returns {string | null} the payload as text
 */
export function decodeDataURIPayload(parsed: ParsedDataURI): string | null;
/**
 * The minified text a renderer answered with, for one that may answer with a
 * whole result instead. `undefined` is a renderer that declined.
 * @param {string | { code?: string } | undefined} answer what it answered
 * @returns {string | undefined} the text, or undefined
 */
export function embeddedText(answer: string | {
    code?: string;
} | undefined): string | undefined;
/**
 * Escape a payload for a `data:` URI written without `base64`, touching only
 * what would change what the URI means. The host's own quoting is the caller's.
 * @param {string} text the payload as text
 * @returns {string} the escaped payload
 */
export function encodeDataURIPayload(text: string): string;
/**
 * The language a file's name says it holds, for a module that embeds the file's
 * text rather than a `data:` URI — the same question `languageOfMediaType`
 * answers, read off the extension through webpack's own mime lookup.
 * @param {string | null} filename the file's name, or null when it has none
 * @returns {string | undefined} the language, or undefined when it names none
 */
export function languageOfFilename(filename: string | null): string | undefined;
/**
 * The language name a media type carries, for a consumer that dispatches on it
 * — a `renderEmbeddedSource` renderer today. Not a grammar table read out of a
 * dataset: it is the handful of essences webpack itself has a notion of, so an
 * unknown one declines rather than guessing. The `+json` structured suffix is
 * read off the subtype.
 * @param {string} mediaType a media type, e.g. `image/svg+xml`
 * @returns {string | undefined} the language, or undefined when it names none
 */
export function languageOfMediaType(mediaType: string): string | undefined;
/**
 * Split a `data:` URI, or `null` when it is not one.
 * @param {string} uri the URI, unquoted and unescaped
 * @returns {ParsedDataURI | null} its parts
 */
export function parseDataURI(uri: string): ParsedDataURI | null;
/**
 * A `data:` URI's payload as text, for a caller that will render it, with the
 * language its media type names. `null` when there is nothing to offer: not a
 * `data:` URI, a media type naming no language, a payload that would not
 * round-trip, or a raw `#`, where a browser reads the rest as a fragment.
 * @param {string} uri the URI, unquoted and unescaped
 * @returns {{ parsed: ParsedDataURI, type: string, payload: string } | null} what it holds, or null
 */
export function readEmbeddedDataURI(uri: string): {
    parsed: ParsedDataURI;
    type: string;
    payload: string;
} | null;
