export = HtmlGenerator;
/**
 * The module type the JSDoc inherited from `Generator` names.
 * @typedef {HtmlNormalModule} TModule
 */
/**
 * @extends {Generator<TModule>}
 */
declare class HtmlGenerator extends Generator<HtmlNormalModule> {
    /**
     * Emit a sentinel for a chunk URL that can't be resolved at code-gen time
     * (chunk hashes aren't computed yet); `resolveChunkUrlSentinels` swaps it
     * for `${PUBLIC_PATH_AUTO}<chunkFilename>` once they are.
     * @param {Chunk} chunk chunk
     * @param {"javascript" | "css"} contentHashType which chunk content hash slot the resolved URL should reference
     * @returns {string} sentinel
     */
    static makeChunkUrlSentinel(chunk: Chunk, contentHashType: "javascript" | "css"): string;
    /**
     * Replace every `makeChunkUrlSentinel` sentinel in `content` with
     * `${PUBLIC_PATH_AUTO}<chunkFilename>`. Must run after
     * `Compilation#createHash()` so `[contenthash]` resolves.
     * @param {string} content content
     * @param {Compilation} compilation compilation
     * @returns {string} resolved content
     */
    static resolveChunkUrlSentinels(content: string, compilation: Compilation): string;
    /**
     * Emit a sentinel for a linked HTML page's URL (a tag the user mapped to
     * the `html` source `type`). The page's emitted filename isn't known at
     * code-gen time; `resolveHtmlPageUrlSentinels` swaps it for
     * `${PUBLIC_PATH_AUTO}<htmlFilename>` once the page has been built.
     * @param {string | number} moduleId id of the linked HTML module
     * @returns {string} sentinel
     */
    static makeHtmlPageUrlSentinel(moduleId: string | number): string;
    /**
     * Replace every `makeHtmlPageUrlSentinel` sentinel in `content` with
     * `${PUBLIC_PATH_AUTO}<htmlFilename>`, resolving each linked page's emitted
     * filename through `getFilename`.
     * @param {string} content content
     * @param {(moduleId: string) => string} getFilename maps a linked module id to its emitted html filename
     * @returns {string} resolved content
     */
    static resolveHtmlPageUrlSentinels(content: string, getFilename: (moduleId: string) => string): string;
    /**
     * Emit a sentinel for a URL-referenced asset module. Resolved by
     * `resolveAssetUrlSentinels` from the asset module's own codegen data
     * (`data.get("url")`), which isn't populated when `HtmlEntryDependency`
     * runs — the asset module's own codegen may still be pending.
     * @param {string} moduleIdentifier the referenced asset module's `identifier()`
     * @returns {string} sentinel
     */
    static makeAssetUrlSentinel(moduleIdentifier: string): string;
    /**
     * Replace every `makeAssetUrlSentinel` in `content` with the asset module's
     * emitted URL, read from its codegen data. Unresolved sentinels (module
     * absent, no codegen result yet, or no URL channel — e.g. an inlined
     * data-URI) map to `data:,` so the surrounding `<link>` degrades cleanly
     * instead of shipping the raw placeholder.
     * @param {string} content content
     * @param {Compilation} compilation compilation
     * @returns {string} resolved content
     */
    static resolveAssetUrlSentinels(content: string, compilation: Compilation): string;
    /**
     * Turns SRI sentinel emission on for this compilation. Tags are generated
     * once per HTML module, but one module can back several pages with different
     * `integrity` options, so HtmlModulesPlugin flags the compilation when any
     * page wants SRI and each page resolves or strips the sentinels on emit.
     * @param {Compilation} compilation compilation
     * @returns {void}
     */
    static enableIntegritySentinels(compilation: Compilation): void;
    /**
     * @param {Compilation} compilation compilation
     * @returns {boolean} true when SRI sentinels must be emitted
     */
    static hasIntegritySentinels(compilation: Compilation): boolean;
    /**
     * Emit a sentinel for a chunk's SRI hash. Resolved late (after
     * `RealContentHashPlugin`) by `resolveChunkIntegritySentinels`, since the
     * hash must cover the chunk's final emitted bytes.
     * @param {Chunk} chunk chunk
     * @param {"javascript" | "css"} contentHashType which chunk asset to hash
     * @returns {string} sentinel
     */
    static makeChunkIntegritySentinel(chunk: Chunk, contentHashType: "javascript" | "css"): string;
    /**
     * Drop every ` integrity="<sentinel>"` from `content`. Used on the HTML
     * string embedded in a JS chunk (e.g. `<iframe srcdoc>`), where a real SRI
     * hash can't be produced — the chunk's own bytes aren't final at render time
     * — and resolving it later would mutate the chunk after its content hash was
     * computed. Only real HTML output assets keep the sentinel for late resolution.
     * @param {string} content content
     * @returns {string} content with integrity sentinels removed
     */
    static stripChunkIntegritySentinels(content: string): string;
    /**
     * Replace every ` integrity="<sentinel>"` with the chunk's real SRI hashes,
     * or drop the attribute when `integrity` (a function) returns `false` for it.
     * @param {string} content content
     * @param {Compilation} compilation compilation
     * @param {HtmlIntegrity} integrity the `output.html.integrity` option
     * @returns {string} resolved content
     */
    static resolveChunkIntegritySentinels(content: string, compilation: Compilation, integrity: HtmlIntegrity): string;
    /**
     * Whether a chunk's content may be written into the page at all. An ES
     * module chunk another group loads the runtime from must stay a file, or
     * the page would run two copies of it.
     * @param {Compilation} compilation the compilation
     * @param {Chunk} chunk chunk to test
     * @returns {boolean} false when the chunk has to stay a separate file
     */
    static canInlineChunk(compilation: Compilation, chunk: Chunk): boolean;
    /**
     * Whether `output.html.inline` writes a chunk's content into the page rather
     * than referencing it. The string forms select by asset type, since a
     * chunk's JavaScript and CSS share one name.
     * @param {HtmlOption} htmlOption the `output.html` option
     * @param {Chunk} chunk chunk to test
     * @param {"javascript" | "css"} contentType which asset of the chunk is emitted
     * @returns {boolean} true when that content is written into the page
     */
    static isChunkInlined(htmlOption: HtmlOption, chunk: Chunk, contentType: "javascript" | "css"): boolean;
    /**
     * @param {Chunk} chunk chunk
     * @param {"javascript" | "css"} contentHashType which chunk asset to inline
     * @returns {string} sentinel
     */
    static makeChunkInlineSentinel(chunk: Chunk, contentHashType: "javascript" | "css"): string;
    /**
     * Replace every inline sentinel with the chunk's actual source content.
     * Must run after `RealContentHashPlugin` so the final emitted filenames are
     * known (we look up the asset by filename from `chunk.files`).
     * @param {string} content content
     * @param {Compilation} compilation compilation
     * @param {string} htmlFilename output name of the HTML file being resolved (to rebase CSS urls)
     * @param {Set<string>=} inlinedFiles collects every chunk file inlined here, so the caller can drop now-unreferenced assets
     * @returns {string} resolved content
     */
    static resolveChunkInlineSentinels(content: string, compilation: Compilation, htmlFilename: string, inlinedFiles?: Set<string> | undefined): string;
    /**
     * Parses the final HTML once and collects everything the `output.html`
     * post-processing stages need: every `<script>`/`<link>`/`<style>`/`<meta>` as
     * a mutable descriptor (for `transformTags`) paired with its source span, an
     * attribute snapshot (to detect changes), and — for `<script>`/`<style>` — the
     * raw-text body range and nonce insertion point (for CSP); plus the
     * `<head>`/`<body>` open/content-end anchors (for `injectTags`). One parse feeds
     * `injectTags` + `transformTags` + CSP, which `renderHtml` then applies in a
     * single pass. Uses the pipeline's own parser (no regex).
     * @param {string} content the final HTML (inline content already resolved)
     * @returns {HtmlModel} the collected model
     */
    static collectHtml(content: string): HtmlModel;
    /**
     * Appends `injectTags` descriptors to the model as spanless tags (pure inserts
     * placed by `injectTo`), so `transformTags` sees them alongside the page's own
     * tags and CSP hashes any injected inline `<script>`/`<style>`. `attrs` is
     * copied so a `transformTags` mutation never corrupts the caller's descriptor.
     * @param {HtmlModel} model the value from `collectHtml`
     * @param {HtmlTagDescriptor[]} injected the `injectTags` descriptors
     * @returns {void}
     */
    static addInjectedTags(model: HtmlModel, injected: HtmlTagDescriptor[]): void;
    /**
     * Renders the collected (and hook-mutated) model back into HTML in a single
     * pass: injected tags are placed by `injectTo`; an existing tag is left
     * byte-for-byte unless it was removed, moved (`<head>`↔`<body>`, honoring
     * `*-prepend`), or had its `attrs` changed; and — when `csp` is set and the
     * page declares no CSP — a strict `<meta http-equiv="Content-Security-Policy">`
     * is injected with a hash of every inline `<script>`/`<style>` (page's own and
     * injected) plus an optional placeholder `nonce` on each. Edits are applied
     * in one ascending pass; at a shared offset an insert is emitted before a
     * delete/replace's text.
     * @param {string} content the collected HTML (inline content already resolved)
     * @param {HtmlModel} model the value from `collectHtml` after the hooks
     * @param {CspOption} csp the `output.html.csp` option
     * @returns {string} the rendered HTML
     */
    static renderHtml(content: string, model: HtmlModel, csp: CspOption): string;
    /**
     * Embeds each inlined chunk's content hash into its inline sentinel
     * (`…__<type>__END__` → `…__<type>__<hash>__END__`). The sentinel otherwise
     * carries only the stable chunk id, so the host HTML's bytes wouldn't change
     * when the inlined content changes — the resolved chunk URL that normally
     * busts the page `[contenthash]` is gone once inlined. Embedding the hash
     * makes the emitted bytes content-dependent, so both the initial hash and
     * RealContentHashPlugin's recompute pick up inlined-content changes. The
     * resolver (`resolveChunkInlineSentinels`) ignores this segment.
     * @param {string} content content with chunk-url sentinels already resolved
     * @param {Compilation} compilation compilation
     * @returns {string} content with content-hash-tagged inline sentinels
     */
    static embedInlineChunkHashes(content: string, compilation: Compilation): string;
    /**
     * Creates an instance of HtmlGenerator.
     * @param {HtmlGeneratorOptions=} options generator options
     * @param {ModuleGraph=} moduleGraph the module graph; used to detect when an HTML module is reached as a compilation entry so `extract` can default to `true` for it
     * @param {((module: NormalModule) => boolean)=} isPageOnly tells whether the module's only output is its emitted page, so it exposes no JavaScript
     */
    constructor(options?: HtmlGeneratorOptions | undefined, moduleGraph?: ModuleGraph | undefined, isPageOnly?: ((module: NormalModule) => boolean) | undefined);
    /** @type {HtmlGeneratorOptions} */
    options: HtmlGeneratorOptions;
    /** @type {ModuleGraph | undefined} */
    _moduleGraph: ModuleGraph | undefined;
    /** @type {((module: NormalModule) => boolean) | undefined} */
    _isPageOnly: ((module: NormalModule) => boolean) | undefined;
    /** @type {WeakMap<RuntimeRequirements, string>} */
    _rawRenderCache: WeakMap<Module.RuntimeRequirements, string>;
    /**
     * Whether this HTML module is reached as a compilation entry. Entry
     * modules have at least one incoming connection without an
     * `originModule` (the EntryDependency added by `compilation.addEntry`) —
     * this covers both HTML-as-entry-point and a linked `type: "html"` page
     * (added as its own entry by HtmlModulesPlugin).
     * @param {TModule} module module
     * @returns {boolean} true when the module is an entry
     */
    _isEntryModule(module: TModule): boolean;
    /**
     * Whether to emit the extracted `.html` file for this module.
     * `options.extract === true` always extracts; `false` and `"inline"` never;
     * when the option is left unspecified, extraction defaults to on for HTML
     * modules used as compilation entries — that's the HTML-as-entry-point case
     * and a linked `type: "html"` page (which is added as its own entry).
     * @param {TModule} module module
     * @returns {boolean} true when the `.html` file should be emitted
     */
    _shouldExtract(module: TModule): boolean;
    /**
     * Whether this module exposes the `html` source type. Like `_shouldExtract`,
     * but `"inline"` also exposes it — the processed HTML is read back into the
     * host attribute (e.g. `<iframe srcdoc>`) instead of emitted as a file.
     * @param {TModule} module module
     * @returns {boolean} true when the `html` source type is available
     */
    _shouldExposeHtmlType(module: TModule): boolean;
    /**
     * Processes the provided module.
     * @param {Dependency} dependency the dependency to generate
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {DependencyTemplateContext} templateContext the template context (shared across all dependencies of the module)
     * @returns {void}
     */
    sourceDependency(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    /**
     * Processes the provided dependencies block.
     * @param {import("../graph/DependenciesBlock")} block the dependencies block which will be processed
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {DependencyTemplateContext} templateContext the template context
     * @returns {void}
     */
    sourceBlock(block: import("../graph/DependenciesBlock"), source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    /**
     * Processes the provided module.
     * @param {TModule} module the module to generate
     * @param {InitFragment<GenerateContext>[]} initFragments mutable list of init fragments
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {GenerateContext} generateContext the generateContext
     * @returns {void}
     */
    sourceModule(module: TModule, initFragments: InitFragment<Generator.GenerateContext>[], source: ReplaceSource, generateContext: Generator.GenerateContext): void;
    /**
     * Run all HTML dependency templates against the original module source and
     * return the rewritten HTML. When `undoPath` is a string, `[webpack/auto]`
     * placeholders left in by asset/url dependencies are resolved to that
     * undo path (use `""` to make URLs root-relative). When `undoPath` is
     * `undefined`, the placeholders are preserved so the caller (typically
     * `HtmlModulesPlugin#renderManifest`, which only knows the final
     * `.html` filename after code generation) can resolve them itself.
     * @param {TModule} module the module to render
     * @param {GenerateContext} generateContext the generate context
     * @param {string=} undoPath value to substitute for `[webpack/auto]` placeholders
     * @returns {string} the rewritten HTML
     */
    _renderHtml(module: TModule, generateContext: Generator.GenerateContext, undoPath?: string | undefined): string;
    /**
     * Emits the JS shim with HMR self-acceptance. When `extracting` is true the
     * HTML module is also the document the browser is viewing, so the shim
     * additionally patches `document.body` and `document.title` on every hot
     * update so the rendered page reflects the new HTML without a full
     * reload. The patching guard `module.hot.data` ensures the body is only
     * replaced on a re-evaluation after a hot update — never on the initial
     * page load, where `document.body` already matches the extracted HTML.
     *
     * The runtime extracts the body / title / head-sans-title sections from
     * the HTML with regexes. HTML comments are *masked* first — their
     * characters replaced with spaces, preserving length — via a `<!--…-->`
     * regex, so a `<body>` (or `</body>` / `<title>` / etc.) that appears
     * inside a comment can't fool the tag regexes — that was the one
     * well-known sharp edge of HTML+regex. Because masking keeps offsets
     * stable, the body / title content is sliced back out of the *original*
     * HTML, so real comments inside `<body>` survive into the patched DOM
     * exactly as a full page reload would render them.
     *
     * `<head>` changes beyond `<title>` (a new `<meta>`, a swapped
     * `<link rel=icon>`, an inline `<style>` block, …) are applied as a
     * delta against the previous evaluation's authored head. Replacing
     * `document.head.innerHTML` wholesale would tear down the runtime
     * scripts and stylesheet links webpack injects there on initial load;
     * a delta cannot, since those appear in neither authored head. An
     * added `<script>` is re-created before it is inserted, so it runs the
     * way the reload this replaces would have run it, and every addition
     * lands at its authored position rather than at the end. Two edits are
     * still worth reloading for: a removed `<script>` the browser *executed*,
     * since one that has run cannot be un-run (a removed data block such as
     * `application/ld+json` never ran, so it is patched like any other
     * element), and a reordering of elements the delta cannot
     * express — fine in a dev-server context because the regular
     * (non-hot-update) `page.html` chunk is re-emitted on every rebuild,
     * so the reloaded page picks up the new head.
     * @param {TModule} module module
     * @param {string} html the rewritten HTML content (with placeholders resolved)
     * @param {boolean} extracting whether the HTML module is being extracted as a real `.html` file
     * @param {RuntimeTemplate} runtimeTemplate runtime template (drives `const`/arrow emission based on environment support)
     * @returns {string} JS shim source
     */
    _renderHmrShim(module: TModule, html: string, extracting: boolean, runtimeTemplate: RuntimeTemplate): string;
    /**
     * Generates fallback output for the provided error condition.
     * @param {Error} error the error
     * @param {TModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: TModule, generateContext: Generator.GenerateContext): Source | null;
}
declare namespace HtmlGenerator {
    export { CspOption, HtmlOption, HtmlTagLocation, HtmlTagSpan, HtmlAnchors, HtmlModel, HtmlIntegrity, InitFragment, TModule };
}
import type { HtmlNormalModule } from "./HtmlModule";
import Generator = require("../module/Generator");
import type { HtmlGeneratorOptions } from "../../declarations/WebpackOptions";
import type ModuleGraph from "../graph/ModuleGraph";
import type NormalModule from "../module/NormalModule";
import type Module from "../module/Module";
import type Dependency from "../graph/Dependency";
import { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../template/DependencyTemplate";
import type RuntimeTemplate from "../template/RuntimeTemplate";
import type { Source } from "webpack-sources";
import type Chunk from "../graph/Chunk";
import type Compilation from "../Compilation";
import type { HtmlTagDescriptor } from "./HtmlModulesPlugin";
type CspOption = import("../../declarations/WebpackOptions").OutputHtmlOptions["csp"];
type HtmlOption = import("../../declarations/WebpackOptions").OutputNormalized["html"];
type HtmlTagLocation = "head" | "body";
type HtmlTagSpan = {
    /**
     * opening `<` offset
     */
    start: number;
    /**
     * offset just after the opening `>`
     */
    openEnd: number;
    /**
     * offset just after the whole element
     */
    end: number;
    /**
     * the `<head>`/`<body>` region it sits in
     */
    location: HtmlTagLocation;
    /**
     * offset after the tag name (nonce insertion point), `-1` for non-`<script>`/`<style>`
     */
    nameEnd: number;
    /**
     * raw-text body end for `<script>`/`<style>`, `-1` otherwise
     */
    contentEnd: number;
    /**
     * whether the element is self-closing
     */
    selfClosing: boolean;
};
type HtmlAnchors = {
    headOpen: number;
    headEnd: number;
    bodyOpen: number;
    bodyEnd: number;
};
type HtmlModel = {
    tags: HtmlMutableTag[];
    spans: (HtmlTagSpan | null)[];
    originals: (string | null)[];
    descriptors: (HtmlTagDescriptor | null)[];
    anchors: HtmlAnchors;
};
type HtmlIntegrity = boolean | string[] | ((asset: {
    chunk: Chunk;
    filename: string;
}) => string[] | false);
type InitFragment<T> = import("../template/InitFragment")<T>;
/**
 * The module type the JSDoc inherited from `Generator` names.
 */
type TModule = HtmlNormalModule;
import type { HtmlMutableTag } from "./HtmlModulesPlugin";
