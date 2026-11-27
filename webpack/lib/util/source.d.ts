/**
 * Checks whether this object is source equal.
 * @param {Source} a a source
 * @param {Source} b another source
 * @returns {boolean} true, when both sources are equal
 */
export function isSourceEqual(a: Source, b: Source): boolean;
/**
 * Feeds the Source's content into a Hash without forcing a single
 * concatenated Buffer. Uses webpack-sources >= 3.4.0 `buffers()` when
 * available so `ConcatSource` can stream its children directly.
 * @param {Hash} hash hash to update
 * @param {Source} source source whose bytes are appended
 * @returns {void}
 */
export function updateHashFromSource(hash: Hash, source: Source): void;
import type { Source } from "webpack-sources";
import type Hash from "./Hash";
