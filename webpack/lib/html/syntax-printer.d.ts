export type EmbeddedSourceRenderer = import("./syntax-parser").EmbeddedSourceRenderer;
export type DeferredEmbeddedSource = import("./syntax-parser").DeferredEmbeddedSource;
export type HtmlNodeRef = import("./syntax-parser").HtmlNodeRef;
export type HtmlElement = import("./syntax-parser").HtmlElement;
export type HtmlDocument = import("./syntax-parser").HtmlDocument;
export type HtmlDocumentFragment = import("./syntax-parser").HtmlDocumentFragment;
export type HtmlNode = import("./syntax-parser").HtmlNode;
export type HtmlAstSkip = import("./syntax-parser").HtmlAstSkip;
export type HtmlPath = import("./syntax-parser").HtmlPath;
export type HtmlVisitableNode = HtmlNode | HtmlDocument | HtmlDocumentFragment;
export type VisitorFn = import("../util/SourceProcessor").VisitorFn<HtmlPath>;
export type VisitorBucket = import("../util/SourceProcessor").VisitorBucket<HtmlPath>;
export type VisitorMap = import("../util/SourceProcessor").VisitorMap<HtmlPath>;
export type CompiledVisitorMap = import("../util/SourceProcessor").CompiledVisitorMap<HtmlPath>;
/**
 * What the minifying printer may rewrite. Every entry is on unless it is
 * `false`, so a document one transform breaks can still be minified by the rest.
 */
export type HtmlTransformOptions = {
    /**
     * write a boolean attribute as the bare name its presence already means; `true` only the spellings the spec canonicalizes, `"all"` any value
     */
    collapseBooleanAttributes?: (boolean | "all") | undefined;
    /**
     * which comments survive: `"some"` (the default) the ones that carry something, `true` / `"all"` every one, `false` none, or the ones a pattern matches / a predicate accepts, over the comment's own text. A comment a parser or a server reads is kept whatever this says
     */
    comments?: (boolean | "all" | "some" | string | RegExp | ((comment: string) => boolean)) | undefined;
    /**
     * drop or re-pick an attribute value's quotes
     */
    normalizeAttributeQuotes?: boolean | undefined;
    /**
     * fold an enumerated value to the keyword it names
     */
    normalizeEnumeratedAttributes?: boolean | undefined;
    /**
     * normalize a space-, comma- or descriptor-separated list value (`class`, `rel`, `srcset`, `sizes`, the viewport `content`)
     */
    normalizeListAttributes?: boolean | undefined;
    /**
     * write an integer attribute the one way its rules read it
     */
    normalizeNumericAttributes?: boolean | undefined;
    /**
     * drop the whitespace around a URL value (`href`, `src`, `action`, …), which resolving the URL skips over
     */
    normalizeUrlAttributes?: boolean | undefined;
    /**
     * leave out an optional tag other than the `<html>` / `<head>` / `<body>` shell, which is `removeImpliedTags`
     */
    removeOptionalTags?: boolean | undefined;
};
export type HtmlProcessOptions = {
    /**
     * context element tag name for fragment parsing (see `parseHtml`); the HTML analog of the CSS parser's `as` parse-mode option
     */
    fragmentContext?: string | undefined;
    /**
     * parse as XML instead of applying the HTML tree-construction rules
     */
    xml?: boolean | undefined;
    /**
     * the quote an XML minifying print gives an attribute whose value costs the same in either (default `"`); `'` for a document bound for a `"`-quoted string, such as a CSS `url("data:…")`
     */
    xmlQuote?: ("\"" | "'") | undefined;
    /**
     * node kinds to omit from the AST for speed/memory (see `HtmlAstSkip`)
     */
    skip?: HtmlAstSkip | undefined;
    /**
     * print the safely-minified serialization (nodes rebuilt from source, inert comments dropped, opening-tag whitespace collapsed) as `process` walks, and return it (default false = walk only, return `""`)
     */
    minimize?: boolean | undefined;
    /**
     * which of the meaning-preserving rewrites the minifying print makes; each is on unless it is `false`
     */
    transforms?: HtmlTransformOptions | undefined;
    /**
     * collapse each run of whitespace in text to a single space, except where an ancestor renders it verbatim; `"smart"` also drops what sits against a block edge and `"all"` drops every edge (default false)
     */
    collapseWhitespace?: (boolean | "conservative" | "smart" | "all") | undefined;
    /**
     * drop an attribute whose empty value leaves it in the state its absence gives (default false)
     */
    removeEmptyAttributes?: boolean | undefined;
    /**
     * drop an element with no children and no attributes where its bare form renders nothing and nothing reads it (default false)
     */
    removeEmptyElements?: boolean | undefined;
    /**
     * print a run of adjacent `<style>` elements as one sheet, which removes elements (default false)
     */
    mergeStyles?: boolean | undefined;
    /**
     * print a run of adjacent bare `<script>` elements whose bodies this print writes itself as one, which removes elements, hoists a later body's declarations into the ones before it, and lets a failing body end the whole run (default false)
     */
    mergeScripts?: boolean | undefined;
    /**
     * print an HTML or XML element's attributes commonest name first, ties by name (default false)
     */
    sortAttributes?: boolean | undefined;
    /**
     * print every token list the DOM reads as a set (`class`, `rel`, `part`, …) in token order (default false)
     */
    sortTokenLists?: boolean | undefined;
    /**
     * drop an attribute whose value is the element's own default; `true` is `"smart"`, and `"all"` also drops the spec defaults a selector can match, and with them a value naming no keyword where that says the same (default false)
     */
    removeRedundantAttributes?: (boolean | "smart" | "all") | undefined;
    /**
     * how much of the `<html>` / `<head>` / `<body>` shell §13.1.2.4 lets the parser imply may be left out: `"smart"` leaves out only the `<html>` start tag, `true` (or `"all"`) all six, `false` none (default `"smart"`)
     */
    removeImpliedTags?: (boolean | "smart" | "all") | undefined;
    /**
     * whether an `<iframe srcdoc>` is among what `deferEmbeddedSource` collects (default true); false for a caller that minifies them itself, which keeps the attribute on the normal path and its shorter delimiter
     */
    deferSrcdoc?: boolean | undefined;
    /**
     * what a print before this one was answered for each offer, which `processAsync` passes where an answer overturned a choice made without it: a body it answers is written from it rather than deferred
     */
    embeddedAnswers?: ((offer: Omit<DeferredEmbeddedSource, "build">) => string | undefined) | undefined;
    /**
     * collects what `renderEmbeddedSource` would be offered instead of offering it, for a caller whose renderer is asynchronous: the print leaves a marker for each and `finish` puts the answers in their place, so one parse serves both. Takes precedence over `renderEmbeddedSource`
     */
    deferEmbeddedSource?: DeferredEmbeddedSource[] | undefined;
    /**
     * renders each nested body this document embeds — an inline `<style>`, every `style=""` (as the block's contents it is, SVG's and MathML's included), a `<script>` holding JSON or JavaScript (with `as` naming which production of it the body is — `"module"` for a `<script type=module>`, `"script"` for a classic one), every event handler attribute, with `as: "event-handler"` saying it is a function body rather than a script — the production a `return` at its top level is in, which a renderer whose engine takes only whole scripts wraps before it reads — an `<svg>` subtree, with `as: "foreign-element"` saying it is an element of this document rather than a standalone `.svg`, and the document an `<iframe srcdoc>` holds (decoded, and written back escaped). The only way any of them is minified: webpack minifies nothing here itself, and `builtinEmbeddedRenderer` is its own CSS and JSON minifiers for a caller to pass; returning anything but text leaves a body as written
     */
    renderEmbeddedSource?: EmbeddedSourceRenderer | undefined;
};
/**
 * What the HTML printer may be told, on top of the `mode` every language has:
 * `optimization.minimize.html`, and the renderer every nested body goes through.
 * `optimization.minimize.css` reaches inline CSS through `builtinEmbeddedRenderer`,
 * which `htmlMinify` passes (see `lib/config/defaults.js`).
 */
export type HtmlPrintOptions = {
    transforms?: HtmlTransformOptions;
    collapseWhitespace?: boolean | "conservative" | "smart" | "all";
    mergeStyles?: boolean;
    mergeScripts?: boolean;
    removeEmptyAttributes?: boolean;
    removeEmptyElements?: boolean;
    removeRedundantAttributes?: boolean | "smart" | "all";
    sortAttributes?: boolean;
    sortTokenLists?: boolean;
    removeImpliedTags?: boolean | "smart" | "all";
    renderEmbeddedSource?: EmbeddedSourceRenderer;
    deferEmbeddedSource?: DeferredEmbeddedSource[];
    embeddedAnswers?: (offer: Omit<DeferredEmbeddedSource, "build">) => string | undefined;
    deferSrcdoc?: boolean;
    xmlQuote?: "\"" | "'";
};
export type PrintContext = {
    options: import("../util/SourceProcessor").PrintOptions & HtmlPrintOptions;
    _printer: import("../util/SourceProcessor").NodePrinter<{
        state: unknown;
        readonly node: import("./syntax-parser").HtmlNodeRef;
        readonly parent: import("./syntax-parser").HtmlNodeRef | null;
        readonly index: number;
        skipChildren(): void;
        stop(): void;
        within(type: number): boolean;
        type(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        range(n?: import("./syntax-parser").HtmlNodeRef | undefined): [number, number];
        start(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        end(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        loc(n?: import("./syntax-parser").HtmlNodeRef | undefined): [number, number, number, number];
        source(n?: (import("./syntax-parser").HtmlNodeRef | number) | undefined, end?: number | undefined): string;
        name(n?: import("./syntax-parser").HtmlNodeRef | undefined): string;
        fieldCount(field: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        field(i: number, field: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef;
        fieldNamed(field: number, name: string, n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef;
        flag(flag: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): boolean;
        rangeOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): [number, number] | null;
        startOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        endOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        textOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): string | null;
        value(n?: import("./syntax-parser").HtmlNodeRef | undefined): string;
        childCount(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        child(i: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef;
        children(n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef[];
    }, number, HtmlPrintOptions>;
    _storeText: (string | null)[];
    _storeGen: Int32Array;
    _sourceText: (node: number) => string;
    _gen: number;
    _storeLow: number;
    _storeHigh: number;
    _chunks: string[];
    _deferred: Map<number, {
        readonly text: string;
    }>;
    _tail: string;
    _tailLength: number;
    _flattened: number;
    mapWanted: boolean;
    _mappings: number[];
    _retractableMappings: number[] | null;
    _inserts: [number, string][];
    _insertIdx: number;
    _pending: string[];
    _pendingAnchor: [number | undefined, number | undefined, number | undefined] | null;
    pushPending(text: string): number;
    setPending(depth: number, text: string): void;
    flushPending(): void;
    anchorPending(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
    isPending(depth: number): boolean;
    dropPending(): void;
    markCut(): number;
    emitStreamed(text: string): void;
    _growStore(need: number): void;
    dropStore(): void;
    _moveEpoch(): void;
    dropTrailing(from: number, charCode: number): void;
    replaceEnd(printed: string, text: string, closer: number): boolean;
    printNode(node: number, path: {
        state: unknown;
        readonly node: import("./syntax-parser").HtmlNodeRef;
        readonly parent: import("./syntax-parser").HtmlNodeRef | null;
        readonly index: number;
        skipChildren(): void;
        stop(): void;
        within(type: number): boolean;
        type(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        range(n?: import("./syntax-parser").HtmlNodeRef | undefined): [number, number];
        start(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        end(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        loc(n?: import("./syntax-parser").HtmlNodeRef | undefined): [number, number, number, number];
        source(n?: (import("./syntax-parser").HtmlNodeRef | number) | undefined, end?: number | undefined): string;
        name(n?: import("./syntax-parser").HtmlNodeRef | undefined): string;
        fieldCount(field: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        field(i: number, field: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef;
        fieldNamed(field: number, name: string, n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef;
        flag(flag: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): boolean;
        rangeOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): [number, number] | null;
        startOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        endOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        textOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): string | null;
        value(n?: import("./syntax-parser").HtmlNodeRef | undefined): string;
        childCount(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        child(i: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef;
        children(n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef[];
    }): void;
    printedAs(node: number, text: string): void;
    printedSource(node: number, sourceText: (node: number) => string): void;
    printPiece(path: {
        state: unknown;
        readonly node: import("./syntax-parser").HtmlNodeRef;
        readonly parent: import("./syntax-parser").HtmlNodeRef | null;
        readonly index: number;
        skipChildren(): void;
        stop(): void;
        within(type: number): boolean;
        type(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        range(n?: import("./syntax-parser").HtmlNodeRef | undefined): [number, number];
        start(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        end(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        loc(n?: import("./syntax-parser").HtmlNodeRef | undefined): [number, number, number, number];
        source(n?: (import("./syntax-parser").HtmlNodeRef | number) | undefined, end?: number | undefined): string;
        name(n?: import("./syntax-parser").HtmlNodeRef | undefined): string;
        fieldCount(field: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        field(i: number, field: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef;
        fieldNamed(field: number, name: string, n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef;
        flag(flag: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): boolean;
        rangeOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): [number, number] | null;
        startOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        endOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        textOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): string | null;
        value(n?: import("./syntax-parser").HtmlNodeRef | undefined): string;
        childCount(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
        child(i: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef;
        children(n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef[];
    }): string;
    get(node: number): string;
    _emit(text: string): void;
    _cutTail(): void;
    emitRetractable(text: string): number;
    retract(index: number): void;
    writesNonAscii(index: number): boolean;
    foldIntoRetractable(index: number, text: string): void;
    rewriteRetractable(index: number, text: string): void;
    deferRetractable(index: number, source: {
        readonly text: string;
    }): void;
    _settleDeferred(): void;
    takeRetractable(node: number, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): number;
    take(node: number, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): void;
    anchor(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
    hasInsertBefore(pos: number): boolean;
    flushInsertsBefore(pos: number): void;
    insert(pos: number, text: string): void;
    takeInserts(start: number, end: number): string;
    _flushBefore(pos: number): void;
    sourceMap(options: SourceMapOptions, code?: string | undefined): SourceMap;
    substitute(resolve: (id: number) => string | undefined, infix: string): void;
    replaceAll(text: string): void;
    result(): string;
};
export const CLASSIC_SCRIPT: "script";
/** @typedef {import("./syntax-parser").EmbeddedSourceRenderer} EmbeddedSourceRenderer */
/** @typedef {import("./syntax-parser").DeferredEmbeddedSource} DeferredEmbeddedSource */
/** @typedef {import("./syntax-parser").HtmlNodeRef} HtmlNodeRef */
/** @typedef {import("./syntax-parser").HtmlElement} HtmlElement */
/** @typedef {import("./syntax-parser").HtmlDocument} HtmlDocument */
/** @typedef {import("./syntax-parser").HtmlDocumentFragment} HtmlDocumentFragment */
/** @typedef {import("./syntax-parser").HtmlNode} HtmlNode */
/** @typedef {import("./syntax-parser").HtmlAstSkip} HtmlAstSkip */
/** @typedef {import("./syntax-parser").HtmlPath} HtmlPath */
export const MODULE_SCRIPT: "module";
/**
 * The default HTML node printer — passed to the `SourceProcessor` and fired per
 * node once its children are printed (a developer could supply their own). It
 * takes the same `path` a visitor gets plus the print context as its `writer`,
 * and knows nothing of the walk: it switches on `path.type()`, serializes the node
 * — opening tags kept verbatim from source (attribute quoting / spacing
 * preserved), end tags generated, text re-escaped from its decoded value — pulling
 * its children's already-printed text from `writer.get`, and **returns** it. This
 * is the WHATWG serialization, so the output re-parses to the same DOM (text-node
 * offsets can overrun end tags, so source slices can't be used for text). The
 * minify transforms are dropping inert comments and collapsing the whitespace
 * between an opening tag's attributes; DOM-absent whitespace (between the
 * doctype and `<html>`, etc.) naturally falls away.
 * @param {HtmlPath} path the accessor positioned on the finished node
 * @param {PrintContext} writer the print context (children's printed text)
 * @returns {string} the node's serialized text
 * @experimental exposed as `webpack.html.syntax.printer`; unstable API
 */
export function printer(path: HtmlPath, writer: PrintContext): string;
