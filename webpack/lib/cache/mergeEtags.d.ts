export = mergeEtags;
/**
 * Merges the provided values into a single result.
 * @param {Etag} a first
 * @param {Etag} b second
 * @returns {string | MergedEtag} result
 */
declare function mergeEtags(a: Etag, b: Etag): string | MergedEtag;
import type { Etag } from "./Cache";
/** @import { Etag } from "./Cache" */
declare class MergedEtag {
    /**
     * Creates an instance of MergedEtag.
     * @param {Etag} a first
     * @param {Etag} b second
     */
    constructor(a: Etag, b: Etag);
    /** @type {Etag} */
    a: Etag;
    /** @type {Etag} */
    b: Etag;
    toString(): string;
}
