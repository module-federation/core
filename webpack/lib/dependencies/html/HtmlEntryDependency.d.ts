export = HtmlEntryDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Chunk from "../../graph/Chunk" */
/** @import ChunkGraph from "../../graph/ChunkGraph" */
/** @import Dependency, { DependencyKinds } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import Entrypoint from "../../graph/Entrypoint" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {"script" | "script-module" | "modulepreload" | "stylesheet" | "html" | "preload" | "prefetch"} HtmlEntryElementKind */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string, HtmlEntryElementKind, number, number, boolean, string, number, boolean, number, (Range | null), (Range | null), boolean, number, number]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string, HtmlEntryElementKind, number, number, boolean, string, number, boolean, number, (Range | null), (Range | null), boolean, number, number]>} ObjectSerializerContext */
declare class HtmlEntryDependency extends ModuleDependency {
    /**
     * Creates an instance of HtmlEntryDependency.
     * @param {string} request request
     * @param {Range} range range of the attribute value in the source
     * @param {string} entryName name of the entry this script src is bundled into
     * @param {string=} category dependency category used for resolving and grouping
     * @param {HtmlEntryElementKind=} elementKind shape of the originating HTML element; used when expanding sibling tags for split/runtime chunks
     * @param {number=} tagStart position of the opening `<` of the originating tag in the source; sibling tags emitted for additional entry chunks are inserted right before this
     * @param {number=} tagOpenEnd position of the character immediately after the opening tag's `>` in the source; combined with `tagStart` this lets the template clone the original opening tag verbatim (preserving attributes like `nonce`, `crossorigin`, `referrerpolicy`, `defer`, `async`) when generating sibling tags
     * @param {boolean=} tagIsNative whether the originating element is the native tag for `elementKind` (`<script>` / `<link>`); decided at parse time from the tag name so the template needn't re-parse the source text. A custom element mapped to a `script`/`stylesheet` source `type` is non-native and gets a freshly synthesized sibling tag instead of a verbatim clone
     * @param {string=} copyableAttrsText the originating tag's `nonce`/`crossorigin`/`referrerpolicy` attribute source spans (leading-space-prefixed, in that fixed order), captured at parse time so synthesized sibling `<link>`/`<script>` tags carry the same CSP/fetch policy without the template re-parsing the tag text; empty when none are present
     * @param {number=} tagNameEnd position right after the originating tag's name (e.g. after `<script`), captured at parse time so the template can insert a `crossorigin` attribute without re-scanning the tag text for the name boundary
     * @param {boolean=} hasOwnCrossOrigin whether the originating tag already carries a `crossorigin` attribute; when true the author's value wins and `output.crossOriginLoading` is not applied
     * @param {number=} cssAnchor source offset of the first classic blocking `<script>` tag (not `defer`/`async`/module — those execute after parsing and after pending stylesheets); injected stylesheet `<link>`s are kept ahead of it. -1 when the document has no blocking script, letting CSS follow `defer`/module script tags (the order Vite emits)
     * @param {Range | null=} integrityRange source span of the originating tag's `integrity` attribute (offsets relative to `tagStart`, leading whitespace and quotes included), captured at parse time so cloned sibling tags can drop it without re-parsing; null when absent
     * @param {Range | null=} typeValueRange source span of the originating tag's `type` attribute value (offsets relative to `tagStart`), captured at parse time so `script-module` sibling clones can force `type="module"` in place; null when there is no value to rewrite (a `type="module"` is then inserted instead)
     * @param {boolean=} forceInline `<!-- webpackInline: true -->` was set before this tag; takes precedence over `output.html.inline`
     * @param {number=} headOpenEnd position just inside the (possibly implicit) `<head>` — after its opening tag, else after `<html>` or the doctype — captured from the parse so the template needn't re-scan the source (a text scan would match markup inside comments); resource hints are inserted here. -1 when unknown
     * @param {number=} headAnchor position right after the last node inside `<head>` (the same anchor `output.html` title/meta injection uses); `inject: "head"` sibling tags are inserted here. -1 when the document has no usable head (insertion then falls back to the entry tag)
     */
    constructor(request: string, range: Range, entryName: string, category?: string | undefined, elementKind?: HtmlEntryElementKind | undefined, tagStart?: number | undefined, tagOpenEnd?: number | undefined, tagIsNative?: boolean | undefined, copyableAttrsText?: string | undefined, tagNameEnd?: number | undefined, hasOwnCrossOrigin?: boolean | undefined, cssAnchor?: number | undefined, integrityRange?: (Range | null) | undefined, typeValueRange?: (Range | null) | undefined, forceInline?: boolean | undefined, headOpenEnd?: number | undefined, headAnchor?: number | undefined);
    /** @type {string} */
    entryName: string;
    /** @type {string} */
    _category: string;
    /** @type {HtmlEntryElementKind} */
    elementKind: HtmlEntryElementKind;
    /** @type {number} */
    tagStart: number;
    /** @type {number} */
    tagOpenEnd: number;
    /** @type {boolean} */
    tagIsNative: boolean;
    /** @type {string} */
    copyableAttrsText: string;
    /** @type {number} */
    tagNameEnd: number;
    /** @type {boolean} */
    hasOwnCrossOrigin: boolean;
    /** @type {number} */
    cssAnchor: number;
    /** @type {Range | null} */
    integrityRange: Range | null;
    /** @type {Range | null} */
    typeValueRange: Range | null;
    /** @type {boolean} */
    forceInline: boolean;
    /** @type {number} */
    headOpenEnd: number;
    /** @type {number} */
    headAnchor: number;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize(context: ObjectDeserializerContext): void;
}
declare namespace HtmlEntryDependency {
    export { HtmlEntryDependencyTemplate as Template, KINDS, HtmlEntryElementKind, ObjectDeserializerContext, ObjectSerializerContext, HtmlResourceHintRel, HtmlResourceHint, HtmlResourceHintContext };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const HtmlEntryDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class HtmlEntryDependencyTemplate extends HtmlEntryDependencyTemplate_base {
}
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type HtmlEntryElementKind = "script" | "script-module" | "modulepreload" | "stylesheet" | "html" | "preload" | "prefetch";
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string, HtmlEntryElementKind, number, number, boolean, string, number, boolean, number, (Range | null), (Range | null), boolean, number, number]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string, HtmlEntryElementKind, number, number, boolean, string, number, boolean, number, (Range | null), (Range | null), boolean, number, number]>;
type HtmlResourceHintRel = "preload" | "prefetch" | "modulepreload" | "preconnect" | "dns-prefetch";
/**
 * A custom resource-hint `<link>` (`output.html.resourceHints`). Exactly one of
 * `href` / `chunk` / `entry` names the target; `chunk`/`entry` URLs (hash and
 * public path) are resolved by webpack, `href` is used verbatim.
 */
type HtmlResourceHint = {
    /**
     * hint relationship
     */
    rel: HtmlResourceHintRel;
    /**
     * literal URL (external, `preconnect`, or an already-hashed asset)
     */
    href?: string | undefined;
    /**
     * chunk name to hint
     */
    chunk?: string | undefined;
    /**
     * entrypoint name to hint (expands to one hint per initial chunk)
     */
    entry?: string | undefined;
    /**
     * the `as` attribute; defaults to `script` for chunk/entry refs
     */
    as?: string | undefined;
    /**
     * the `type` attribute (MIME)
     */
    type?: string | undefined;
    /**
     * CORS mode (`true` → `anonymous`)
     */
    crossorigin?: (boolean | "anonymous" | "use-credentials") | undefined;
    /**
     * the `media` attribute
     */
    media?: string | undefined;
    /**
     * SRI for a chunk/entry ref; follows `output.html.integrity` by default, `false` opts out
     */
    integrity?: boolean | undefined;
    /**
     * the `fetchpriority` attribute (allowed on `preload`/`modulepreload`/`prefetch`)
     */
    fetchPriority?: ("low" | "high" | "auto") | undefined;
};
type HtmlResourceHintContext = {
    /**
     * name of the entry this page loads
     */
    entryName: string;
    /**
     * the entrypoint
     */
    entrypoint: Entrypoint;
    /**
     * `"html"` when the entry has an extracted HTML page; `"js"` when a JS-only entry is being consulted (SSR framework case)
     */
    hostType: "html" | "js";
    /**
     * the compilation
     */
    compilation: import("../../Compilation");
    /**
     * the auto initial-graph hints (`chunk` / `hostChunks` name the referencing chunk — Vite's `hostId`)
     */
    defaultHints: {
        rel: "modulepreload" | "preload" | "prefetch";
        chunk: string;
        hostChunks: string[];
    }[];
};
import type Dependency from "../../graph/Dependency";
import type Entrypoint from "../../graph/Entrypoint";
