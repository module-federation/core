export type CompiledVisitorMap = import("./syntax-printer").CompiledVisitorMap;
export type VisitorFn = import("../util/SourceProcessor").VisitorFn<HtmlPath>;
export type HtmlTransformOptions = import("./syntax-printer").HtmlTransformOptions;
export type HtmlProcessOptions = import("./syntax-printer").HtmlProcessOptions;
export type PrintContext = import("./syntax-printer").PrintContext;
/**
 * Renders one nested body this document embeds — an inline `<style>`, every
 * `style=""` (handed over as a whole stylesheet), a `<script>` holding JSON or
 * JavaScript, every event handler attribute (`as` says it is a function body
 * rather than a script), an `<svg>` subtree (`as: "foreign-element"`), and the
 * document an `<iframe srcdoc>` holds. Returning the input unchanged declines
 * it. Synchronous: it is called from inside the print walk, so a caller with an
 * async minifier collects the bodies in a walk-only pass first and looks the
 * results up here.
 *
 * What comes back is spliced in as-is, so an `<svg>` renderer must return
 * markup — everything else is literal text. A `<style>` / `<script>` body may
 * therefore carry its own `sourceMappingURL`, which is the only way a map
 * reaches inline content; nothing else here can hold one.
 */
export type EmbeddedSourceRenderer = (source: string, info: {
    type: string;
    hostType: string;
    as?: string;
}) => string | undefined;
/**
 * One embedded source recorded for a caller that can only answer
 * asynchronously, and the text to print once it has.
 */
export type DeferredEmbeddedSource = import("../util/dataURL").DeferredEmbeddedSource;
/**
 * Severity of a tokenizer-detected parse error. `"warning"` is recoverable
 * (the tokenizer continued and the emitted token is still well-formed, e.g.
 * missing-attribute-value); `"error"` means the emitted token's offset
 * range is incomplete or does not match what the spec would produce, e.g.
 * eof-in-tag.
 *
 * Token offsets are JS string indices (UTF-16 code-unit offsets into
 * `input`), not byte offsets — relevant for inputs containing non-BMP
 * code points where one code point spans two indices.
 */
export type ParseErrorSeverity = "warning" | "error";
export type HtmlTokenCallbacks = {
    openTag?: ((input: string, start: number, end: number, nameStart: number, nameEnd: number, selfClosing: boolean) => number) | undefined;
    closeTag?: ((input: string, start: number, end: number, nameStart: number, nameEnd: number) => number) | undefined;
    text?: ((input: string, start: number, end: number) => number) | undefined;
    attribute?: ((input: string, nameStart: number, nameEnd: number, valueStart: number, valueEnd: number, quoteType: number) => number) | undefined;
    comment?: ((input: string, start: number, end: number, dataStart: number, dataEnd: number) => number) | undefined;
    /**
     * `subsetStart` / `subsetEnd` delimit an XML internal subset (`tokenizeXml` only; -1 when absent)
     */
    doctype?: ((input: string, start: number, end: number, nameStart: number, nameEnd: number, publicStart: number, publicEnd: number, systemStart: number, systemEnd: number, forceQuirks: boolean, subsetStart?: number, subsetEnd?: number) => number) | undefined;
    parseError?: ((input: string, code: string, start: number, end: number, severity: ParseErrorSeverity) => void) | undefined;
    /**
     * returns true when the adjusted current node is in a foreign (SVG/MathML) namespace, which is where a `<![CDATA[` opens a CDATA section
     */
    isForeign?: (() => boolean) | undefined;
    /**
     * returns true when the tree builder will not run the algorithm that switches the tokenizer for this start tag, so it stays in the data state
     */
    vetoesContentMode?: ((name: string) => boolean) | undefined;
    /**
     * context element tag name for fragment parsing; seeds the initial content mode
     */
    fragmentContext?: string | undefined;
    /**
     * read a `noscript` as raw text, as a document with scripting on does
     */
    scripting?: boolean | undefined;
};
export type DecodedEntitiesWithMap = {
    text: string;
    map: number[] | undefined;
};
/**
 * A contiguous run of attribute ids in the attribute columns — how a start-tag
 * token and an element refer to their attributes. `start` is the first id
 * (`count` 0 = none).
 */
export type AttributeRun = {
    start: number;
    count: number;
};
/**
 * A materialized attribute as returned by `A.attributes` (tests/tooling) —
 * the parser-facing representation is an id into the attribute columns, read
 * through the scalar `A.attr*` accessors.
 */
export type HtmlAttribute = {
    /**
     * lowercased (and, in foreign content, adjusted) attribute name
     */
    name: string;
    value: string;
    /**
     * name used by the html5lib tree serializer (foreign-namespaced)
     */
    serializedName?: string | undefined;
    /**
     * source offset, or -1 on adoption-agency clones
     */
    nameStart: number;
    nameEnd: number;
    /**
     * source offset, or -1 when valueless / on clones
     */
    valueStart: number;
    valueEnd: number;
};
/**
 * A node reference into the struct-of-arrays AST: an integer id indexing the
 * parallel `_h*` columns. Read fields through the exported accessor `A`. Refs
 * are only valid until the next `parseHtml` call — the columns are reused
 * across parses — so consume a tree fully before parsing again.
 */
export type HtmlNodeRef = number;
/**
 * ref to an Element node
 */
export type HtmlElement = HtmlNodeRef;
/**
 * ref to a Text node
 */
export type HtmlText = HtmlNodeRef;
/**
 * ref to a Comment node
 */
export type HtmlComment = HtmlNodeRef;
/**
 * ref to a Doctype node
 */
export type HtmlDoctype = HtmlNodeRef;
/**
 * ref to a ProcessingInstruction node
 */
export type HtmlProcessingInstruction = HtmlNodeRef;
/**
 * ref to the Document node
 */
export type HtmlDocument = HtmlNodeRef;
/**
 * ref to a DocumentFragment node
 */
export type HtmlDocumentFragment = HtmlNodeRef;
export type HtmlNode = HtmlNodeRef;
/**
 * An attribute as a node: a negative id, which the shared reads (`A.name`,
 * `A.value`, `A.start`, …) take. Same validity contract as `HtmlNodeRef`.
 */
export type HtmlAttributeRef = number;
export type TagPos = {
    start: number;
    end: number;
    tagEnd: number;
    nameEnd: number;
};
export type CharToken = {
    type: typeof TOKEN_CHAR;
    data: string;
    start: number;
    end: number;
};
export type CommentToken = {
    type: typeof TOKEN_COMMENT;
    data: string;
    start: number;
    end: number;
};
export type DoctypeToken = {
    type: typeof TOKEN_DOCTYPE;
    name: string;
    publicId: (string | null);
    systemId: (string | null);
    publicStart: number;
    publicEnd: number;
    systemStart: number;
    systemEnd: number;
    forceQuirks: boolean;
    start: number;
    end: number;
};
export type StartTagToken = {
    type: typeof TOKEN_START_TAG;
    name: string;
    attrs: AttributeRun;
    selfClosing: boolean;
    pos: TagPos;
    swallowNewline?: boolean;
};
export type EndTagToken = {
    type: typeof TOKEN_END_TAG;
    name: string;
    pos: TagPos;
};
export type EofToken = {
    type: typeof TOKEN_EOF;
};
/**
 * the target rides in `name`, as the doctype's does
 */
export type ProcessingInstructionToken = {
    type: typeof TOKEN_PROCESSING_INSTRUCTION;
    name: string;
    data: string;
    start: number;
    end: number;
};
/**
 * Internal token passed through the tree-construction insertion modes.
 */
export type Token = CharToken | CommentToken | DoctypeToken | StartTagToken | EndTagToken | EofToken | ProcessingInstructionToken;
/**
 * The tree builder reuses a single mutable token (with a reused `pos`) instead
 * of allocating one object per tokenizer callback. All fields are always
 * present so the shape never changes — keeping the `process`/insertion-mode
 * `t.*` reads monomorphic — and fields irrelevant to the current `type` carry
 * stale values that those handlers never read. Tokens that must outlive the
 * current callback (buffered table characters, synthesized re-dispatches) are
 * copied into fresh plain objects instead.
 */
export type MutableToken = {
    type: number;
    name: string;
    data: string;
    attrs: AttributeRun;
    selfClosing: boolean;
    start: number;
    end: number;
    publicId: (string | null);
    systemId: (string | null);
    publicStart: number;
    publicEnd: number;
    systemStart: number;
    systemEnd: number;
    forceQuirks: boolean;
    swallowNewline: boolean;
    pos: TagPos;
};
/**
 * `beforeNode` 0 = plain append
 */
export type InsertionPlace = {
    parent: HtmlNodeRef;
    beforeNode: HtmlNodeRef;
};
export type NameInternTable = ReturnType<typeof buildNameInternTable>;
/**
 * Optional node kinds a consumer can drop from the AST for speed/memory. Each
 * is a pure output reduction — tree construction (and quirks detection) runs
 * unchanged, so element structure and offsets are identical either way.
 */
export type HtmlAstSkip = {
    /**
     * drop every `Text` node. Raw-text element bodies (`<script>`/`<style>`/…) aren't emitted either — their content span is recorded as the element's `contentEnd` (see `RAW_TEXT_ELEMENTS`) so a consumer can read `[tagEnd, contentEnd]` by offset. For consumers that read text by offset (e.g. `HtmlParser`), never the html5lib serializer.
     */
    text?: boolean | undefined;
    /**
     * drop comment nodes entirely. Not for consumers that read comments (e.g. webpack magic comments).
     */
    comments?: boolean | undefined;
    /**
     * drop the doctype node; quirks-mode detection is unaffected.
     */
    doctype?: boolean | undefined;
};
export type HtmlParseOptions = {
    /**
     * context element name for fragment parsing (e.g. `td`, `svg path`); omit for a full document
     */
    fragmentContext?: string | undefined;
    /**
     * parse as XML instead of applying the HTML tree-construction rules
     */
    xml?: boolean | undefined;
    /**
     * node kinds to omit from the AST (see `HtmlAstSkip`); omit to build the full tree
     */
    skip?: HtmlAstSkip | undefined;
    /**
     * parse as a browser with scripting on does, where a `noscript` holds raw text; off by default, so what it holds is read as markup
     */
    scripting?: boolean | undefined;
};
export type XmlAttributeDeclaration = {
    /**
     * whether the type is not CDATA, so §3.3.3 also trims and collapses spaces
     */
    tokenized: boolean;
    /**
     * the default as written, null for `#REQUIRED` / `#IMPLIED`
     */
    defaultValue: string | null;
};
export type ParsedSource = [string, number, number];
/**
 * The HTML path: the AST accessor with the walk's
 * current position on it — the single argument every visitor receives.
 */
export type HtmlPath = typeof A;
/**
 * HTML's parts by node type, which type each visitor's path.
 */
export type HtmlParts = {
    types: HtmlNodeType;
    field: typeof Field.attributes | typeof Field.content;
    flag: typeof Flag.mathml | typeof Flag.svg | typeof Flag.selfClosing;
    part: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    text: typeof Part.publicId | typeof Part.systemId;
    fields: {
        1: never;
        2: never;
        3: typeof Field.attributes | typeof Field.content;
        4: never;
        5: never;
        6: never;
        7: never;
        8: never;
    };
    flags: {
        1: never;
        2: never;
        3: typeof Flag.mathml | typeof Flag.svg | typeof Flag.selfClosing;
        4: never;
        5: never;
        6: never;
        7: never;
        8: never;
    };
    parts: {
        1: never;
        2: never;
        3: typeof Part.name | typeof Part.content | typeof Part.startTag | typeof Part.endTag;
        4: never;
        5: never;
        6: typeof Part.publicId | typeof Part.systemId;
        7: never;
        8: typeof Part.name | typeof Part.value;
    };
    texts: {
        1: never;
        2: never;
        3: never;
        4: never;
        5: never;
        6: typeof Part.publicId | typeof Part.systemId;
        7: never;
        8: never;
    };
    items: {
        [field: number]: number;
        1: 8;
        2: 2;
    };
};
/**
 * The path a visitor of node type `T` receives, with the run's state `S`.
 */
export type HtmlNodePath<T = number, S = unknown> = import("../util/SourceProcessor").TypedNodePath<HtmlPath, HtmlNodeRef, HtmlParts, T, S>;
/**
 * A visitor map whose each visitor's path is typed by its node type and run state.
 */
export type HtmlVisitorMap<S = unknown> = {
    1?: import("../util/SourceProcessor").VisitorBucket<HtmlNodePath<1, S>>;
    2?: import("../util/SourceProcessor").VisitorBucket<HtmlNodePath<2, S>>;
    3?: import("../util/SourceProcessor").VisitorBucket<HtmlNodePath<3, S>>;
    4?: import("../util/SourceProcessor").VisitorBucket<HtmlNodePath<4, S>>;
    5?: import("../util/SourceProcessor").VisitorBucket<HtmlNodePath<5, S>>;
    6?: import("../util/SourceProcessor").VisitorBucket<HtmlNodePath<6, S>>;
    7?: import("../util/SourceProcessor").VisitorBucket<HtmlNodePath<7, S>>;
    8?: import("../util/SourceProcessor").VisitorBucket<HtmlNodePath<8, S>>;
};
/**
 * a `NodeType` member
 */
export type HtmlNodeType = (typeof NodeType)[keyof typeof NodeType];
export namespace A {
    let state: unknown;
    const node: HtmlNodeRef;
    const parent: HtmlNodeRef | null;
    const index: number;
    /** Stop the walk descending into the current node (enter only). */
    function skipChildren(): void;
    /** Stop the walk: no visitor fires after the current one returns. */
    function stop(): void;
    /**
     * Walks the parent links, so a `<template>`'s content ends at its fragment.
     * @param {number} type a `NodeType`
     * @returns {boolean} whether an ancestor of the current node has that type
     */
    function within(type: number): boolean;
    /**
     * @param {HtmlNodeRef=} n node
     * @returns {number} `NodeType`
     */
    function type(n?: HtmlNodeRef | undefined): number;
    /**
     * @param {HtmlNodeRef=} n node
     * @returns {[number, number]} start and end offsets in the input (an attribute's end past its closing quote)
     */
    function range(n?: HtmlNodeRef | undefined): [number, number];
    /**
     * @param {HtmlNodeRef=} n node
     * @returns {number} where the node starts in the input
     */
    function start(n?: HtmlNodeRef | undefined): number;
    /**
     * @param {HtmlNodeRef=} n node
     * @returns {number} where the node ends in the input
     */
    function end(n?: HtmlNodeRef | undefined): number;
    /**
     * Line / column are converted only when asked, by a converter made on the
     * first call of a parse. Valid during the walk, as {@link source} is.
     * @param {HtmlNodeRef=} n node
     * @returns {[number, number, number, number]} start line and column, end line and column (lines from 1, columns from 0)
     */
    function loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
    /**
     * A node's text as written; valid during the walk, before `parseHtml` releases the source.
     * @param {HtmlNodeRef | number=} n node, or the start offset when `end` is given
     * @param {number=} end end offset, to read the input between two offsets
     * @returns {string} the node's source, or the input between the offsets
     */
    function source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
    /**
     * An element's or attribute's name (lowercased, adjusted in foreign content),
     * a doctype's name, a processing instruction's target; "" for other nodes.
     * @param {HtmlNodeRef=} n node
     * @returns {string} its name
     */
    function name(n?: HtmlNodeRef | undefined): string;
    /**
     * @param {number} field a `Field`
     * @param {HtmlNodeRef=} n node
     * @returns {number} number of items in that field (0 when the node has none)
     */
    function fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
    /**
     * An attribute item is a node the shared reads take.
     * @param {number} i item index
     * @param {number} field a `Field`
     * @param {HtmlNodeRef=} n node
     * @returns {HtmlNodeRef} the i-th item of that field (0 = none)
     */
    function field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
    /**
     * Attribute names are stored lowercased, so `name` is compared as written.
     * @param {number} field a `Field`
     * @param {string} name the name to look for
     * @param {HtmlNodeRef=} n node
     * @returns {HtmlNodeRef} the first item of that field with this name (0 = none)
     */
    function fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
    /**
     * @param {number} flag a `Flag`
     * @param {HtmlNodeRef=} n node
     * @returns {boolean} whether that flag is set
     */
    function flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
    /**
     * A parser-inserted element has no name, tags or content in the source.
     * @param {number} part a `Part`
     * @param {HtmlNodeRef=} n node
     * @returns {[number, number] | null} where that part is written (null without one)
     */
    function rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
    /**
     * @param {number} part a `Part`
     * @param {HtmlNodeRef=} n node
     * @returns {number} where that part starts (-1 without one)
     */
    function startOf(part: number, n?: HtmlNodeRef | undefined): number;
    /**
     * @param {number} part a `Part`
     * @param {HtmlNodeRef=} n node
     * @returns {number} where that part ends (-1 without one)
     */
    function endOf(part: number, n?: HtmlNodeRef | undefined): number;
    /**
     * Name and value are read with `name` and `value`; this reads a node's
     * other text, such as a doctype's identifiers, which are stored decoded.
     * @param {number} part a `Part`
     * @param {HtmlNodeRef=} n node
     * @returns {string | null} that part's text (null without one)
     */
    function textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
    /**
     * A text's, comment's, processing instruction's or attribute's data,
     * character references decoded; "" for other nodes.
     * @param {HtmlNodeRef=} n node
     * @returns {string} its value
     */
    function value(n?: HtmlNodeRef | undefined): string;
    /**
     * Counted along the sibling links once per node and visitor call.
     * @param {HtmlNodeRef=} n node
     * @returns {number} number of children
     */
    function childCount(n?: HtmlNodeRef | undefined): number;
    /**
     * Reached along the sibling links from the last child read under `n`, so a
     * loop over a node's children takes one step per child.
     * @param {number} i child index (`0 <= i < childCount(n)`)
     * @param {HtmlNodeRef=} n node
     * @returns {HtmlNodeRef} the i-th child (0 = none)
     */
    function child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
    /**
     * Every child as a new array, for a reader that keeps or searches them.
     * @param {HtmlNodeRef=} n node
     * @returns {HtmlNodeRef[]} its children (empty for an attribute or a leaf)
     */
    function children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
}
export const BLOCK_CONTENTS: "block-contents";
export const EMBEDDED_LANGUAGES: string[];
export const EVENT_HANDLER: "event-handler";
export const FOREIGN_ELEMENT: "foreign-element";
export const FLAG_FOSTER_REGION: 128;
/** @import { OutputHtmlOptions } from "../../declarations/WebpackOptions" */
/**
 * Renders one nested body this document embeds — an inline `<style>`, every
 * `style=""` (handed over as a whole stylesheet), a `<script>` holding JSON or
 * JavaScript, every event handler attribute (`as` says it is a function body
 * rather than a script), an `<svg>` subtree (`as: "foreign-element"`), and the
 * document an `<iframe srcdoc>` holds. Returning the input unchanged declines
 * it. Synchronous: it is called from inside the print walk, so a caller with an
 * async minifier collects the bodies in a walk-only pass first and looks the
 * results up here.
 *
 * What comes back is spliced in as-is, so an `<svg>` renderer must return
 * markup — everything else is literal text. A `<style>` / `<script>` body may
 * therefore carry its own `sourceMappingURL`, which is the only way a map
 * reaches inline content; nothing else here can hold one.
 * @typedef {(source: string, info: { type: string, hostType: string, as?: string }) => string | undefined} EmbeddedSourceRenderer
 */
/**
 * One embedded source recorded for a caller that can only answer
 * asynchronously, and the text to print once it has.
 * @typedef {import("../util/dataURL").DeferredEmbeddedSource} DeferredEmbeddedSource
 */
export const JSON_TYPE: "json";
/**
 * The parts of a node read with `field`, `fieldCount` and `fieldNamed`, named
 * as the DOM names them. A single-node field reads as a list of at most one.
 * @type {{ attributes: 1, content: 2 }}
 */
export const Field: {
    attributes: 1;
    content: 2;
};
/**
 * The bits of a node's flags column read with `flag`; an element's namespace is
 * its MathML or SVG bit, neither set for HTML.
 * @type {{ mathml: 1, svg: 2, selfClosing: 4 }}
 */
export const Flag: {
    mathml: 1;
    svg: 2;
    selfClosing: 4;
};
/**
 * The parts of a node read with `rangeOf` and `textOf`.
 * @type {{ name: 1, value: 2, content: 3, startTag: 4, endTag: 5, publicId: 6, systemId: 7 }}
 */
export const Part: {
    name: 1;
    value: 2;
    content: 3;
    startTag: 4;
    endTag: 5;
    publicId: 6;
    systemId: 7;
};
/**
 * An element's namespace (Infra §8): its MathML or SVG `Flag` bit, neither for HTML.
 * @type {{ HTML: 0, MathML: 1, SVG: 2, XML: 3 }}
 */
export const Namespace: {
    HTML: 0;
    MathML: 1;
    SVG: 2;
    XML: 3;
};
/**
 * AST node `type` discriminators. Numeric for the same reason as the CSS
 * `NodeType`: compact integer `===` dispatch on the tree-construction and
 * visitor-walk hot paths.
 * @type {{ Document: 1, DocumentFragment: 2, Element: 3, Text: 4, Comment: 5, Doctype: 6, ProcessingInstruction: 7, Attribute: 8 }}
 */
export const NodeType: {
    Document: 1;
    DocumentFragment: 2;
    Element: 3;
    Text: 4;
    Comment: 5;
    Doctype: 6;
    ProcessingInstruction: 7;
    Attribute: 8;
};
/**
 * How an attribute value is quoted in the source (HTML §13.2.5.36–38).
 * @type {{ None: 0, Double: 1, Single: 2 }}
 */
export const Quote: {
    None: 0;
    Double: 1;
    Single: 2;
};
export const SVG_TYPE: "svg";
declare const CC_NUMBER_SIGN: 35;
export namespace _S {
    export let _absorbed: Set<HtmlElement> | null;
    export let _elementOpenSource: string;
    export let _renderEmbeddedSource: EmbeddedSourceRenderer | undefined;
    export let _deferEmbeddedSource: DeferredEmbeddedSource[] | undefined;
    export let _embeddedAnswers: ((offer: Omit<DeferredEmbeddedSource, "build">) => string | undefined) | undefined;
    export let _escapeEmbedded: boolean;
    export let _fosteredRuns: Map<HtmlNodeRef, HtmlNodeRef[]> | null;
    export { EMPTY_U8 as _nodeFlags };
    export let _mergeStyles: boolean;
    export let _mergeScripts: boolean;
    export let _collapseWhitespace: "none" | "conservative" | "smart" | "all";
    export let _xmlMode: boolean;
    export let _xmlVerbatim: boolean;
    export let inputHasCr: boolean;
    export let source: string;
    export let head: HtmlElement;
    export { EMPTY_I32 as _nodeFirstChildren };
    export { EMPTY_U8 as _nodeTypes };
    export { EMPTY_I32 as _nodeNextSiblings };
    export let _removeRedundantAttributes: "none" | "smart" | "all";
    export let _fosteredNodes: Map<HtmlNodeRef, HtmlNodeRef> | null;
    export let _fosterVerbatim: Set<HtmlNodeRef> | null;
    export let _fosterHolders: Set<HtmlNodeRef> | null;
}
/** @type {(n: HtmlNodeRef) => number} how many attributes an element has */
export const _attributeCountOf: (n: HtmlNodeRef) => number;
/**
 * An element's attributes as objects, raw values and offsets included: what
 * the printer reads where it compares or reorders them.
 * @param {HtmlNodeRef} n element
 * @returns {HtmlAttribute[]} its attributes
 */
export function _attributeList(n: HtmlNodeRef): HtmlAttribute[];
/** @type {(n: HtmlNodeRef) => string} a text's, comment's or processing instruction's data */
export const _dataOf: (n: HtmlNodeRef) => string;
/**
 * @param {HtmlNodeRef} n node
 * @returns {HtmlNodeRef} its first child (0 = none)
 */
export function _firstChild(n: HtmlNodeRef): HtmlNodeRef;
/** @type {(el: HtmlNodeRef) => string} */
export const _tagNameOf: (el: HtmlNodeRef) => string;
/** @type {(el: HtmlNodeRef) => number} */
export const _namespaceOf: (el: HtmlNodeRef) => number;
/**
 * @param {HtmlNodeRef} n node
 * @returns {HtmlNodeRef} its next sibling (0 = none)
 */
export function _nextSibling(n: HtmlNodeRef): HtmlNodeRef;
/**
 * @param {HtmlNodeRef} n node
 * @returns {HtmlNodeRef} its parent (0 = none; a `<template>`'s content links to its fragment)
 */
export function _parentOf(n: HtmlNodeRef): HtmlNodeRef;
/**
 * Infra's ASCII lowercase, which is all HTML folds: `toLowerCase` also maps
 * characters the parser leaves alone (U+212A onto `k`). Returns the input
 * itself when there is nothing to fold.
 * @param {string} value source name or value
 * @returns {string} the value as the parser would match it
 */
export function asciiLowercase(value: string): string;
/**
 * Infra's strip leading and trailing ASCII whitespace: `String#trim` also eats
 * NBSP and the other Unicode spaces, which HTML's grammars read as characters.
 * @param {string} value the value
 * @returns {string} the trimmed value
 */
export function stripAsciiWhitespace(value: string): string;
/**
 * Whether an attribute reaches the output: one this print drops is not a
 * difference between two elements, nor an attribute that keeps a run apart.
 * @param {string} elementName lowercased element name
 * @param {string} name lowercased attribute name
 * @param {string} value its raw value
 * @returns {boolean} true when it prints
 */
export function _attributePrints(elementName: string, name: string, value: string): boolean;
/**
 * Whether an element's end tag may be omitted (§13.1.2.4). Reads what will be
 * printed rather than the tree: a comment minifying drops, and whitespace the
 * collapse tier deletes, are not content the tag has to stay for.
 * @param {HtmlPath} path the accessor positioned on the element
 * @param {string} name the element's lowercased tag name
 * @param {HtmlNodeRef} node the element
 * @returns {boolean} true when the end tag can be left out
 */
export function _canOmitEndTag(path: HtmlPath, name: string, node: HtmlNodeRef): boolean;
/**
 * Whether an element's start tag may be left out: one the parser re-implies, or
 * a shell tag the option lets go. A shell element the source never spelled falls
 * through to the transparent-implied path, which already prints nothing for it.
 * @param {HtmlPath} path the accessor positioned on the element
 * @param {string} name its lowercased tag name
 * @param {HtmlNodeRef} node the element
 * @param {string} open what its start tag printed as, `""` when the source
 * spelled none
 * @returns {boolean} true when the start tag can be dropped
 */
export function _canOmitStartTag(path: HtmlPath, name: string, node: HtmlNodeRef, open: string): boolean;
/**
 * Whether re-parsing an implied `<html>` / `<body>`'s children without its start
 * tag would not hand them back: a start tag `inBody` ignores still closed
 * `<head>` on the way there, so a head element written after one belongs to the
 * body, and §13.2.6.4.6 gives it back to the head the modes had already left. A
 * comment goes further out still, to the element above.
 * @param {HtmlNodeRef} node the implied element
 * @returns {boolean} true when its start tag has to materialize
 */
export function _contentOpensOutside(node: HtmlNodeRef): boolean;
/**
 * Record one nested body for a caller that answers asynchronously and print the
 * marker standing in for it. `onDeclined` spells what an untapped run spells,
 * so declining costs nothing the built-ins would have done.
 * @param {string} source the nested body
 * @param {string} type its language, e.g. `"css"` / `"javascript"` / `"svg"`
 * @param {(rendered: string | undefined) => string} build the text to print once the answer is in
 * @param {string=} as which production of that language it is, for one with more than one
 * @param {((rendered: string | undefined) => boolean)=} decides whether an answer overturns a choice this print made without it
 * @returns {string} the marker to print
 */
export function _deferEmbedded(source: string, type: string, build: (rendered: string | undefined) => string, as?: string | undefined, decides?: ((rendered: string | undefined) => boolean) | undefined): string;
/**
 * An element's end tag as the printer would emit it.
 * @param {HtmlPath} path positioned on the element
 * @param {string} name its tag name
 * @param {string} open its source open tag
 * @param {boolean} innerEmpty whether it printed no children
 * @param {boolean} minify whether minifying
 * @returns {string} the end tag, `""` when it carries nothing
 */
export function _elementCloseTag(path: HtmlPath, name: string, open: string, innerEmpty: boolean, minify: boolean): string;
/**
 * Whether this element still owes an end tag once its content printed from
 * source: one the source never wrote is not the printer's to invent, and one it
 * did write is already inside the slice when the span ran past it.
 * @param {HtmlPath} path the accessor positioned on the element
 * @returns {boolean} true when the end tag still has to be printed
 */
export function _endTagOutsideSpan(path: HtmlPath): boolean;
/**
 * Whether a text node's trailing whitespace sits outside every line box: it
 * closes a block container, or a block element follows it.
 * @param {HtmlPath} path the accessor
 * @param {HtmlNodeRef} node the text node
 * @param {HtmlNodeRef} parent its parent (0 = none)
 * @returns {boolean} true when the trailing whitespace renders as nothing
 */
export function _endsOutsideLineBox(path: HtmlPath, node: HtmlNodeRef, parent: HtmlNodeRef): boolean;
/**
 * Whether a `<form>` needs a `</form>` in front of it: one written inside another
 * reaches the tree only because an end tag cleared the form element pointer on
 * the way — §13.2.6.4.7 ignores the start tag while the pointer is set, so
 * without it the element is dropped on re-parsing. A `<template>` between the two
 * suspends the pointer instead, and needs nothing.
 * @param {HtmlPath} path the accessor positioned on the `<form>`
 * @returns {boolean} true when the end tag has to be written first
 */
export function _formNeedsPointerReset(path: HtmlPath): boolean;
/**
 * Whether `table`'s fostered run prints back inside it, memoized so the holder
 * that skips the run and the table that takes it in answer this the same way.
 * Moving it is a repair, not a preference: tree order is left alone unless a
 * start tag in the run would close the holder on the way back in, and the run
 * replays out of the table it is moved into.
 * @param {HtmlPath} path the accessor
 * @param {HtmlNodeRef} table the table the run came out of
 * @returns {boolean} true when the run moves back in
 */
export function _fosterRunMoves(path: HtmlPath, table: HtmlNodeRef): boolean;
/**
 * The source an element's content was built from. Nothing re-nested reproduces a
 * run that lands here, and the source did — anchored on the element itself, so no
 * child of it can start earlier and none is left out.
 * @param {HtmlPath} path the accessor
 * @param {HtmlNodeRef} node the element printing from source
 * @returns {string} its raw content
 */
export function _fosterSourceRegion(path: HtmlPath, node: HtmlNodeRef): string;
/**
 * The end tag a transparent implied element still prints: the parser re-implies
 * the start tag behind it, never the end tag, and outside `"all"` a shell tag
 * the source spelled stays — `</html>` is what a truncation check looks for.
 * @param {HtmlPath} path the accessor
 * @param {string} name the element's lowercased tag name
 * @param {HtmlNodeRef} node the element
 * @returns {string} the end tag, or `""` when nothing needs it
 */
export function _impliedCloseTag(path: HtmlPath, name: string, node: HtmlNodeRef): string;
/**
 * Whether a parser-inserted table group has to print a start tag the source
 * never spelled. With `removeOptionalTags` off its end tag prints, and a
 * `</tbody>` with no `<tbody>` is not the document that was parsed.
 * @param {HtmlPath} path the accessor positioned on the element
 * @param {string} name its lowercased tag name
 * @param {HtmlNodeRef} node the element
 * @returns {boolean} true when the start tag has to be materialized
 */
export function _impliedTableGroupStartNeeded(path: HtmlPath, name: string, node: HtmlNodeRef): boolean;
/**
 * Whether a `<style>` element's body is CSS: the attribute is optional, and the
 * only value that keeps it CSS is `text/css`.
 * @param {HtmlPath} path the accessor
 * @param {HtmlElement} element the `<style>` element
 * @returns {boolean} true when the body may be minified as CSS
 */
export function _isCssStyleElement(path: HtmlPath, element: HtmlElement): boolean;
/**
 * Whether an attribute only restates the element's own default — its value
 * naming that default, or naming no keyword at all where the invalid value
 * default is that same state — so dropping it leaves the DOM reading the same
 * value, but leaves an attribute selector, which matches the content attribute,
 * with nothing to match. Both tables are looked up per element by the caller,
 * not per attribute here: the answer is the same for every attribute of one tag.
 * @param {Record<string, string> | undefined} markers the element's marker table
 * @param {Record<string, string> | undefined} defaults the element's spec-default table
 * @param {string} tagName lowercased element name
 * @param {string} name lowercased attribute name
 * @param {string} value the attribute's raw value
 * @returns {boolean} true when the attribute may be dropped
 */
export function _isRedundantAttribute(markers: Record<string, string> | undefined, defaults: Record<string, string> | undefined, tagName: string, name: string, value: string): boolean;
/**
 * Whether an empty attribute reads as its own absence, so `removeEmptyAttributes`
 * may drop it — only on the elements the spec defines it on, never `<x-foo rel="">`.
 * @param {string} elementName lowercased element name
 * @param {string} name lowercased attribute name
 * @param {string} value the attribute's raw value
 * @returns {boolean} true when the attribute may be dropped
 */
export function _isRemovableEmptyAttribute(elementName: string, name: string, value: string): boolean;
/**
 * Whether an element carries nothing at all, so `removeEmptyElements` may drop
 * it. Every guard but the name table is a rule: a void element is childless by
 * definition, a `<template>`'s children hang off a content fragment, foreign
 * content is not ours to judge, and an element spelling any attribute was
 * written for a reason — which is what keeps `<script src>`, `<iframe src>` and
 * `<div id=mount>`, each of which html-minifier-terser drops.
 *
 * What no guard can cover is CSS: `.spacer { height: 4px }` or a `::before`
 * makes an empty element visible, and this cannot see the stylesheet. That is
 * the risk the option is off by default for.
 * @param {HtmlPath} path the accessor positioned on the element
 * @param {HtmlElement} element the element
 * @returns {boolean} true when the element may be dropped
 */
export function _isRemovableEmptyElement(path: HtmlPath, element: HtmlElement): boolean;
/**
 * Whether this element is the outermost `<svg>` of an SVG subtree — the whole
 * of which is offered to the renderer, so a nested one is part of its parent's.
 * @param {HtmlPath} path the accessor positioned on the element
 * @returns {boolean} true for an SVG root
 */
export function _isSvgRoot(path: HtmlPath): boolean;
/**
 * Whether a comment must survive minification: downlevel conditional comments
 * (`<!--[if …]>` / `<![endif]-->`) drive IE branching, server-side includes
 * (`<!--#…-->`) are directives, and a `<?…?>` bogus comment is a server-side
 * template tag — all behavior-bearing. Every other comment is inert, so
 * dropping it preserves meaning.
 * @param {string} data comment data (between `<!--` and `-->`)
 * @param {string} source the comment's source text, including its delimiters
 * @param {number} start the comment's start offset (at `<`)
 * @returns {boolean} true to keep the comment
 */
export function _keepComment(data: string, source: string, start: number): boolean;
/**
 * Rewrite an opening tag from its own source spans, collapsing the whitespace
 * between its attributes to one space and dropping the quotes around any value
 * that is legal unquoted (§13.1.2.3). webpack's own late asset passes match the
 * sentinels they left behind with the quote optional, so they still see them
 * (see `INTEGRITY_SENTINEL_REGEXP`); a third-party post-processor that regexes
 * emitted HTML assuming quotes would not, which is why `removeAttributeQuotes`
 * is off by default in html-minifier.
 *
 * Falls back to the source tag when an attribute lies outside it — a repeated
 * `<html>` / `<body>` tag merges its attributes onto the element already open,
 * and those cannot be sliced from here.
 * @param {HtmlPath} path the accessor positioned on the element
 * @param {string} open the opening tag's source text
 * @returns {string} the minified opening tag
 */
export function _minifyOpenTag(path: HtmlPath, open: string): string;
/** @type {string[]} tag name / text data / comment data / doctype name */
export const _nodeStrings: string[];
/**
 * An element's open tag as it stands in the source, before any minifying; also
 * left in `_elementOpenSource`.
 * @param {HtmlPath} path positioned on the element
 * @returns {string} its source open tag
 */
export function _openTagSource(path: HtmlPath): string;
/**
 * How many of an element's attributes this print keeps.
 * @param {HtmlPath} path the accessor
 * @param {HtmlNodeRef} element the element
 * @returns {number} the count
 */
export function _printedAttributeCount(path: HtmlPath, element: HtmlNodeRef): number;
/**
 * Whether a node prints nothing at all, so what follows it in the output is its
 * next sibling. The three that can: a comment the inert-comment rule drops, an
 * element `removeEmptyElements` drops, and a whitespace-only text node the
 * active `collapseWhitespace` tier deletes — the same questions the printer asks
 * when it reaches them, asked here so the §13.1.2.4 tests read the output.
 * @param {HtmlPath} path the accessor
 * @param {HtmlNodeRef} node the node
 * @returns {boolean} true when it contributes no output
 */
export function _printsNothing(path: HtmlPath, node: HtmlNodeRef): boolean;
/**
 * Whether a reader with scripting off has left the head before `node`, at a
 * `noscript` holding what the head cannot, and so reads its whitespace as body text.
 * @param {HtmlPath} path the accessor
 * @param {HtmlNodeRef} node a whitespace-only text node
 * @param {HtmlNodeRef} parent its parent, the `head` or the `html` element
 * @param {string} parentName the parent's tag name
 * @returns {boolean} true when that reader has the whitespace in the body
 */
export function _headLeftBefore(path: HtmlPath, node: HtmlNodeRef, parent: HtmlNodeRef, parentName: string): boolean;
/**
 * Hand one nested body to the caller's renderer. Anything it throws is a
 * renderer that did not answer: a document must not fail to serialize because
 * something inside it did not parse.
 * @param {string} source the nested body
 * @param {string} type its language, e.g. `"css"` / `"javascript"` / `"svg"`
 * @param {string=} as which production of that language it is, for one with more than one
 * @returns {string | null} the rendered body, or null when there is no renderer or it declined
 */
export function _renderEmbeddedOrNull(source: string, type: string, as?: string | undefined): string | null;
/**
 * Whether the `&` at `i` would be consumed as a character reference when the
 * text is read back (§13.2.5.72): only before `#` or a name the table holds.
 * Every other `&` the tokenizer flushes as literal text, so `R&D` needs no
 * escape — and neither does the `&` in a query string.
 * @param {string} s decoded text
 * @param {number} i the `&`'s index
 * @param {boolean=} terminated whether nothing can follow `s` in the same run
 * @returns {boolean} true when it has to be escaped
 */
export function _startsCharacterReference(s: string, i: number, terminated?: boolean | undefined): boolean;
/**
 * Whether a text node's leading whitespace sits outside every line box, which is
 * so when it opens a block container. A block *sibling* in front of it would do
 * the same, but reading backwards costs a scan of the whole child list — so this
 * only keeps a space that renders, never drops one that does not.
 * @param {HtmlPath} path the accessor
 * @param {HtmlNodeRef} node the text node
 * @param {HtmlNodeRef} parent its parent (0 = none)
 * @returns {boolean} true when the leading whitespace renders as nothing
 */
export function _startsOutsideLineBox(path: HtmlPath, node: HtmlNodeRef, parent: HtmlNodeRef): boolean;
/**
 * Rebuild an opening tag from the node's name and attributes, for elements with
 * no matching source tag (adoption-agency clones, reconstructed formatting
 * elements, renamed tokens like `<image>`). Attribute values are raw
 * (undecoded), so they re-parse to the original decoded values.
 * @param {HtmlPath} path the accessor positioned on the element
 * @returns {string} serialized opening tag
 */
export function _synthesizeOpenTag(path: HtmlPath): string;
/**
 * What `_renderedSheet` answers for this body, handed over once: the printer
 * takes it, so the next `<style>` with the same text is asked afresh.
 * @param {string} css the body
 * @returns {string} what it prints
 */
export function _takeRenderedSheet(css: string): string;
/**
 * Whether an embedded body's answer is in hand as the print goes, so a decision
 * made before it is printed can read it rather than the marker standing for it.
 * @returns {boolean} true with a synchronous renderer, or answers from a print before
 */
export function _rendersNow(): boolean;
/**
 * What a `<style>` body's deferred answer would overturn, for `processAsync` to
 * print again with it: the element going empty.
 * @returns {((answer: string | undefined) => boolean) | undefined} the test, or undefined where no choice rests on it
 */
export function _sheetDecides(): ((answer: string | undefined) => boolean) | undefined;
/**
 * A literal-text element's only child when that is one text node — the shape a
 * merge needs, since anything else means the element is empty.
 * @param {HtmlElement} element a `<style>` or `<script>`
 * @returns {HtmlNodeRef} the text node, or 0
 */
export function _onlyTextChild(element: HtmlElement): HtmlNodeRef;
/**
 * What a sheet needs appended to end where a rule does, as §5.4 ends it at the
 * end of input: the quote, comment end and closers it left open, then `{}` or `;`
 * for a statement it did not finish. Null where it ends on a lone backslash,
 * which would escape whatever followed.
 * @param {string} css the sheet's text
 * @returns {string | null} the text to append before another sheet, empty where it already ends at a rule
 */
export function _sheetClosing(css: string): string | null;
/**
 * The text a `<style>` run prints as one sheet, minified once: each sheet's
 * source, the one before it closed first as its own end of input closed it.
 * @param {HtmlPath} path the accessor
 * @param {HtmlElement} element the run's first `<style>`
 * @param {string} css its own text
 * @param {boolean} absorb whether to mark the rest of the run as printed here
 * @returns {string} the run's text
 */
export function _styleRunText(path: HtmlPath, element: HtmlElement, css: string, absorb: boolean): string;
/**
 * XML character data in its shortest well-formed spelling: as it stands where
 * nothing in it is markup, else a CDATA section, else escaped.
 * @param {string} text decoded text
 * @returns {string} the text as XML content
 */
export function _xmlCharacterData(text: string): string;
/**
 * Whether an XML element is in a namespace that styles with CSS, read off the
 * `xmlns` declarations in scope for its prefix (Namespaces in XML §6.2).
 * @param {HtmlElement} node the element
 * @returns {boolean} true for an SVG or XHTML element
 */
export function _xmlElementIsStyled(node: HtmlElement): boolean;
/**
 * An XML element's start tag: as written, or when minifying rebuilt with one
 * space between attributes and each value in its shortest well-formed spelling.
 * @param {HtmlPath} path positioned on the element
 * @param {boolean} minify whether minifying
 * @returns {string} the start tag, ending in `>` even for an empty element
 */
export function _xmlOpenTag(path: HtmlPath, minify: boolean): string;
/**
 * @param {string | { href: string, target?: string }} base base option
 * @returns {string} base tag
 */
export function baseTag(base: string | {
    href: string;
    target?: string;
}): string;
/**
 * Serializes head tags in spec order — charset, base, meta, title — for a page
 * built from scratch; an authored page merges the same options in `parse`.
 * @param {OutputHtmlOptions} opts html options
 * @returns {string} head tags string
 */
export function buildHeadTags(opts: OutputHtmlOptions): string;
/**
 * Collapse every run of HTML whitespace to one space — never remove one:
 * `a <b>c</b>` and `a<b>c</b>` render differently.
 * @param {string} s text data
 * @returns {string} the collapsed text
 */
export function collapseWhitespaceRuns(s: string): string;
/**
 * Decode HTML character references in a string. Handles all numeric
 * references (with WHATWG remap of 0x00, surrogates, out-of-range, and the
 * C1 Windows-1252 table) and the full WHATWG named character references
 * table. Unknown or malformed references are left as literal text.
 *
 * When `isAttribute` is `true`, applies the WHATWG
 * "consumed-as-part-of-an-attribute" rule: a named reference without a
 * trailing `;` whose next character is `=` or ASCII alphanumeric is left
 * undecoded, so e.g. `&amp=foo` stays literal in an attribute value but
 * decodes to `&=foo` in text.
 *
 * With `withMap` the result also carries a boundary map from the decoded
 * string back to raw offsets, so spans computed on the decoded text (e.g.
 * srcset candidate URLs) can be translated to source ranges. `map[i]` is the
 * raw offset of decoded boundary `i` (`0..text.length`); boundaries inside a
 * reference's decoded text map to the reference start. `map` is `undefined`
 * when nothing was decoded (then `text === str`).
 * @overload
 * @param {string} str the raw string from the token slice
 * @param {boolean=} isAttribute true if `str` came from an attribute value
 * @returns {string} decoded string
 */
export function decodeEntities(str: string, isAttribute?: boolean | undefined): string;
/**
 * @overload
 * @param {string} str the raw string from the token slice
 * @param {boolean | undefined} isAttribute true if `str` came from an attribute value
 * @param {true} withMap also build the decoded-to-raw boundary map
 * @returns {DecodedEntitiesWithMap} decoded text and offset map
 */
export function decodeEntities(str: string, isAttribute: boolean | undefined, withMap: true): DecodedEntitiesWithMap;
/**
 * An attribute value as §3.3.3 normalizes a CDATA one: literal whitespace
 * becomes a space, then references are resolved.
 * @param {string} value the value as written
 * @returns {string} normalized value
 */
export function decodeXmlAttribute(value: string): string;
/**
 * Decode the character data of XML content.
 * @param {string} value source text, its line ends already folded
 * @returns {string} decoded text
 */
export function decodeXmlEntities(value: string): string;
/**
 * Escape a string per the WHATWG "escape a string" algorithm
 * (https://html.spec.whatwg.org/multipage/parsing.html#escapingString) in
 * attribute mode: `&`, U+00A0 and whichever quote delimits the value \u2014 the
 * other one stands literal, which is what makes `alt='say "hi"'` legal. CR/LF
 * are additionally encoded as numeric references so the result stays
 * single-line (usable in a `data:` URI). Single pass, returns the input
 * unchanged when nothing needs escaping.
 * @param {string} s string to escape
 * @param {number=} delimiter the quote the value is written in, `"` by default
 * @param {boolean=} minimal leave an `&` no reference can start after it bare,
 * and U+00A0 literal, as `_escapeTextContent` does for a text node
 * @returns {string} HTML attribute-safe string
 */
export function escapeAttribute(s: string, delimiter?: number | undefined, minimal?: boolean | undefined): string;
/**
 * Escape a string per the WHATWG "escape a string" algorithm in text mode:
 * `&`, U+00A0, `<` and `>`. CR/LF are additionally encoded as numeric
 * references so the result stays single-line (usable in a `data:` URI).
 * Single pass, returns the input unchanged when nothing needs escaping.
 * @param {string} s string to escape
 * @returns {string} HTML text-content-safe string
 */
export function escapeText(s: string): string;
/**
 * Escape an attribute value for XML (§3.1): `&`, `<` and the delimiter, plus the
 * whitespace §3.3.3 would otherwise normalize to a space.
 * @param {string} value decoded value
 * @param {string} quote the delimiter it is written between
 * @returns {string} the value as written between `quote`s
 */
export function escapeXmlAttribute(value: string, quote: string): string;
/**
 * Escape text for XML content (§2.4): `&`, `<` and `>`, and a CR, which §2.11
 * would otherwise read back as a LF. Only a `]]>` needs its `>` escaped, but a
 * bare one costs gzip what it saves raw where the text also spells `&lt;`.
 * @param {string} data decoded text
 * @returns {string} the text as character data
 */
export function escapeXmlText(data: string): string;
/**
 * The HTML `SourceProcessor` grammar: build the document AST (WHATWG tree
 * construction) and walk it, firing `enter` / `exit` in source order. The root
 * document / fragment node is visited too (with a `null` parent). When `writer`
 * is given the same walk also prints: each node's printer builds its text into
 * `writer` as the node finishes (post-order), and the root's text is taken as the
 * result — one parse, no re-tokenization.
 * @param {string} input source text
 * @param {CompiledVisitorMap} visitors compiled visitor map
 * @param {PrintContext | undefined} writer the print context to build output into, or undefined (walk only)
 * @param {HtmlProcessOptions} options process options
 */
export function grammar(input: string, visitors: CompiledVisitorMap, writer: PrintContext | undefined, options: HtmlProcessOptions): void;
/**
 * @param {string} s text to test
 * @returns {boolean} true when the text is HTML whitespace only
 */
export function isAllAsciiWhitespace(s: string): boolean;
/**
 * @param {number} cc character code
 * @returns {boolean} is ascii alphanumeric
 */
export function isAsciiAlphanumeric(cc: number): boolean;
/**
 * Tokenizer whitespace. U+000D CARRIAGE RETURN is included because the spec's
 * input-stream preprocessing converts CR (and CRLF) to LF before tokenizing;
 * this scanner keeps the original offsets, so it treats a raw CR as whitespace
 * to match the post-preprocessing behaviour.
 * @param {number} cc character code
 * @returns {boolean} is space
 */
export function isAsciiWhitespace(cc: number): boolean;
/**
 * @param {string} name meta name
 * @param {string} content meta content
 * @returns {string} meta tag
 */
export function metaTag(name: string, content: string): string;
/**
 * Extracts `url(...)` references from a CSS value (an SVG presentation
 * attribute). Reuses webpack's CSS lexer so quoting/escaping match the CSS
 * spec; returns the `parseSrc` shape so the shared emit path maps and rewrites
 * the spans. Unquoted `url(path)` rewrites the content span; quoted
 * `url("path")` rewrites the inner string span (quotes preserved).
 * @param {string} input attribute value (a CSS component-value list)
 * @returns {ParsedSource[]} url references
 */
export function parseCssUrls(input: string): ParsedSource[];
/**
 * @param {string} input HTML source
 * @param {number=} pos start byte offset (string input only; default `0`)
 * @param {HtmlParseOptions=} options parse options (fragment context, AST skips)
 * @returns {HtmlDocument} ref to the document node — read through `A`; valid until the next parse
 */
export function parseHtml(input: string, pos?: number | undefined, options?: HtmlParseOptions | undefined): HtmlDocument;
/**
 * Extracts the `icon-uri` value of an `msapplication-task` meta content
 * (`name=…;action-uri=…;icon-uri=…`) — the other parts are page URLs, not assets.
 * @param {string} input input
 * @returns {ParsedSource[]} parsed icon-uri
 */
export function parseMsapplicationTask(input: string): ParsedSource[];
/**
 * Parse a `src`-like URL attribute value: trim ASCII whitespace / U+00A0 from
 * both ends (offsets preserved for source rewriting), then strip ignorable
 * control characters. Throws when nothing remains.
 * @param {string} input attribute value
 * @returns {ParsedSource[]} parsed src
 */
export function parseSrc(input: string): ParsedSource[];
/**
 * @param {string} input input
 * @returns {ParsedSource[]} parsed srcset
 */
export function parseSrcset(input: string): ParsedSource[];
/**
 * The per-transform switches out of a wider options object — what
 * `optimization.minimize.html` names beside the transforms that are off until
 * asked for. Exported so the minify function the minimizer plugin ships to its
 * workers can pick them without repeating the names.
 * @param {HtmlTransformOptions} options an options object that may carry them
 * @returns {HtmlTransformOptions | undefined} the switches, or undefined when none is set
 */
export function pickTransforms(options: HtmlTransformOptions): HtmlTransformOptions | undefined;
/**
 * @param {string} s text to test
 * @returns {boolean} true when the text starts with HTML whitespace
 */
export function startsWithAsciiWhitespace(s: string): boolean;
/**
 * @param {string} input input string
 * @param {number} pos current position
 * @param {HtmlTokenCallbacks} callbacks callbacks
 * @returns {number} final position
 */
export function tokenize(input: string, pos?: number, callbacks?: HtmlTokenCallbacks): number;
/**
 * Tokenize XML 1.0 markup (§2.4–§4.1) into the callbacks `tokenize` drives, so
 * one tree builder serves both. Never throws: a document that is not well-formed
 * reads on the way a lenient processor would, reporting nothing.
 * @param {string} input input string
 * @param {number} pos current position
 * @param {HtmlTokenCallbacks} callbacks callbacks
 * @returns {number} final position
 */
export function tokenizeXml(input: string, pos?: number, callbacks?: HtmlTokenCallbacks): number;
/**
 * A materialized attribute as returned by `A.attributes` (tests/tooling) —
 * the parser-facing representation is an id into the attribute columns, read
 * through the scalar `A.attr*` accessors.
 * @typedef {object} HtmlAttribute
 * @property {string} name lowercased (and, in foreign content, adjusted) attribute name
 * @property {string} value
 * @property {string=} serializedName name used by the html5lib tree serializer (foreign-namespaced)
 * @property {number} nameStart source offset, or -1 on adoption-agency clones
 * @property {number} nameEnd
 * @property {number} valueStart source offset, or -1 when valueless / on clones
 * @property {number} valueEnd
 */
/**
 * A node reference into the struct-of-arrays AST: an integer id indexing the
 * parallel `_h*` columns. Read fields through the exported accessor `A`. Refs
 * are only valid until the next `parseHtml` call — the columns are reused
 * across parses — so consume a tree fully before parsing again.
 * @typedef {number} HtmlNodeRef
 */
/** @typedef {HtmlNodeRef} HtmlElement ref to an Element node */
/** @typedef {HtmlNodeRef} HtmlText ref to a Text node */
/** @typedef {HtmlNodeRef} HtmlComment ref to a Comment node */
/** @typedef {HtmlNodeRef} HtmlDoctype ref to a Doctype node */
/** @typedef {HtmlNodeRef} HtmlProcessingInstruction ref to a ProcessingInstruction node */
/** @typedef {HtmlNodeRef} HtmlDocument ref to the Document node */
/** @typedef {HtmlNodeRef} HtmlDocumentFragment ref to a DocumentFragment node */
/** @typedef {HtmlNodeRef} HtmlNode */
/**
 * An attribute as a node: a negative id, which the shared reads (`A.name`,
 * `A.value`, `A.start`, …) take. Same validity contract as `HtmlNodeRef`.
 * @typedef {number} HtmlAttributeRef
 */
/** @typedef {{ start: number, end: number, tagEnd: number, nameEnd: number }} TagPos */
declare const TOKEN_CHAR: 1;
declare const TOKEN_COMMENT: 2;
declare const TOKEN_DOCTYPE: 3;
declare const TOKEN_START_TAG: 4;
declare const TOKEN_END_TAG: 5;
declare const TOKEN_EOF: 6;
declare const TOKEN_PROCESSING_INSTRUCTION: 7;
/**
 * @param {Iterable<string>} names lowercase names to intern
 * @returns {{ mask: number, hashes: Int32Array, values: (string | undefined)[], memo: string[], sourceBacked: number[], noted: Uint8Array }} open-addressed intern table
 */
declare function buildNameInternTable(names: Iterable<string>): {
    mask: number;
    hashes: Int32Array;
    values: (string | undefined)[];
    memo: string[];
    sourceBacked: number[];
    noted: Uint8Array;
};
declare const EMPTY_U8: Uint8Array<ArrayBuffer>;
declare const EMPTY_I32: Int32Array<ArrayBuffer>;
import type { OutputHtmlOptions } from "../../declarations/WebpackOptions";
export { CC_NUMBER_SIGN as _CC_NUMBER_SIGN };
