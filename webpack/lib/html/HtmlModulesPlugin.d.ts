export = HtmlModulesPlugin;
declare class HtmlModulesPlugin {
    /**
     * `output.hashFunction`/`hashSalt`/`hashDigest`/`hashDigestLength`
     * digest of `content`, with `nonNumericOnlyHash` applied — webpack's
     * standard `[contenthash]` recipe.
     * @param {string | Buffer} content content to hash
     * @param {OutputOptions} outputOptions output options
     * @returns {string} content hash
     */
    static computeContentHash(content: string | Buffer, outputOptions: OutputOptions): string;
    /**
     * Filename template for an extracted HTML page: `output.htmlFilename` for
     * initial chunks, `output.htmlChunkFilename` otherwise — the HTML counterpart
     * of `CssModulesPlugin.getChunkFilenameTemplate`.
     * @param {import("../graph/Chunk")} chunk chunk
     * @param {OutputOptions} outputOptions output options
     * @returns {import("../graph/Chunk").ChunkFilenameTemplate} used filename template
     */
    static getChunkFilenameTemplate(chunk: import("../graph/Chunk"), outputOptions: OutputOptions): import("../graph/Chunk").ChunkFilenameTemplate;
    /**
     * Returns true, when the chunk has html.
     * @param {Chunk} chunk chunk
     * @param {ChunkGraph} chunkGraph chunk graph
     * @returns {boolean} true, when the chunk has html
     */
    static chunkHasHtml(chunk: Chunk, chunkGraph: ChunkGraph): boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace HtmlModulesPlugin {
    export { getCompilationHooks, FaviconOption, ManifestOption, FaviconIcon, EntryData, HtmlEntryInfo, PendingName, HtmlTransformHtmlContext, HtmlEmittedContext, HtmlTagDescriptor, HtmlInjectTagsContext, HtmlMutableTag, HtmlTransformTagsContext, HtmlEntrySpec, HtmlCompilationHooks };
}
import type Compiler from "../Compiler";
import type { OutputNormalizedWithDefaults as OutputOptions } from "../config/defaults";
import type Chunk from "../graph/Chunk";
import type ChunkGraph from "../graph/ChunkGraph";
declare var getCompilationHooks: (compilation: import("../Compilation")) => {
    /**
     * Called with the list of extra tags to inject into each page (initially empty) plus the current HTML; push `HtmlTagDescriptor`s and return the list — webpack serializes and places them by `injectTo`. A structured alternative to the string-level `transformHtml` for adding tags; runs before CSP so injected inline tags are hashed.
     * @type {AsyncSeriesWaterfallHook<[HtmlTagDescriptor[], HtmlInjectTagsContext]>}
     * @since 5.109.0
     */
    injectTags: AsyncSeriesWaterfallHook<[HtmlTagDescriptor[], HtmlInjectTagsContext]>;
    /**
     * Called with the page's `<script>`/`<link>`/`<style>`/`<meta>` tags (webpack's own and any injected) as mutable descriptors; mutate `attrs` (add a `nonce`/`data-*`, switch `defer`↔`async`, …), set `remove: true`, or change `injectTo` to move a tag between `<head>` and `<body>`, and webpack rewrites the changed tags. Add new tags with `injectTags` instead.
     * @type {AsyncSeriesHook<[HtmlMutableTag[], HtmlTransformTagsContext]>}
     * @since 5.109.0
     */
    transformTags: AsyncSeriesHook<[HtmlMutableTag[], HtmlTransformTagsContext]>;
    /**
     * Called with each emitted page's final HTML (all sentinels resolved) just before it is written; return the (possibly transformed) HTML — e.g. to minify, inject a CSP meta, or rewrite tags.
     * @type {AsyncSeriesWaterfallHook<[string, HtmlTransformHtmlContext]>}
     * @since 5.109.0
     */
    transformHtml: AsyncSeriesWaterfallHook<[string, HtmlTransformHtmlContext]>;
    /**
     * Called once each page's HTML asset has been finalized — a post-emit notification (nothing to return).
     * @type {AsyncSeriesHook<[HtmlEmittedContext]>}
     * @since 5.109.0
     */
    htmlEmitted: AsyncSeriesHook<[HtmlEmittedContext]>;
};
type FaviconOption = import("../../declarations/WebpackOptions").OutputHtmlOptions["favicon"];
type ManifestOption = import("../../declarations/WebpackOptions").OutputHtmlOptions["manifest"];
type FaviconIcon = Exclude<HtmlFaviconIcon, string>;
type EntryData = import("../Compilation").EntryData;
type HtmlEntryInfo = {
    request: string;
    entryName: string;
    index: number;
    type: "script" | "script-module" | "modulepreload" | "stylesheet" | "html" | "preload" | "prefetch";
    css?: boolean;
    chunkName?: string;
};
/**
 * What one extracted entry needs to be named. Recorded in page order once
 * every page is built, and resolved to filenames once chunks exist.
 */
type PendingName = {
    /**
     * name the tag's url (or its page) asks for, before numbering
     */
    base: string;
    /**
     * `output.filename` for this entry, as configured
     */
    jsTemplate: FilenameTemplate;
    /**
     * name of a page-only entry, which emits nothing and leaves it free
     */
    freeName?: string | undefined;
};
type HtmlTransformHtmlContext = {
    outputName: string;
};
type HtmlEmittedContext = {
    outputName: string;
};
/**
 * A tag to inject into an emitted page as a structured descriptor. Injected
 * verbatim (not re-bundled) at the `injectTo` position.
 */
type HtmlTagDescriptor = {
    /**
     * tag name, e.g. `"script"` / `"link"` / `"meta"`
     */
    tag: string;
    /**
     * attributes; `true` renders a bare boolean attribute, `false`/`undefined` is omitted
     */
    attrs?: Record<string, string | boolean | undefined> | undefined;
    /**
     * inner content (ignored for void elements like `<link>`/`<meta>`)
     */
    children?: string | undefined;
    /**
     * placement; defaults to `"head"`
     */
    injectTo?: ("head" | "body" | "head-prepend" | "body-prepend") | undefined;
    /**
     * force a void element (no closing tag); inferred from the tag name when omitted
     */
    voidTag?: boolean | undefined;
};
type HtmlInjectTagsContext = {
    outputName: string;
    html: string;
};
/**
 * A `<script>`/`<link>`/`<style>`/`<meta>` tag already present in an emitted
 * page, exposed for in-place mutation by `transformTags`. Mutate `attrs`, set
 * `remove`, or change `injectTo` to move it; don't reorder the array itself.
 */
type HtmlMutableTag = {
    /**
     * the (lowercased) tag name
     */
    tag: string;
    /**
     * mutable attributes; a string value renders `name="value"`, `true` a bare attribute, `false`/`undefined`/deleting the key drops it
     */
    attrs: Record<string, string | boolean | undefined>;
    /**
     * the tag's current region (`"head"`/`"body"`); set a different value to move it there (`*-prepend` to the region's start)
     */
    injectTo?: ("head" | "body" | "head-prepend" | "body-prepend") | undefined;
    /**
     * set true to delete the whole element
     */
    remove?: boolean | undefined;
};
type HtmlTransformTagsContext = {
    outputName: string;
    html: string;
};
type HtmlEntrySpec = {
    context: string;
    request: string;
    name: string;
    index: number;
    dependOn: string[] | undefined;
    page: boolean;
};
type HtmlCompilationHooks = ReturnType<typeof createCompilationHooks>;
import Compilation = require("../Compilation");
import { AsyncSeriesWaterfallHook } from "tapable";
import { AsyncSeriesHook } from "tapable";
import type { HtmlFaviconIcon } from "../../declarations/WebpackOptions";
import type { FilenameTemplate } from "../../declarations/WebpackOptions";
/**
 * @import {
 * 	EntryDescriptionNormalized,
 * 	FilenameTemplate,
 * 	OutputHtmlOptions,
 * 	HtmlFaviconIcon
 * } from "../../declarations/WebpackOptions"
 */
/**
 * @import {
 * 	OutputNormalizedWithDefaults as OutputOptions
 * } from "../config/defaults"
 */
/** @typedef {import("../../declarations/WebpackOptions").OutputHtmlOptions["favicon"]} FaviconOption */
/** @typedef {import("../../declarations/WebpackOptions").OutputHtmlOptions["manifest"]} ManifestOption */
/** @typedef {Exclude<HtmlFaviconIcon, string>} FaviconIcon */
/** @import Chunk, { ChunkFilenameTemplate } from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import Compiler from "../Compiler" */
/** @import Module from "../module/Module" */
/** @typedef {import("../Compilation").EntryData} EntryData */
/** @import { BuiltHtmlModule, HtmlModuleBuildInfo } from "./HtmlModule" */
/** @import HtmlParser from "./HtmlParser" */
/** @typedef {{ request: string, entryName: string, index: number, type: "script" | "script-module" | "modulepreload" | "stylesheet" | "html" | "preload" | "prefetch", css?: boolean, chunkName?: string }} HtmlEntryInfo */
/**
 * What one extracted entry needs to be named. Recorded in page order once
 * every page is built, and resolved to filenames once chunks exist.
 * @typedef {object} PendingName
 * @property {string} base name the tag's url (or its page) asks for, before numbering
 * @property {FilenameTemplate} jsTemplate `output.filename` for this entry, as configured
 * @property {string=} freeName name of a page-only entry, which emits nothing and leaves it free
 */
/** @typedef {{ outputName: string }} HtmlTransformHtmlContext */
/** @typedef {{ outputName: string }} HtmlEmittedContext */
/**
 * A tag to inject into an emitted page as a structured descriptor. Injected
 * verbatim (not re-bundled) at the `injectTo` position.
 * @typedef {object} HtmlTagDescriptor
 * @property {string} tag tag name, e.g. `"script"` / `"link"` / `"meta"`
 * @property {Record<string, string | boolean | undefined>=} attrs attributes; `true` renders a bare boolean attribute, `false`/`undefined` is omitted
 * @property {string=} children inner content (ignored for void elements like `<link>`/`<meta>`)
 * @property {("head" | "body" | "head-prepend" | "body-prepend")=} injectTo placement; defaults to `"head"`
 * @property {boolean=} voidTag force a void element (no closing tag); inferred from the tag name when omitted
 */
/** @typedef {{ outputName: string, html: string }} HtmlInjectTagsContext */
/**
 * A `<script>`/`<link>`/`<style>`/`<meta>` tag already present in an emitted
 * page, exposed for in-place mutation by `transformTags`. Mutate `attrs`, set
 * `remove`, or change `injectTo` to move it; don't reorder the array itself.
 * @typedef {object} HtmlMutableTag
 * @property {string} tag the (lowercased) tag name
 * @property {Record<string, string | boolean | undefined>} attrs mutable attributes; a string value renders `name="value"`, `true` a bare attribute, `false`/`undefined`/deleting the key drops it
 * @property {("head" | "body" | "head-prepend" | "body-prepend")=} injectTo the tag's current region (`"head"`/`"body"`); set a different value to move it there (`*-prepend` to the region's start)
 * @property {boolean=} remove set true to delete the whole element
 */
/** @typedef {{ outputName: string, html: string }} HtmlTransformTagsContext */
/** @typedef {{ context: string, request: string, name: string, index: number, dependOn: string[] | undefined, page: boolean }} HtmlEntrySpec */
declare function createCompilationHooks(): {
    /**
     * Called with the list of extra tags to inject into each page (initially empty) plus the current HTML; push `HtmlTagDescriptor`s and return the list — webpack serializes and places them by `injectTo`. A structured alternative to the string-level `transformHtml` for adding tags; runs before CSP so injected inline tags are hashed.
     * @type {AsyncSeriesWaterfallHook<[HtmlTagDescriptor[], HtmlInjectTagsContext]>}
     * @since 5.109.0
     */
    injectTags: AsyncSeriesWaterfallHook<[HtmlTagDescriptor[], HtmlInjectTagsContext]>;
    /**
     * Called with the page's `<script>`/`<link>`/`<style>`/`<meta>` tags (webpack's own and any injected) as mutable descriptors; mutate `attrs` (add a `nonce`/`data-*`, switch `defer`↔`async`, …), set `remove: true`, or change `injectTo` to move a tag between `<head>` and `<body>`, and webpack rewrites the changed tags. Add new tags with `injectTags` instead.
     * @type {AsyncSeriesHook<[HtmlMutableTag[], HtmlTransformTagsContext]>}
     * @since 5.109.0
     */
    transformTags: AsyncSeriesHook<[HtmlMutableTag[], HtmlTransformTagsContext]>;
    /**
     * Called with each emitted page's final HTML (all sentinels resolved) just before it is written; return the (possibly transformed) HTML — e.g. to minify, inject a CSP meta, or rewrite tags.
     * @type {AsyncSeriesWaterfallHook<[string, HtmlTransformHtmlContext]>}
     * @since 5.109.0
     */
    transformHtml: AsyncSeriesWaterfallHook<[string, HtmlTransformHtmlContext]>;
    /**
     * Called once each page's HTML asset has been finalized — a post-emit notification (nothing to return).
     * @type {AsyncSeriesHook<[HtmlEmittedContext]>}
     * @since 5.109.0
     */
    htmlEmitted: AsyncSeriesHook<[HtmlEmittedContext]>;
};
