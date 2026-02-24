export = mergeEtags;
/**
 * @param {Etag} a first
 * @param {Etag} b second
 * @returns {Etag} result
 */
declare function mergeEtags(a: Etag, b: Etag): Etag;
declare namespace mergeEtags {
    export { Etag };
}
type Etag = import("../Cache").Etag;
