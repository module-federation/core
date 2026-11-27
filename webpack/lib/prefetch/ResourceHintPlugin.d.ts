export = ResourceHintPlugin;
/**
 * Adds runtime support for `__webpack_require__.PA` / `__webpack_require__.LA`,
 * the helpers that inject `<link rel="prefetch">` / `<link rel="preload">`
 * tags for asset modules referenced via `new URL(..., import.meta.url)`, CSS
 * `url(...)`, and HTML `<img src>` / `<link href>`. Also stores the top-level
 * `output.resourceHints` value so `HtmlEntryDependency` can emit its `<link>`
 * tags into the extracted HTML `<head>`.
 */
declare class ResourceHintPlugin {
    /**
     * Returns the per-compilation resolver. `.hints` is the effective
     * `output.resourceHints` value (used by `HtmlEntryDependency` template);
     * `.isHtmlHinted(assetModule)` skips the JS chunk-startup `<link>` when the
     * HTML `<head>` already emits it.
     * @param {Compilation} compilation compilation
     * @returns {CompilationResolver} resolver
     */
    static getCompilationResolver(compilation: Compilation): CompilationResolver;
    /**
     * Match `parser.<type>.urlHints` rules for a request. Returns the merged
     * defaults; the caller passes them to `applyDefaults`. Exposed so parsers
     * that own their own URL dep creation (JS/CSS/HTML) can share one matcher.
     * @param {UrlHintRule[] | undefined} rules rules array
     * @param {string} request request URL
     * @returns {ResolvedResourceHints} matched defaults
     */
    static matchUrlHints(rules: UrlHintRule[] | undefined, request: string): ResolvedResourceHints;
    /**
     * Apply `urlHints` rule defaults to a URL asset dep. Used from URL-emitting
     * parsers when they have per-request defaults but no comment options to
     * parse (e.g. the HTML parser's `pendingHints` flow, where the comment was
     * parsed earlier).
     * @param {ResourceHintDep} dep dep to mutate
     * @param {ResolvedResourceHints} defaults `matchUrlHints(rules, request)` result
     * @returns {void}
     */
    static applyDefaults(dep: ResourceHintDep, defaults: ResolvedResourceHints): void;
    /**
     * Apply already-parsed `webpackPrefetch` / `webpackPreload` /
     * `webpackFetchPriority` / `webpackAs` / `webpackType` / `webpackMedia`
     * overrides to a URL asset dep. Each field wins over the project-wide
     * default only when it's explicitly set on the magic comment.
     * @param {ResourceHintDep} dep dep to mutate
     * @param {ResourceHintOptions} hints parsed hint options
     * @returns {void}
     */
    static applyParsedHints(dep: ResourceHintDep, hints: parseResourceHintOptions.ResourceHintOptions): void;
    /**
     * Match `urlHints` for `request` + apply per-URL magic-comment overrides
     * to a URL asset dep. Called from every URL-emitting parser (JS
     * `new URL(...)`, CSS `url(...)`, HTML `<img src>` / `<link href>`,
     * `new Worker(new URL(...))`) so all sources share the same precedence:
     * rule defaults first, magic comments win.
     * @param {ResourceHintDep} dep dep to mutate in place
     * @param {UrlHintRule[] | undefined} rules parser-scoped `urlHints` rules
     * @param {string} request the asset request (for rule matching)
     * @param {MagicCommentOptions | null | undefined} commentOptions parsed magic-comment options (`null` / `undefined` skips override phase)
     * @param {import("../module/NormalModule")} module module for emitting warnings on invalid comments
     * @param {import("../graph/Dependency").DependencyLocation} loc loc for warnings
     * @returns {void}
     */
    static applyResourceHints(dep: ResourceHintDep, rules: UrlHintRule[] | undefined, request: string, commentOptions: MagicCommentOptions | null | undefined, module: import("../module/NormalModule"), loc: import("../graph/Dependency").DependencyLocation): void;
    /**
     * @param {ResourceHintsOptions=} options normalized `output.resourceHints`
     */
    constructor(options?: ResourceHintsOptions | undefined);
    /** @type {ResourceHintsConfig | undefined} */
    _hints: ResourceHintsConfig | undefined;
    /**
     * @param {Compiler} compiler the compiler
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ResourceHintPlugin {
    export { StartupHintAttributes, AssetHintEntry, ResolvedResourceHints, ResourceHintDep, HtmlHintedAsset, EntrypointHint, CompilationResolver };
}
import type { ResourceHintsInitial as ResourceHintsConfig } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
import type Compilation from "../Compilation";
import type { UrlHintRule } from "../../declarations/WebpackOptions";
import parseResourceHintOptions = require("./parseResourceHintOptions");
import type { MagicCommentOptions } from "../util/magicComment";
import type { ResourceHintsOptions } from "../../declarations/WebpackOptions";
/**
 * The attributes a `<link>` carries besides its href and `as`.
 */
type StartupHintAttributes = {
    fetchPriority?: ("low" | "high" | "auto" | undefined) | undefined;
    type?: string | undefined;
    media?: string | undefined;
};
/**
 * One asset a chunk hints at startup, merged across every reference to it.
 */
type AssetHintEntry = {
    /**
     * the asset the `<link>` points at
     */
    assetModule: Module;
    /**
     * the chunk module the reference was written in, which is what a baked href is relative to
     */
    originModule: Module;
    /**
     * the original request, for guessing the `as` attribute
     */
    request: string;
    /**
     * preload rather than prefetch
     */
    preload: boolean;
    fetchPriority: ("low" | "high" | "auto" | undefined);
    as: (string | undefined);
    type: (string | undefined);
    media: (string | undefined);
};
type ResolvedResourceHints = {
    /**
     * project-wide default for `webpackPrefetch`
     */
    prefetch?: boolean | undefined;
    /**
     * project-wide default for `webpackPreload`
     */
    preload?: boolean | undefined;
    /**
     * project-wide default for `webpackFetchPriority`
     */
    fetchPriority?: ("low" | "high" | "auto" | false) | undefined;
    /**
     * project-wide default for `webpackAs`
     */
    as?: string | undefined;
    /**
     * project-wide default for `webpackType`
     */
    type?: string | undefined;
    /**
     * project-wide default for `webpackMedia`
     */
    media?: string | undefined;
};
/**
 * A URL-referenced-asset dependency that can carry resource-hint state.
 * `URLDependency`, `CssUrlDependency` and `HtmlSourceDependency` all share
 * these field names — the `applyResourceHints` statics mutate them in place.
 */
type ResourceHintDep = {
    prefetch: true | undefined;
    preload: true | undefined;
    fetchPriority: ("low" | "high" | "auto" | undefined);
    asAttribute: string | undefined;
    typeAttribute: string | undefined;
    mediaAttribute: string | undefined;
};
/**
 * A URL-referenced asset an HTML entry should emit as `<link>` in its `<head>`.
 */
type HtmlHintedAsset = {
    /**
     * the asset module (source-of-truth for the URL)
     */
    module: Module;
    /**
     * the URL/CSS/HTML source dep carrying the hint flags
     */
    dep: ResourceHintDep;
};
/**
 * A resolved resource-hint descriptor emitted for an entrypoint — the shape
 * consumed by `stats.entrypoints[name].resourceHints` and by SSR frameworks
 * that render the initial HTML themselves.
 */
type EntrypointHint = {
    rel: "preload" | "prefetch" | "modulepreload" | "preconnect";
    /**
     * emitted URL (public path applied)
     */
    href: string;
    as?: string | undefined;
    type?: string | undefined;
    media?: string | undefined;
    fetchPriority?: ("low" | "high" | "auto") | undefined;
    crossorigin?: (boolean | "anonymous" | "use-credentials") | undefined;
    /**
     * names of the entrypoint chunks this hint originates from (Vite's `hostId`) — lets the callback rewrite per referencing chunk
     */
    hostChunks?: string[] | undefined;
};
type CompilationResolver = {
    /**
     * the effective `output.resourceHints` value (`undefined` when unset)
     */
    hints: ResourceHintsConfig | undefined;
    /**
     * URL asset descriptors reachable from an HTML entrypoint's initial chunks — `HtmlEntryDependency` template consumes this list to emit `<link>` tags into the extracted HTML `<head>`
     */
    getHtmlHinted: (entryName: string) => HtmlHintedAsset[];
    /**
     * true when `assetModule` appears in *any* HTML entry's hinted list — the JS chunk-startup runtime skips it so the DOM never carries two tags for one URL
     */
    isHtmlHinted: (assetModule: Module) => boolean;
    /**
     * resolved `<link>`-shaped descriptors for the given entry — auto initial-graph hints plus URL asset hints, then filtered / rewritten through the user function (when `output.resourceHints` is a function). Reads via `stats.entrypoints[name].resourceHints`.
     */
    getEntrypointHints: (entryName: string) => EntrypointHint[];
};
import type Module from "../module/Module";
