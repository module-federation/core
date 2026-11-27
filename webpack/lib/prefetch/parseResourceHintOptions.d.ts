export = parseResourceHintOptions;
/** @import { DependencyLocation } from "../graph/Dependency" */
/** @import NormalModule from "../module/NormalModule" */
/** @import { MagicCommentOptions } from "../util/magicComment" */
/**
 * @typedef {object} ResourceHintOptions
 * @property {true=} prefetch
 * @property {true=} preload
 * @property {("high" | "low" | "auto")=} fetchPriority
 * @property {string=} as
 * @property {string=} type
 * @property {string=} media
 */
/**
 * Reads `webpackPrefetch` / `webpackPreload` / `webpackFetchPriority` /
 * `webpackAs` / `webpackType` / `webpackMedia` from a parsed magic-comment
 * options object. Invalid values emit warnings to the given module.
 * @param {MagicCommentOptions | null | undefined} importOptions parsed comment options
 * @param {NormalModule} module the module to attach warnings to
 * @param {DependencyLocation} loc location for warnings
 * @returns {ResourceHintOptions} parsed hints (empty when no comments matched)
 */
declare function parseResourceHintOptions(importOptions: MagicCommentOptions | null | undefined, module: NormalModule, loc: DependencyLocation): ResourceHintOptions;
declare namespace parseResourceHintOptions {
    export { guessAsAttribute, ResourceHintOptions };
}
import type { MagicCommentOptions } from "../util/magicComment";
import type NormalModule from "../module/NormalModule";
import type { DependencyLocation } from "../graph/Dependency";
/**
 * Maps a request/filename to the value of the `<link>` `as` attribute. Best
 * effort — falls back to `"fetch"` when the type cannot be guessed. Pattern
 * matches against the path part, ignoring any query string suffix.
 * @param {string} request request/filename
 * @returns {string} value for the `as` attribute
 */
declare function guessAsAttribute(request: string): string;
type ResourceHintOptions = {
    prefetch?: true | undefined;
    preload?: true | undefined;
    fetchPriority?: ("high" | "low" | "auto") | undefined;
    as?: string | undefined;
    type?: string | undefined;
    media?: string | undefined;
};
