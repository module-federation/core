/**
 * Adjust a source map that accompanied BOM-prefixed content for the removal of
 * that BOM. Anything without VLQ `mappings` is passed through untouched, as is
 * a map declaring a version other than 3 — earlier versions spell `mappings`
 * differently. A map that declares no version at all is taken as version 3.
 * @param {(string | RawSourceMap)=} sourceMap the map, as an object or as JSON
 * @returns {(string | RawSourceMap)=} the adjusted map
 */
export function adjustSourceMapForRemovedBOM(sourceMap?: (string | RawSourceMap) | undefined): (string | RawSourceMap) | undefined;
/** @import { RawSourceMap } from "webpack-sources" */
/** @import { Result } from "../module/NormalModule" */
/**
 * Returns result without BOM.
 * @param {string | Buffer} strOrBuffer string or buffer
 * @returns {string | Buffer} result without BOM
 */
export function removeBOM(strOrBuffer: string | Buffer): string | Buffer;
/**
 * @param {Result} result a loader result: content, an optional source map, extra info
 * @returns {Result} the result with a leading BOM removed from its content and its source map kept in sync
 */
export function removeBOMFromResult(result: Result): Result;
import type { RawSourceMap } from "webpack-sources";
import type { Result } from "../module/NormalModule";
