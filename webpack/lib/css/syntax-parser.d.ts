export function _memoizedBlockBody(node: Node): string | undefined;
export function _memoizeBlockBody(node: Node, body: string | null): void;
/**
 * Renders source this stylesheet embeds — a `data:` URL's payload today.
 * Returning it unchanged, or anything but text, declines it, and the URL is
 * emitted as written.
 */
export type EmbeddedSourceRenderer = (source: string, info: {
    type: string;
    hostType: string;
}) => string | undefined;
/**
 * One embedded source recorded for a caller that can only answer
 * asynchronously, and the text to print once it has.
 */
export type DeferredEmbeddedSource = import("../util/dataURL").DeferredEmbeddedSource;
export type CssWhitespaceToken = {
    type: number;
    /**
     * byte offset of the first whitespace code point
     */
    start: number;
    /**
     * byte offset just past the last whitespace code point
     */
    end: number;
};
export type CssCommentToken = {
    type: number;
    /**
     * byte offset of the opening `/`
     */
    start: number;
    /**
     * byte offset just past the closing `/`
     */
    end: number;
};
export type CssStringToken = {
    type: number;
    /**
     * byte offset of the opening quote
     */
    start: number;
    /**
     * byte offset just past the closing quote (or EOF for unterminated strings)
     */
    end: number;
};
export type CssBadStringToken = {
    type: number;
    /**
     * byte offset of the opening quote
     */
    start: number;
    /**
     * byte offset where parsing gave up (typically the newline that broke the string)
     */
    end: number;
};
export type CssLeftCurlyBracketToken = {
    type: number;
    /**
     * byte offset of `{`
     */
    start: number;
    /**
     * `start + 1`
     */
    end: number;
};
export type CssRightCurlyBracketToken = {
    type: number;
    /**
     * byte offset of `}`
     */
    start: number;
    /**
     * `start + 1`
     */
    end: number;
};
export type CssLeftSquareBracketToken = {
    type: number;
    /**
     * byte offset of `[`
     */
    start: number;
    /**
     * `start + 1`
     */
    end: number;
};
export type CssRightSquareBracketToken = {
    type: number;
    /**
     * byte offset of `]`
     */
    start: number;
    /**
     * `start + 1`
     */
    end: number;
};
export type CssLeftParenthesisToken = {
    type: number;
    /**
     * byte offset of `(`
     */
    start: number;
    /**
     * `start + 1`
     */
    end: number;
};
export type CssRightParenthesisToken = {
    type: number;
    /**
     * byte offset of `)`
     */
    start: number;
    /**
     * `start + 1`
     */
    end: number;
};
export type CssFunctionToken = {
    type: number;
    /**
     * byte offset of the function name's first code point
     */
    start: number;
    /**
     * byte offset just past the `(` that closes the function token
     */
    end: number;
};
export type CssUrlToken = {
    type: number;
    /**
     * byte offset of the `url(` keyword (i.e. the `u`)
     */
    start: number;
    /**
     * byte offset just past the closing `)` (or EOF)
     */
    end: number;
    /**
     * byte offset of the first code point of the unquoted URL content (post leading whitespace)
     */
    contentStart: number;
    /**
     * byte offset just past the last code point of the unquoted URL content (pre trailing whitespace / `)` / EOF)
     */
    contentEnd: number;
};
export type CssBadUrlToken = {
    type: number;
    /**
     * byte offset of the `url(` keyword
     */
    start: number;
    /**
     * byte offset where parsing gave up (past the recovery `)` or EOF)
     */
    end: number;
};
export type CssColonToken = {
    type: number;
    /**
     * byte offset of `:`
     */
    start: number;
    /**
     * `start + 1`
     */
    end: number;
};
export type CssAtKeywordToken = {
    type: number;
    /**
     * byte offset of `@`
     */
    start: number;
    /**
     * byte offset just past the last ident-sequence code point
     */
    end: number;
};
export type CssDelimToken = {
    type: number;
    /**
     * byte offset of the delim code point
     */
    start: number;
    /**
     * `start + 1`
     */
    end: number;
};
export type CssIdentToken = {
    type: number;
    /**
     * byte offset of the first ident code point
     */
    start: number;
    /**
     * byte offset just past the last ident-sequence code point
     */
    end: number;
};
export type CssPercentageToken = {
    type: number;
    /**
     * byte offset of the first numeric code point
     */
    start: number;
    /**
     * byte offset just past the `%`
     */
    end: number;
};
export type CssNumberToken = {
    type: number;
    /**
     * byte offset of the first numeric code point
     */
    start: number;
    /**
     * byte offset just past the last numeric code point
     */
    end: number;
};
export type CssDimensionToken = {
    type: number;
    /**
     * byte offset of the first numeric code point
     */
    start: number;
    /**
     * byte offset just past the last unit ident code point
     */
    end: number;
    /**
     * byte offset of the first unit-ident code point (== end of the numeric run)
     */
    unitStart: number;
};
export type CssHashToken = {
    type: number;
    /**
     * byte offset of `#`
     */
    start: number;
    /**
     * byte offset just past the last ident-sequence code point
     */
    end: number;
    /**
     * true when the hash starts an ident sequence (`#foo`), false for non-ident hashes (`#1abc`)
     */
    isId: boolean;
};
export type CssSemicolonToken = {
    type: number;
    /**
     * byte offset of `;`
     */
    start: number;
    /**
     * `start + 1`
     */
    end: number;
};
export type CssCommaToken = {
    type: number;
    /**
     * byte offset of `,`
     */
    start: number;
    /**
     * `start + 1`
     */
    end: number;
};
export type CssCdoToken = {
    type: number;
    /**
     * byte offset of `<`
     */
    start: number;
    /**
     * byte offset just past `<!--`
     */
    end: number;
};
export type CssCdcToken = {
    type: number;
    /**
     * byte offset of `-`
     */
    start: number;
    /**
     * byte offset just past `-->`
     */
    end: number;
};
export type CssToken = CssWhitespaceToken | CssCommentToken | CssStringToken | CssBadStringToken | CssLeftCurlyBracketToken | CssRightCurlyBracketToken | CssLeftSquareBracketToken | CssRightSquareBracketToken | CssLeftParenthesisToken | CssRightParenthesisToken | CssFunctionToken | CssUrlToken | CssBadUrlToken | CssColonToken | CssAtKeywordToken | CssDelimToken | CssIdentToken | CssPercentageToken | CssNumberToken | CssDimensionToken | CssHashToken | CssSemicolonToken | CssCommaToken | CssCdoToken | CssCdcToken;
/**
 * A mutable lexer token. The `next` / `consume` hot path reuses a single
 * instance per `TokenStream` (the lexer writes into it instead of allocating
 * one object per token), which also keeps the parser's `t.type` reads
 * monomorphic. All fields are present from construction so the shape never
 * transitions; type-specific fields (`isId` / `contentStart` / `contentEnd` /
 * `unitStart`) carry stale values for unrelated token types and are only read
 * by `tokenToNode` for the matching type. Pass a fresh one per `readToken` call
 * to collect the raw token list (e.g. tests).
 */
export type MutableToken = {
    /**
     * a `TokenType`
     */
    type: number;
    /**
     * byte offset of the token's first code point
     */
    start: number;
    /**
     * byte offset just past the token's last code point
     */
    end: number;
    /**
     * hash tokens: starts an ident sequence
     */
    isId: boolean;
    /**
     * url tokens: first content code point
     */
    contentStart: number;
    /**
     * url tokens: just past the last content code point
     */
    contentEnd: number;
    /**
     * dimension tokens: first unit-ident code point
     */
    unitStart: number;
};
/**
 * Base AST node — the property-accessor view the `parseA*` entry points return
 * (see `_makeReader`). Every concrete node carries the `[start, end)` byte
 * `range` of the source slice it covers; `loc` is computed on demand from the
 * shared `LocConverter`, so line/column conversion is only paid when a consumer
 * needs it. The concrete node typedefs below extend this via `&`.
 *
 * Inside the parser a node ref is an integer id into the columns; the reader
 * exposes this property shape over a retained snapshot of those columns.
 */
export type Node = {
    /**
     * node-type discriminator
     */
    type: number;
    /**
     * byte offset of the node's first code point
     */
    start: number;
    /**
     * byte offset just past the node's last code point
     */
    end: number;
    /**
     * the `[start, end)` byte range
     */
    range: [number, number];
    /**
     * source location (1-based line, 0-based column)
     */
    loc: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    /**
     * source slice for this node
     */
    toString: () => string;
    /**
     * name with CSS escapes resolved (name-bearing nodes only)
     */
    unescapedName: string;
};
/**
 * Leaf token node (property-accessor view) — `value` is the raw source slice
 * (identifier text, quoted string including quotes, a dimension's full `123px`,
 * …; hash / at-keyword drop their `#` / `@` prefix, url uses its content range).
 * The `NumberToken` / `HashToken` / `UrlToken` / `DimensionToken` typedefs below
 * narrow the value accessors. `numericValue` / `typeFlag` / `sign` / `unit` are
 * derived from the source on read and are only meaningful on the matching token
 * type; `contentStart` / `contentEnd` mark a url token's inner content range.
 */
export type Token = Node & {
    value: string;
    unescaped: string;
    numericValue: number;
    typeFlag: "integer" | "number" | "id" | "unrestricted";
    sign: "+" | "-" | "";
    unit: string;
    contentStart: number;
    contentEnd: number;
};
/**
 * Number token (`123`, `-1.5`, `+2e3`). `value` is the raw source slice (the spec's "value"); `numericValue` / `typeFlag` / `sign` are lazy getters derived from it (see `Token`).
 */
export type NumberToken = Token & {
    numericValue: number;
    typeFlag: "integer" | "number";
    sign: "+" | "-" | "";
};
/**
 * Percentage token (`50%`). `value` is the raw slice including `%`; `numericValue` (without `%`) and `sign` are lazy getters.
 */
export type PercentageToken = Token & {
    numericValue: number;
    sign: "+" | "-" | "";
};
/**
 * Dimension token (`100px`, `1.5em`). `value` is the raw slice (number + unit); `numericValue` / `typeFlag` / `sign` (of the numeric part) and `unit` (lower-cased) are lazy getters.
 */
export type DimensionToken = Token & {
    numericValue: number;
    typeFlag: "integer" | "number";
    sign: "+" | "-" | "";
    unit: string;
};
/**
 * Hash token (`#foo`). `value` is the name without the leading `#`; `typeFlag` is the spec type flag ("id" when the name forms a valid `<id>` selector, "unrestricted" otherwise).
 */
export type HashToken = Token & {
    typeFlag: "id" | "unrestricted";
};
/**
 * Old-style unquoted URL token (`url(unquoted)`). `value` is the unquoted body;
 * `contentStart` / `contentEnd` mark the inner content range in the source.
 */
export type UrlToken = Token & {
    contentStart: number;
    contentEnd: number;
};
/**
 * Function node: `name(component-values...)`. `name` is the raw source slice
 * before the `(` (callers lowercase / unescape as needed); `nameStart` / `nameEnd`
 * are its `[start, end)` byte offsets; `value` is the component values inside the parentheses.
 */
export type FunctionNode = Node & {
    name: string;
    nameStart: number;
    nameEnd: number;
    value: ComponentValue[];
};
export type SimpleBlockToken = "[" | "(" | "{";
/**
 * Simple block (`[...]`, `(...)` not preceded by an ident, `{...}`). `token` is
 * the opening character. `value` is the component values inside. This shape is
 * produced by `consumeASimpleBlock` (§5.4.9) and appears in preludes.
 *
 * Note: `consumeABlock` (§5.4.4) returns the parsed block's separate `decls` /
 * `rules` lists (per §5.4.5), not a SimpleBlock wrapper — see
 * `AtRule` / `QualifiedRule`'s `declarations` and `childRules` fields.
 */
export type SimpleBlock = Node & {
    token: SimpleBlockToken;
    value: ComponentValue[];
};
/**
 * A CSS component value (CSS Syntax §5.4.8): a preserved token, a function, or
 * a simple block (`Token` also covers `HashToken` / `UrlToken`).
 */
export type ComponentValue = Token | FunctionNode | SimpleBlock;
/**
 * A CSS rule — an at-rule or a qualified rule.
 */
export type Rule = AtRule | QualifiedRule;
/**
 * Declaration: `name: value [!important][;]`. `name` is the raw property-name
 * slice; `value` is the trimmed component-value list (whitespace stripped from
 * both ends); `important` records a stripped `!important`.
 */
export type Declaration = Node & {
    name: string;
    nameStart: number;
    nameEnd: number;
    value: ComponentValue[];
    important: boolean;
};
/**
 * At-rule: `@name <prelude> ;` or `@name <prelude> { ... }`. `name` is the
 * at-keyword without the leading `@`; `prelude` is the component values up to
 * the at-rule's `;` / block / enclosing `}`. Per §5.4.2 the block is consumed
 * into separate `declarations` (a `Declaration[]`) and `childRules` (a `Rule[]`,
 * each an at-rule or qualified rule); both are `null` for a `;`-terminated
 * at-rule. `blockStart` / `blockEnd` are the `{` start / `}` end offsets
 * (webpack extension, not in spec; the spec doesn't track brace positions), or
 * `-1` / `-1` when there is no block. `range[1]` points past `}` for a block, or
 * at the `;` / `}` / EOF position otherwise (callers check the byte at `range[1]`
 * to tell them apart).
 */
export type AtRule = Node & {
    name: string;
    nameStart: number;
    nameEnd: number;
    prelude: ComponentValue[];
    declarations: Declaration[] | null;
    childRules: Rule[] | null;
    blockStart: number;
    blockEnd: number;
};
/**
 * Qualified rule: `<prelude> { <block> }`. `prelude` is the component values
 * before the `{` (selectors, keyframe parameters, …); `declarations` and
 * `childRules` are the parsed `{ ... }` body (split per tabatkins/parse-css.js
 * reference impl), or both `null` when EOF was hit before `{`. `blockStart` /
 * `blockEnd` are the `{` start / `}` end offsets (webpack extension), or `-1` /
 * `-1` when there is no block.
 */
export type QualifiedRule = Node & {
    prelude: ComponentValue[];
    declarations: Declaration[] | null;
    childRules: Rule[] | null;
    blockStart: number;
    blockEnd: number;
};
/**
 * Stylesheet (CSS Syntax §5.3.4): the result of `parseAStylesheet`. `rules`
 * holds the top-level at-rules / qualified rules (top-level declarations are
 * parse errors and never produced).
 */
export type Stylesheet = Node & {
    rules: Rule[];
};
export type ParseOptions = {
    /**
     * optional comment-token callback; the public `parse*` entry points use it to build the `TokenStream` so the outer parser's comment tracker still sees magic comments inside the consumed range
     */
    comment?: ((input: string, start: number, end: number) => number) | undefined;
};
export type NodeReader = {
    /**
     * snapshot this reader indexes
     */
    _store: NodeStore;
    /**
     * node id into the snapshot columns
     */
    _i: number;
    /**
     * node type
     */
    type: number;
    /**
     * start offset
     */
    start: number;
    /**
     * end offset
     */
    end: number;
    /**
     * start / end offsets
     */
    range: [number, number];
    /**
     * source location
     */
    loc: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    /**
     * source slice
     */
    toString: () => string;
    /**
     * token value (leaf) or component-value list (function / block / declaration)
     */
    value: string | ComponentValue[];
    /**
     * unescaped token value
     */
    unescaped: string;
    /**
     * parsed numeric value
     */
    numericValue: number;
    /**
     * spec type flag
     */
    typeFlag: "integer" | "number" | "id" | "unrestricted";
    /**
     * spec sign
     */
    sign: "+" | "-" | "";
    /**
     * dimension unit (lower-cased)
     */
    unit: string;
    /**
     * url content start offset
     */
    contentStart: number;
    /**
     * url content end offset
     */
    contentEnd: number;
    /**
     * rule / declaration / function name
     */
    name: string;
    /**
     * name start offset
     */
    nameStart: number;
    /**
     * name end offset
     */
    nameEnd: number;
    /**
     * unescaped name
     */
    unescapedName: string;
    /**
     * rule prelude
     */
    prelude: ComponentValue[];
    /**
     * block declarations
     */
    declarations: Declaration[] | null;
    /**
     * block child rules
     */
    childRules: Rule[] | null;
    /**
     * `{` start offset
     */
    blockStart: number;
    /**
     * `}` end offset
     */
    blockEnd: number;
    /**
     * `!important` flag
     */
    important: boolean;
    /**
     * simple-block opening char
     */
    token: SimpleBlockToken;
    /**
     * stylesheet rules
     */
    rules: Rule[];
};
export type NodeStore = {
    /**
     * source
     */
    input: string;
    /**
     * loc converter
     */
    lc: LocConverter;
    /**
     * node-type column
     */
    types: Uint8Array;
    /**
     * start-offset column
     */
    starts: Int32Array;
    /**
     * end-offset column
     */
    ends: Int32Array;
    /**
     * aux slot 0
     */
    aux0: Int32Array;
    /**
     * aux slot 1
     */
    aux1: Int32Array;
    /**
     * flags column
     */
    flags: Uint8Array;
    /**
     * content-span start column
     */
    listStarts: Int32Array;
    /**
     * content-span length column
     */
    listLens: Int32Array;
    /**
     * flat node-ref buffer
     */
    flat: Int32Array;
    /**
     * per-node `1 + body index` (0 = no body)
     */
    bodyIdx: Int32Array;
    /**
     * dense per-body declaration lists
     */
    declBodies: Node[][];
    /**
     * dense per-body child-rule lists
     */
    ruleBodies: Node[][];
};
export type VisitorFn = import("../util/SourceProcessor").VisitorFn<CssPath>;
export type VisitorBucket = import("../util/SourceProcessor").VisitorBucket<CssPath>;
export type VisitorMap = import("../util/SourceProcessor").VisitorMap<CssPath>;
export type CompiledVisitorMap = import("../util/SourceProcessor").CompiledVisitorMap<CssPath>;
/**
 * A CSS Syntax §5.4 top-level consumer that streams each top-level node it
 * produces to `onNode` (in source order) rather than collecting it. Every entry
 * in `TOP_LEVEL_CONSUMERS` shares this shape, so the walk's `grammar` drives any
 * `as` mode through one call — a future mode is just another map entry.
 */
export type TopLevelConsumer = (ts: TokenStream, onNode: (node: Rule | Declaration) => void) => void;
/**
 * What the minifying printer may rewrite. Every entry is on unless it is
 * `false`, so a document one transform breaks can still be minified by the rest.
 */
export type CssTransformOptions = {
    /**
     * write a color the target cannot read as an extra declaration before it, in a spelling it does read
     */
    colorFallbacks?: boolean | undefined;
    /**
     * write a spelling the target cannot read as one it can — the same value, said another way
     */
    lowerUnsupported?: boolean | undefined;
    /**
     * write a name that matches ASCII case-insensitively — an at-rule, property, pseudo, function, unit or keyword — in lowercase
     */
    foldCase?: boolean | undefined;
    /**
     * write an escaped identifier the shortest way that names it, wherever it stands
     */
    rewriteEscapes?: boolean | undefined;
    /**
     * which comments survive: `"some"` (the default) the ones that carry something, `true` / `"all"` every one, `false` none, or the ones a pattern matches / a predicate accepts, over the comment's own text
     */
    comments?: (boolean | "all" | "some" | string | RegExp | ((comment: string) => boolean)) | undefined;
    /**
     * write the query a `@custom-media` names wherever a condition asks for it, and drop the rule that named it
     */
    customMedia?: boolean | undefined;
    /**
     * write the selector list a `@custom-selector` names as `:is(…)` wherever a selector asks for it, and drop the rule that named it
     */
    customSelectors?: boolean | undefined;
    /**
     * write a family of longhands as the one shorthand that sets them
     */
    mergeLonghands?: boolean | undefined;
    /**
     * join rules that print the same block, at-rules that share a prelude, and a named `@layer` block a later sibling opens again
     */
    mergeRules?: boolean | undefined;
    /**
     * normalize a string's, `url()`'s, font family's and attribute value's quoting
     */
    normalizeQuotes?: boolean | undefined;
    /**
     * compute a call into the shorter call naming the same value (`calc()` and the math functions, transforms, gradients, easing functions, filters)
     */
    reduceFunctions?: boolean | undefined;
    /**
     * drop a rule or declaration nothing can read: an empty rule, and one an identical later one supersedes
     */
    removeDeadRules?: boolean | undefined;
    /**
     * print a style rule's declarations in one order by family, so blocks setting the same things read alike; only declarations whose order nothing can see move
     */
    reorderDeclarations?: boolean | undefined;
    /**
     * write a `:dir()` the target cannot read as the `[dir]` attribute selector, which reads the attribute rather than the directionality an element may inherit
     */
    rewriteDirSelector?: boolean | undefined;
    /**
     * write each color in the shortest spelling of the same value
     */
    shortenColors?: boolean | undefined;
    /**
     * write a media feature in its range spelling and collapse an `and` of two into the interval
     */
    shortenMediaQueries?: boolean | undefined;
    /**
     * write each number in its shortest equal spelling
     */
    shortenNumbers?: boolean | undefined;
    /**
     * rewrite a selector into a shorter equal one
     */
    shortenSelectors?: boolean | undefined;
    /**
     * write a value the shortest way its property's own grammar allows
     */
    shortenValues?: boolean | undefined;
};
export type CssProcessOptions = {
    /**
     * shared loc converter (default a fresh one over the input)
     */
    locConverter?: LocConverter | undefined;
    /**
     * walk into block bodies' nested rules (default true); ignored while printing, as `skip` is, since a block is printed from the children it would leave unread
     */
    recurseBlocks?: boolean | undefined;
    /**
     * which top-level production to consume the source as (see `TOP_LEVEL_CONSUMERS`): `"stylesheet"` (default) or `"block-contents"` (a block's contents, e.g. an HTML `style` attribute)
     */
    as?: ("stylesheet" | "block-contents") | undefined;
    /**
     * what the grammar may leave un-materialized to go faster — safe only for parts nothing reads in the active parse; default skip nothing. Ignored while printing (`minimize`), which needs every node
     */
    skip?: SkipOptions | undefined;
    /**
     * print the safely-minified serialization (collapsed whitespace, dropped redundant separators, the `printer`'s value transforms) as `process` walks and return `{ code, map }` (default false = walk only, return `undefined`)
     */
    minimize?: boolean | undefined;
    /**
     * name of the input in the emitted source map (`sources[0]` / `file`); only read while printing
     */
    source?: string | undefined;
    /**
     * the input's contents for the map's `sourcesContent`; only read while printing
     */
    content?: string | undefined;
    /**
     * what the target can read (the CSS entries of `output.environment`), so a spelling it would not understand is never reached for; only read while printing, and an absent entry means the modern spelling is available
     */
    environment?: CssEnvironment | undefined;
    /**
     * open the stylesheet with `@charset "UTF-8"` exactly when its output holds a non-ASCII character, so it is read as UTF-8 wherever it is served, and write a string's hex escape of a character past U+FFFF as the character, which costs fewer bytes once compressed; for a stylesheet that is a file of its own, as `@charset` is read only as one's opening bytes. Off by default, and only read while printing
     */
    declareCharset?: boolean | undefined;
    /**
     * `false` when the stylesheet is read as UTF-8 wherever it is served, so no `@charset` is written for it and a string's hex escape of a character past U+FFFF is written as the character, as `declareCharset` writes it. `"auto"` by default, and only read while printing
     */
    charset?: ("auto" | false) | undefined;
    /**
     * rewrite a length into a shorter unit it is exactly equal in (`16px` -> `1pc`); off by default because it earns nothing once the asset is compressed, and only read while printing. A time is always rewritten
     */
    convertLengthUnits?: boolean | undefined;
    /**
     * write a polar or Lab color as the nearest hex even where that hex only approximates it: a channel too near a `.5` boundary for two engines to round it alike, and a color outside the sRGB gamut, which hex can only clip. Off by default, and only read while printing; a space engines read through transfers of their own (`a98-rgb`, `prophoto-rgb`) is left alone either way
     */
    convertApproximateColors?: boolean | undefined;
    /**
     * give a rule the selectors of a later one printing the same block, and an at-rule the block of a later one stating the same condition, past the rules between them; off by default, since it reorders the cascade and is sound only where nothing between declares what the block being moved does for an element it can match — a condition between counting for what its own rules declare
     */
    mergeDistantRules?: boolean | undefined;
    /**
     * drop a declaration a later one in the same block overrides even where no target is selected, wherever Chromium, Gecko and WebKit each read the later value; off by default, and only read while printing. With a `browserslist` selection the drop is already made wherever every browser it names is known to read the later value, so this widens the case where no target is selected — a selection naming a browser the tables do not cover still answers for the whole of it
     */
    dropOverriddenDeclarations?: boolean | undefined;
    /**
     * shorten a custom property's value the way any other value is shortened (`--x:#ffffff` -> `#fff`); off by default because `getPropertyValue()` hands that text back, and only read while printing. What it may rewrite is what any other value's tokens may be, a color in a substitution's fallback included — that being the property's value rather than the function's own argument
     */
    rewriteCustomProperties?: boolean | undefined;
    /**
     * renders source this stylesheet embeds: the payload of a `url()` `data:` URL whose media type names a language webpack knows (SVG, CSS, HTML, JSON, JavaScript). Absent, a data URL is emitted exactly as written
     */
    renderEmbeddedSource?: EmbeddedSourceRenderer | undefined;
    /**
     * each pseudo-class to write as a class instead (`{ "focus-visible": "focus-visible" }`), so a script can apply it where the engine does not. Only read while printing
     */
    pseudoClasses?: {
        [name: string]: string;
    } | undefined;
    /**
     * names a whole-project analysis found unused, which the print takes out: a bare name is a class, an id and an `@keyframes` name, and a `--`-prefixed one is a custom property. Only read while printing
     */
    unusedSymbols?: string[] | undefined;
    /**
     * which of the meaning-preserving rewrites the minifying print makes; each is on unless it is `false`
     */
    transforms?: CssTransformOptions | undefined;
    /**
     * collects what `renderEmbeddedSource` would be offered instead of offering it, for a caller whose renderer is asynchronous: the print leaves a marker for each and `finish` puts the answers in their place, so one parse serves both. Takes precedence over `renderEmbeddedSource`
     */
    deferEmbeddedSource?: DeferredEmbeddedSource[] | undefined;
};
/**
 * The environment the stylesheet is built for. Every CSS ability the printer
 * reaches for is read off this selection, so nothing states one separately.
 */
export type CssEnvironment = {
    /**
     * the browserslist selection (`["chrome 100", "safari 15"]`), so vendor prefixes and every spelling a target has to be able to read are decided for exactly these browsers; absent leaves prefixes untouched and assumes every ability
     */
    browsers?: string[] | undefined;
    /**
     * whether prefixes are written at all; false leaves them alone while the selection still decides which spellings a target reads
     */
    vendorPrefixes?: boolean | undefined;
};
/**
 * `CssProcessOptions.skip`: two independent axes, so each reads unambiguously.
 */
export type SkipOptions = {
    /**
     * component-value node types to drop from declaration value / function-arg lists (indexed by `NodeType`, 1 = skip; build with `buildSkipSet`)
     */
    types?: Uint8Array | undefined;
    /**
     * drop qualified-rule (selector) preludes — the rule and its block are still produced (default false)
     */
    selectorPrelude?: boolean | undefined;
    /**
     * drop at-rule preludes — the at-rule and its block are still produced (default false)
     */
    atRulePrelude?: boolean | undefined;
};
export type CompiledVisitorBucket = import("../util/SourceProcessor").CompiledVisitorBucket<CssPath>;
/**
 * A rule the printer has written, at `[at, at + len)` of the piece holding it.
 * `key` is the text it printed to and `scope` what encloses it; a later rule
 * with both the same is this one written again. Neither is rewritten as the span
 * travels outward — only `scope` is replaced, by one standing for more — so the
 * collected and the streamed path split a rule the same way, which is what makes
 * the two agree on what a duplicate is.
 */
export type RuleSpan = {
    scope: RuleScope;
    key: string;
    at: number;
    len: number;
    taken: TakenPiece | null;
};
/**
 * A rule the printer has written, at `[at, at + len)` of the piece holding it.
 * `key` is the text it printed to and `scope` what encloses it; a later rule
 * with both the same is this one written again. Neither is rewritten as the span
 * travels outward — only `scope` is replaced, by one standing for more — so the
 * collected and the streamed path split a rule the same way, which is what makes
 * the two agree on what a duplicate is.
 */
export type RuleScope = {
    prefix: string;
    rules: Map<string, RuleSpan>;
    selectors: Map<string, RuleSpan | RuleSpan[]>;
    inner: Map<string, RuleScope>;
    noShadow: boolean;
};
/**
 * A rule the printer has written, at `[at, at + len)` of the piece holding it.
 * `key` is the text it printed to and `scope` what encloses it; a later rule
 * with both the same is this one written again. Neither is rewritten as the span
 * travels outward — only `scope` is replaced, by one standing for more — so the
 * collected and the streamed path split a rule the same way, which is what makes
 * the two agree on what a duplicate is.
 */
export type BlockSpans = {
    bodyAt: number;
    prelude: string;
    keyPrelude: string;
    qualified: boolean;
    spans: RuleSpan[];
};
/**
 * one top-level rule held back for a join, with where it stood, what it recorded, and whether a kept comment stands above it
 */
export type HeldTopLevel = {
    node: Node;
    offset: number;
    line: number | undefined;
    column: number | undefined;
    entry: RuleEntry;
    owned: boolean;
    own: BlockSpans | undefined;
    parted: boolean;
};
/**
 * the top-level rule last written out, the piece it stands in, how far into it its block starts, and whether a later rule's selectors joined its list
 */
export type PriorTopLevel = {
    taken: TakenPiece;
    span: RuleSpan;
    entry: RuleEntry;
    prelude: number;
    grown: boolean;
};
/**
 * What the CSS printer may be told, on top of the `mode` every language has —
 * the printing slice of `CssProcessOptions`, named once so nothing outside CSS
 * has to enumerate it.
 */
export type CssPrintOptions = Pick<CssProcessOptions, "environment" | "declareCharset" | "charset" | "convertLengthUnits" | "convertApproximateColors" | "dropOverriddenDeclarations" | "mergeDistantRules" | "rewriteCustomProperties" | "renderEmbeddedSource" | "deferEmbeddedSource" | "transforms" | "unusedSymbols" | "pseudoClasses">;
export type PrintContext = {
    options: import("../util/SourceProcessor").PrintOptions & CssPrintOptions;
    _printer: import("../util/SourceProcessor").NodePrinter<{
        /** @type {unknown} the run's state, set by `SourceProcessor` for the length of a run */
        state: unknown;
        /**
         * @returns {Node} current node — only valid during a visitor callback
         */
        readonly node: Node;
        /**
         * @returns {Node | null} enclosing node (null = a top-level node)
         */
        readonly parent: Node | null;
        /**
         * @returns {number} index of the current node within its sibling list (0 for a top-level node) — only valid during a visitor callback
         */
        readonly index: number;
        /** Stop the walk descending into the current node (enter only). */
        skipChildren(): void;
        /** Stop the walk: no visitor fires after the current one returns. */
        stop(): void;
        /**
         * A top-level rule and a comment have none; a hash within a declaration is
         * a color, elsewhere an id.
         * @param {number} type a `NodeType`
         * @returns {boolean} whether an ancestor of the current node has that type
         */
        within(type: number): boolean;
        /**
         * @param {Node=} n node
         * @returns {number} node type
         */
        type(n?: Node | undefined): number;
        /**
         * @param {Node=} n node
         * @returns {[number, number]} start and end offsets in the input
         */
        range(n?: Node | undefined): [number, number];
        /**
         * @param {Node=} n node
         * @returns {number} where the node starts in the input
         */
        start(n?: Node | undefined): number;
        /**
         * @param {Node=} n node
         * @returns {number} where the node ends in the input
         */
        end(n?: Node | undefined): number;
        /**
         * @param {Node=} n node
         * @returns {[number, number, number, number]} start line and column, end line and column (lines from 1, columns from 0)
         */
        loc(n?: Node | undefined): [number, number, number, number];
        /**
         * A node's text exactly as the input wrote it (`name` and `value` decode).
         * @param {Node | number=} n node, or the start offset when `end` is given
         * @param {number=} end end offset, to read the input between two offsets
         * @returns {string} the node's source, or the input between the offsets
         */
        source(n?: (Node | number) | undefined, end?: number | undefined): string;
        /**
         * The token's value as CSS Syntax defines it: a number for a number,
         * percentage or dimension, otherwise text with escapes resolved (a string
         * without its quotes, a hash without its `#`, a `url()`'s contents, a
         * comment's text); "" for a rule, declaration, function or block.
         * @param {Node=} n node
         * @returns {string | number} the decoded value
         */
        value(n?: Node | undefined): string | number;
        /**
         * @param {Node=} n node
         * @returns {string} an at-rule's, declaration's or function's name, escapes
         * resolved (an at-rule's without the `@`); a dimension's unit; "" for other nodes
         */
        name(n?: Node | undefined): string;
        /**
         * A rule's children are its prelude; its block is read with {@link field}.
         * @param {Node=} n node
         * @returns {number} number of children
         */
        childCount(n?: Node | undefined): number;
        /**
         * @param {number} i child index
         * @param {Node=} n node
         * @returns {ComponentValue} the i-th child (0 = none)
         */
        child(i: number, n?: Node | undefined): ComponentValue;
        /**
         * Every child as a new array, for a reader that keeps or searches them.
         * @param {Node=} n node
         * @returns {ComponentValue[]} its children (empty for a leaf)
         */
        children(n?: Node | undefined): ComponentValue[];
        /**
         * A block big enough to stream hands its children to the visitors as each
         * one finishes rather than collecting them, so its lists read as empty here.
         * @param {number} field a `Field`
         * @param {Node=} n node
         * @returns {number} number of items in that field (0 when the node has none)
         */
        fieldCount(field: number, n?: Node | undefined): number;
        /**
         * @param {number} i item index
         * @param {number} field a `Field`
         * @param {Node=} n node
         * @returns {Node} the i-th item of that field (0 = none)
         */
        field(i: number, field: number, n?: Node | undefined): Node;
        /**
         * @param {number} field a `Field`
         * @param {string} name the decoded name to look for
         * @param {Node=} n node
         * @returns {Node} the first item of that field with this name (0 = none)
         */
        fieldNamed(field: number, name: string, n?: Node | undefined): Node;
        /**
         * `important` is a container's bit, cleared when its id is reused; a token's
         * type flags are read off its text.
         * @param {number} flag a `Flag`
         * @param {Node=} n node
         * @returns {boolean} whether that flag is set
         */
        flag(flag: number, n?: Node | undefined): boolean;
        /**
         * @param {number} part a `Part`
         * @param {Node=} n node
         * @returns {[number, number] | null} where that part is written (null without one)
         */
        rangeOf(part: number, n?: Node | undefined): [number, number] | null;
        /**
         * @param {number} part a `Part`
         * @param {Node=} n node
         * @returns {number} where that part starts (-1 without one)
         */
        startOf(part: number, n?: Node | undefined): number;
        /**
         * @param {number} part a `Part`
         * @param {Node=} n node
         * @returns {number} where that part ends (-1 without one)
         */
        endOf(part: number, n?: Node | undefined): number;
        /**
         * CSS has no text beyond a node's name and value, read with `name` and `value`.
         * @param {number} _part a `Part`
         * @param {Node=} _n node
         * @returns {null} none
         */
        textOf(_part: number, _n?: Node | undefined): null;
    }, Node, CssPrintOptions>;
    _storeText: (string | null)[];
    _storeGen: Int32Array;
    _sourceText: (node: Node) => string;
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
    printNode(node: Node, path: {
        /** @type {unknown} the run's state, set by `SourceProcessor` for the length of a run */
        state: unknown;
        /**
         * @returns {Node} current node — only valid during a visitor callback
         */
        readonly node: Node;
        /**
         * @returns {Node | null} enclosing node (null = a top-level node)
         */
        readonly parent: Node | null;
        /**
         * @returns {number} index of the current node within its sibling list (0 for a top-level node) — only valid during a visitor callback
         */
        readonly index: number;
        /** Stop the walk descending into the current node (enter only). */
        skipChildren(): void;
        /** Stop the walk: no visitor fires after the current one returns. */
        stop(): void;
        /**
         * A top-level rule and a comment have none; a hash within a declaration is
         * a color, elsewhere an id.
         * @param {number} type a `NodeType`
         * @returns {boolean} whether an ancestor of the current node has that type
         */
        within(type: number): boolean;
        /**
         * @param {Node=} n node
         * @returns {number} node type
         */
        type(n?: Node | undefined): number;
        /**
         * @param {Node=} n node
         * @returns {[number, number]} start and end offsets in the input
         */
        range(n?: Node | undefined): [number, number];
        /**
         * @param {Node=} n node
         * @returns {number} where the node starts in the input
         */
        start(n?: Node | undefined): number;
        /**
         * @param {Node=} n node
         * @returns {number} where the node ends in the input
         */
        end(n?: Node | undefined): number;
        /**
         * @param {Node=} n node
         * @returns {[number, number, number, number]} start line and column, end line and column (lines from 1, columns from 0)
         */
        loc(n?: Node | undefined): [number, number, number, number];
        /**
         * A node's text exactly as the input wrote it (`name` and `value` decode).
         * @param {Node | number=} n node, or the start offset when `end` is given
         * @param {number=} end end offset, to read the input between two offsets
         * @returns {string} the node's source, or the input between the offsets
         */
        source(n?: (Node | number) | undefined, end?: number | undefined): string;
        /**
         * The token's value as CSS Syntax defines it: a number for a number,
         * percentage or dimension, otherwise text with escapes resolved (a string
         * without its quotes, a hash without its `#`, a `url()`'s contents, a
         * comment's text); "" for a rule, declaration, function or block.
         * @param {Node=} n node
         * @returns {string | number} the decoded value
         */
        value(n?: Node | undefined): string | number;
        /**
         * @param {Node=} n node
         * @returns {string} an at-rule's, declaration's or function's name, escapes
         * resolved (an at-rule's without the `@`); a dimension's unit; "" for other nodes
         */
        name(n?: Node | undefined): string;
        /**
         * A rule's children are its prelude; its block is read with {@link field}.
         * @param {Node=} n node
         * @returns {number} number of children
         */
        childCount(n?: Node | undefined): number;
        /**
         * @param {number} i child index
         * @param {Node=} n node
         * @returns {ComponentValue} the i-th child (0 = none)
         */
        child(i: number, n?: Node | undefined): ComponentValue;
        /**
         * Every child as a new array, for a reader that keeps or searches them.
         * @param {Node=} n node
         * @returns {ComponentValue[]} its children (empty for a leaf)
         */
        children(n?: Node | undefined): ComponentValue[];
        /**
         * A block big enough to stream hands its children to the visitors as each
         * one finishes rather than collecting them, so its lists read as empty here.
         * @param {number} field a `Field`
         * @param {Node=} n node
         * @returns {number} number of items in that field (0 when the node has none)
         */
        fieldCount(field: number, n?: Node | undefined): number;
        /**
         * @param {number} i item index
         * @param {number} field a `Field`
         * @param {Node=} n node
         * @returns {Node} the i-th item of that field (0 = none)
         */
        field(i: number, field: number, n?: Node | undefined): Node;
        /**
         * @param {number} field a `Field`
         * @param {string} name the decoded name to look for
         * @param {Node=} n node
         * @returns {Node} the first item of that field with this name (0 = none)
         */
        fieldNamed(field: number, name: string, n?: Node | undefined): Node;
        /**
         * `important` is a container's bit, cleared when its id is reused; a token's
         * type flags are read off its text.
         * @param {number} flag a `Flag`
         * @param {Node=} n node
         * @returns {boolean} whether that flag is set
         */
        flag(flag: number, n?: Node | undefined): boolean;
        /**
         * @param {number} part a `Part`
         * @param {Node=} n node
         * @returns {[number, number] | null} where that part is written (null without one)
         */
        rangeOf(part: number, n?: Node | undefined): [number, number] | null;
        /**
         * @param {number} part a `Part`
         * @param {Node=} n node
         * @returns {number} where that part starts (-1 without one)
         */
        startOf(part: number, n?: Node | undefined): number;
        /**
         * @param {number} part a `Part`
         * @param {Node=} n node
         * @returns {number} where that part ends (-1 without one)
         */
        endOf(part: number, n?: Node | undefined): number;
        /**
         * CSS has no text beyond a node's name and value, read with `name` and `value`.
         * @param {number} _part a `Part`
         * @param {Node=} _n node
         * @returns {null} none
         */
        textOf(_part: number, _n?: Node | undefined): null;
    }): void;
    printedAs(node: Node, text: string): void;
    printedSource(node: Node, sourceText: (node: Node) => string): void;
    printPiece(path: {
        /** @type {unknown} the run's state, set by `SourceProcessor` for the length of a run */
        state: unknown;
        /**
         * @returns {Node} current node — only valid during a visitor callback
         */
        readonly node: Node;
        /**
         * @returns {Node | null} enclosing node (null = a top-level node)
         */
        readonly parent: Node | null;
        /**
         * @returns {number} index of the current node within its sibling list (0 for a top-level node) — only valid during a visitor callback
         */
        readonly index: number;
        /** Stop the walk descending into the current node (enter only). */
        skipChildren(): void;
        /** Stop the walk: no visitor fires after the current one returns. */
        stop(): void;
        /**
         * A top-level rule and a comment have none; a hash within a declaration is
         * a color, elsewhere an id.
         * @param {number} type a `NodeType`
         * @returns {boolean} whether an ancestor of the current node has that type
         */
        within(type: number): boolean;
        /**
         * @param {Node=} n node
         * @returns {number} node type
         */
        type(n?: Node | undefined): number;
        /**
         * @param {Node=} n node
         * @returns {[number, number]} start and end offsets in the input
         */
        range(n?: Node | undefined): [number, number];
        /**
         * @param {Node=} n node
         * @returns {number} where the node starts in the input
         */
        start(n?: Node | undefined): number;
        /**
         * @param {Node=} n node
         * @returns {number} where the node ends in the input
         */
        end(n?: Node | undefined): number;
        /**
         * @param {Node=} n node
         * @returns {[number, number, number, number]} start line and column, end line and column (lines from 1, columns from 0)
         */
        loc(n?: Node | undefined): [number, number, number, number];
        /**
         * A node's text exactly as the input wrote it (`name` and `value` decode).
         * @param {Node | number=} n node, or the start offset when `end` is given
         * @param {number=} end end offset, to read the input between two offsets
         * @returns {string} the node's source, or the input between the offsets
         */
        source(n?: (Node | number) | undefined, end?: number | undefined): string;
        /**
         * The token's value as CSS Syntax defines it: a number for a number,
         * percentage or dimension, otherwise text with escapes resolved (a string
         * without its quotes, a hash without its `#`, a `url()`'s contents, a
         * comment's text); "" for a rule, declaration, function or block.
         * @param {Node=} n node
         * @returns {string | number} the decoded value
         */
        value(n?: Node | undefined): string | number;
        /**
         * @param {Node=} n node
         * @returns {string} an at-rule's, declaration's or function's name, escapes
         * resolved (an at-rule's without the `@`); a dimension's unit; "" for other nodes
         */
        name(n?: Node | undefined): string;
        /**
         * A rule's children are its prelude; its block is read with {@link field}.
         * @param {Node=} n node
         * @returns {number} number of children
         */
        childCount(n?: Node | undefined): number;
        /**
         * @param {number} i child index
         * @param {Node=} n node
         * @returns {ComponentValue} the i-th child (0 = none)
         */
        child(i: number, n?: Node | undefined): ComponentValue;
        /**
         * Every child as a new array, for a reader that keeps or searches them.
         * @param {Node=} n node
         * @returns {ComponentValue[]} its children (empty for a leaf)
         */
        children(n?: Node | undefined): ComponentValue[];
        /**
         * A block big enough to stream hands its children to the visitors as each
         * one finishes rather than collecting them, so its lists read as empty here.
         * @param {number} field a `Field`
         * @param {Node=} n node
         * @returns {number} number of items in that field (0 when the node has none)
         */
        fieldCount(field: number, n?: Node | undefined): number;
        /**
         * @param {number} i item index
         * @param {number} field a `Field`
         * @param {Node=} n node
         * @returns {Node} the i-th item of that field (0 = none)
         */
        field(i: number, field: number, n?: Node | undefined): Node;
        /**
         * @param {number} field a `Field`
         * @param {string} name the decoded name to look for
         * @param {Node=} n node
         * @returns {Node} the first item of that field with this name (0 = none)
         */
        fieldNamed(field: number, name: string, n?: Node | undefined): Node;
        /**
         * `important` is a container's bit, cleared when its id is reused; a token's
         * type flags are read off its text.
         * @param {number} flag a `Flag`
         * @param {Node=} n node
         * @returns {boolean} whether that flag is set
         */
        flag(flag: number, n?: Node | undefined): boolean;
        /**
         * @param {number} part a `Part`
         * @param {Node=} n node
         * @returns {[number, number] | null} where that part is written (null without one)
         */
        rangeOf(part: number, n?: Node | undefined): [number, number] | null;
        /**
         * @param {number} part a `Part`
         * @param {Node=} n node
         * @returns {number} where that part starts (-1 without one)
         */
        startOf(part: number, n?: Node | undefined): number;
        /**
         * @param {number} part a `Part`
         * @param {Node=} n node
         * @returns {number} where that part ends (-1 without one)
         */
        endOf(part: number, n?: Node | undefined): number;
        /**
         * CSS has no text beyond a node's name and value, read with `name` and `value`.
         * @param {number} _part a `Part`
         * @param {Node=} _n node
         * @returns {null} none
         */
        textOf(_part: number, _n?: Node | undefined): null;
    }): string;
    get(node: Node): string;
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
    takeRetractable(node: Node, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): number;
    take(node: Node, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): void;
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
/**
 * What a block's rules have shown so far: the signatures met (`seen`), and the
 * prefixed ones an unprefixed twin would make dead — as an output piece the
 * writer can take back (`retractable`, for a rule written straight out), or as
 * the node itself (`pending`, for a rule whose parent still has to assemble it).
 */
export type PrefixScope = {
    /**
     * the signatures met, and the `signature\0prefix`
     * markers of the prefixed spellings among them
     */
    seen: Set<string>;
    /**
     * each dead-if-twinned
     * rule's piece index, by the signature of the twin that would make it dead
     */
    retractable: Map<string, number[]> | null;
    /**
     * each dead-if-twinned nested
     * rule, by that same signature
     */
    pending: Map<string, Node[]> | null;
    /**
     * the nested rules a twin has since made dead,
     * read by their parent as it assembles its body
     */
    dead: Set<Node> | null;
    /**
     * each prefixed list still short of a twin for some of its selectors,
     * with the signatures it is still waiting for
     */
    covering: {
        missing: Set<string>;
        piece: number;
        node: Node | null;
    }[] | null;
};
/**
 * One alternative of a `@custom-media` query, read as what it can be written as:
 * `true` / `false`, a bare condition, a media type with the conditions after it
 * (`negated` where a `not` turns the whole query), or none of these.
 */
export type CustomMediaAlternative = {
    /**
     * what it is
     */
    kind: "true" | "false" | "condition" | "typed" | "negated" | "other";
    /**
     * `only` where written before the media type
     */
    prefix: string[];
    /**
     * the media type
     */
    type: string;
    /**
     * the condition's tokens
     */
    tokens: string[];
    /**
     * every token, as written
     */
    written: string[];
};
/**
 * A printed rule the merge can take apart again. `prelude` is how much of `text`
 * comes before the `{`, so a parent parts it without re-scanning; `children` is
 * what a mergeable at-rule's block is made of, so two blocks join at the seam
 * their texts would otherwise hide.
 */
export type RuleEntry = {
    /**
     * the rule as printed
     */
    text: string;
    /**
     * the prelude's length, `-1` for a rule that cannot join
     */
    prelude: number;
    /**
     * whether it is an at-rule
     */
    atRule: boolean;
    /**
     * whether its block holds declarations and no rule,
     * so another's declarations may follow them without crossing one
     */
    plain: boolean;
    /**
     * whether its prelude may also join another's
     * selector list, which a plain block under a plain selector may: `LIST_UNKNOWN`
     * until a join asks, then `LIST_YES` / `LIST_NO`
     */
    listable: number;
    /**
     * which shape answers that — a selector, a keyframe
     * selector or a nested selector
     */
    listKind: number;
    /**
     * a mergeable at-rule's block, else null
     */
    children: RuleEntry[] | null;
    /**
     * the block's text but for its last child, so a run of
     * joins appends what it adds rather than re-reading what it has
     */
    head: string;
    /**
     * whether a join left a selector list under it
     * concatenated: its own, or one a child carries. The run that grew it settles
     * it where the run ends (`_settleJoinedSeams`), so a join stays what it costs
     * to append rather than re-reading the list it has
     */
    unordered: boolean;
    /**
     * its prelude where a join wrote it, so the next
     * join reads or appends to it rather than cutting it back out of `text`, which
     * would flatten the whole run so far; null to read it off `text`
     */
    list: string | null;
    /**
     * the text from its `{` on, held beside `list`
     * for the same reason
     */
    block: string | null;
    /**
     * its block's declarations
     * where a join of two blocks under one prelude wrote them, so the next join
     * reads them rather than parsing the whole block again; null to parse `text`
     */
    declarations: PrintedDeclaration[] | null;
};
/**
 * one declaration of a printed block: its lowercased property, its value and its whole text
 */
export type PrintedDeclaration = {
    property: string;
    value: string;
    text: string;
};
/**
 * a named block already out, whether a later sibling wrote inside its layer's subtree, the piece its rules are keyed in, the entry a later block of its layer joins against, and whether it is still the `@layer <name>;` statement its first block takes the place of
 */
export type SeenLayer = {
    at: number;
    subtree: boolean;
    taken?: TakenPiece;
    entry?: RuleEntry;
    statement?: boolean;
};
/**
 * Every property `getDeclarationRanks` names by a small number: its rank, the
 * number of the property `_canonicalProperty` reads it as, and `_orderMatters`
 * of two such numbers, filled in as pairs are asked of.
 */
export type DeclarationTable = {
    /**
     * each property's number
     */
    ids: Map<string, number>;
    /**
     * the rank of each number
     */
    ranks: Int32Array;
    /**
     * the number of the property each is read as
     */
    canonical: Int32Array;
    /**
     * the property each number stands for
     */
    names: string[];
    /**
     * the number of `all`
     */
    all: number;
    /**
     * `_orderMatters` by `a * names.length + b`: 0 unknown, 1 no, 2 yes
     */
    matters: Uint8Array;
};
/**
 * The CSS path: the AST accessor with the walk's
 * current position on it — the single argument every visitor receives.
 */
export type CssPath = typeof A;
/**
 * a list `Field`
 */
export type CssListField = 1 | 2 | 3 | 4;
/**
 * a component value's `NodeType`
 */
export type CssComponentValueType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22;
/**
 * CSS's parts by node type, which type each visitor's path; every CSS `Field`
 * is a list.
 */
export type CssParts = {
    types: CssNodeType;
    field: CssListField;
    flag: typeof Flag.important | typeof Flag.integer | typeof Flag.id;
    part: 1 | 2 | 3;
    text: never;
    fields: {
        1: never;
        2: 2;
        3: never;
        4: never;
        5: never;
        6: never;
        7: never;
        8: never;
        9: never;
        10: never;
        11: never;
        12: never;
        13: never;
        14: never;
        15: never;
        16: never;
        17: never;
        18: never;
        19: never;
        20: never;
        21: never;
        22: 2;
        23: 2;
        24: 1 | 3 | 4;
        25: 1 | 3 | 4;
        26: 4;
        27: never;
        28: never;
    };
    flags: {
        1: never;
        2: never;
        3: never;
        4: typeof Flag.id;
        5: never;
        6: never;
        7: never;
        8: never;
        9: never;
        10: typeof Flag.integer;
        11: typeof Flag.integer;
        12: typeof Flag.integer;
        13: never;
        14: never;
        15: never;
        16: never;
        17: never;
        18: never;
        19: never;
        20: never;
        21: never;
        22: never;
        23: typeof Flag.important;
        24: never;
        25: never;
        26: never;
        27: never;
        28: never;
    };
    parts: {
        1: never;
        2: typeof Part.name;
        3: never;
        4: never;
        5: never;
        6: never;
        7: typeof Part.value;
        8: never;
        9: never;
        10: never;
        11: never;
        12: typeof Part.name;
        13: never;
        14: never;
        15: never;
        16: never;
        17: never;
        18: never;
        19: never;
        20: never;
        21: never;
        22: never;
        23: typeof Part.name;
        24: typeof Part.name | typeof Part.block;
        25: typeof Part.block;
        26: never;
        27: never;
        28: never;
    };
    texts: {
        1: never;
        2: never;
        3: never;
        4: never;
        5: never;
        6: never;
        7: never;
        8: never;
        9: never;
        10: never;
        11: never;
        12: never;
        13: never;
        14: never;
        15: never;
        16: never;
        17: never;
        18: never;
        19: never;
        20: never;
        21: never;
        22: never;
        23: never;
        24: never;
        25: never;
        26: never;
        27: never;
        28: never;
    };
    items: {
        [field: number]: number;
        1: CssComponentValueType;
        2: CssComponentValueType;
        3: 23;
        4: 24 | 25;
    };
};
/**
 * The path a visitor of node type `T` receives, with the run's state `S`.
 */
export type CssNodePath<T = number, S = unknown> = import("../util/SourceProcessor").TypedNodePath<CssPath, Node, CssParts, T, S>;
/**
 * A visitor map whose each visitor's path is typed by its node type and run state.
 */
export type CssVisitorMap<S = unknown> = {
    1?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<1, S>>;
    2?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<2, S>>;
    3?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<3, S>>;
    4?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<4, S>>;
    5?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<5, S>>;
    6?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<6, S>>;
    7?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<7, S>>;
    8?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<8, S>>;
    9?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<9, S>>;
    10?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<10, S>>;
    11?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<11, S>>;
    12?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<12, S>>;
    13?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<13, S>>;
    14?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<14, S>>;
    15?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<15, S>>;
    16?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<16, S>>;
    17?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<17, S>>;
    18?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<18, S>>;
    19?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<19, S>>;
    20?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<20, S>>;
    21?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<21, S>>;
    22?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<22, S>>;
    23?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<23, S>>;
    24?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<24, S>>;
    25?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<25, S>>;
    26?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<26, S>>;
    27?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<27, S>>;
    28?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<28, S>>;
};
/**
 * a `NodeType` member
 */
export type CssNodeType = (typeof NodeType)[keyof typeof NodeType];
/**
 * One `@custom-media` or `@custom-selector` rule a source writes: the name it
 * states and the names it is read through, keyed by the rule's own name so the
 * two never meet, and the rule as a statement.
 */
export type CustomAtRule = {
    /**
     * the name it states, or "" where it states none
     */
    name: string;
    /**
     * the names it reads
     */
    references: string[];
    /**
     * the rule, ending in `;`
     */
    text: string;
};
export namespace A {
    let state: unknown;
    namespace node {
        let type: number;
        let start: number;
        let end: number;
        let range: [number, number];
        let loc: {
            start: {
                line: number;
                column: number;
            };
            end: {
                line: number;
                column: number;
            };
        };
        let toString: () => string;
        let unescapedName: string;
    }
    namespace parent { }
    const index: number;
    /** Stop the walk descending into the current node (enter only). */
    function skipChildren(): void;
    /** Stop the walk: no visitor fires after the current one returns. */
    function stop(): void;
    /**
     * A top-level rule and a comment have none; a hash within a declaration is
     * a color, elsewhere an id.
     * @param {number} type a `NodeType`
     * @returns {boolean} whether an ancestor of the current node has that type
     */
    function within(type: number): boolean;
    /**
     * @param {Node=} n node
     * @returns {number} node type
     */
    function type(n?: Node | undefined): number;
    /**
     * @param {Node=} n node
     * @returns {[number, number]} start and end offsets in the input
     */
    function range(n?: Node | undefined): [number, number];
    /**
     * @param {Node=} n node
     * @returns {number} where the node starts in the input
     */
    function start(n?: Node | undefined): number;
    /**
     * @param {Node=} n node
     * @returns {number} where the node ends in the input
     */
    function end(n?: Node | undefined): number;
    /**
     * @param {Node=} n node
     * @returns {[number, number, number, number]} start line and column, end line and column (lines from 1, columns from 0)
     */
    function loc(n?: Node | undefined): [number, number, number, number];
    /**
     * A node's text exactly as the input wrote it (`name` and `value` decode).
     * @param {Node | number=} n node, or the start offset when `end` is given
     * @param {number=} end end offset, to read the input between two offsets
     * @returns {string} the node's source, or the input between the offsets
     */
    function source(n?: (Node | number) | undefined, end?: number | undefined): string;
    /**
     * The token's value as CSS Syntax defines it: a number for a number,
     * percentage or dimension, otherwise text with escapes resolved (a string
     * without its quotes, a hash without its `#`, a `url()`'s contents, a
     * comment's text); "" for a rule, declaration, function or block.
     * @param {Node=} n node
     * @returns {string | number} the decoded value
     */
    function value(n?: Node | undefined): string | number;
    /**
     * @param {Node=} n node
     * @returns {string} an at-rule's, declaration's or function's name, escapes
     * resolved (an at-rule's without the `@`); a dimension's unit; "" for other nodes
     */
    function name(n?: Node | undefined): string;
    /**
     * A rule's children are its prelude; its block is read with {@link field}.
     * @param {Node=} n node
     * @returns {number} number of children
     */
    function childCount(n?: Node | undefined): number;
    /**
     * @param {number} i child index
     * @param {Node=} n node
     * @returns {ComponentValue} the i-th child (0 = none)
     */
    function child(i: number, n?: Node | undefined): ComponentValue;
    /**
     * Every child as a new array, for a reader that keeps or searches them.
     * @param {Node=} n node
     * @returns {ComponentValue[]} its children (empty for a leaf)
     */
    function children(n?: Node | undefined): ComponentValue[];
    /**
     * A block big enough to stream hands its children to the visitors as each
     * one finishes rather than collecting them, so its lists read as empty here.
     * @param {number} field a `Field`
     * @param {Node=} n node
     * @returns {number} number of items in that field (0 when the node has none)
     */
    function fieldCount(field: number, n?: Node | undefined): number;
    /**
     * @param {number} i item index
     * @param {number} field a `Field`
     * @param {Node=} n node
     * @returns {Node} the i-th item of that field (0 = none)
     */
    function field(i: number, field: number, n?: Node | undefined): Node;
    /**
     * @param {number} field a `Field`
     * @param {string} name the decoded name to look for
     * @param {Node=} n node
     * @returns {Node} the first item of that field with this name (0 = none)
     */
    function fieldNamed(field: number, name: string, n?: Node | undefined): Node;
    /**
     * `important` is a container's bit, cleared when its id is reused; a token's
     * type flags are read off its text.
     * @param {number} flag a `Flag`
     * @param {Node=} n node
     * @returns {boolean} whether that flag is set
     */
    function flag(flag: number, n?: Node | undefined): boolean;
    /**
     * @param {number} part a `Part`
     * @param {Node=} n node
     * @returns {[number, number] | null} where that part is written (null without one)
     */
    function rangeOf(part: number, n?: Node | undefined): [number, number] | null;
    /**
     * @param {number} part a `Part`
     * @param {Node=} n node
     * @returns {number} where that part starts (-1 without one)
     */
    function startOf(part: number, n?: Node | undefined): number;
    /**
     * @param {number} part a `Part`
     * @param {Node=} n node
     * @returns {number} where that part ends (-1 without one)
     */
    function endOf(part: number, n?: Node | undefined): number;
    /**
     * CSS has no text beyond a node's name and value, read with `name` and `value`.
     * @param {number} _part a `Part`
     * @param {Node=} _n node
     * @returns {null} none
     */
    function textOf(_part: number, _n?: Node | undefined): null;
}
export const DARK_PROPERTY: "--webpack-dark";
export const KEYFRAMES_AT_RULE_RE: RegExp;
export const LIGHT_PROPERTY: "--webpack-light";
/**
 * The parts of a node read with `field`, `fieldCount` and `fieldNamed`, named
 * as CSS Syntax §5 names them. All four are lists.
 * @type {{ prelude: 1, value: 2, declarations: 3, rules: 4 }}
 */
export const Field: {
    prelude: 1;
    value: 2;
    declarations: 3;
    rules: 4;
};
/**
 * What `flag` answers: a declaration's `!important`, a number's `integer` type
 * flag and a hash's `id` type flag (CSS Syntax §4.2).
 * @type {{ important: 1, integer: 2, id: 4 }}
 */
export const Flag: {
    important: 1;
    integer: 2;
    id: 4;
};
/**
 * The parts of a node read with `rangeOf` and `textOf`.
 * @type {{ name: 1, value: 2, block: 3 }}
 */
export const Part: {
    name: 1;
    value: 2;
    block: 3;
};
declare const CC_0: number;
declare const CC_APOSTROPHE: number;
declare const CC_COMMA: number;
declare const CC_FULL_STOP: number;
declare const CC_GREATER_THAN_SIGN: number;
declare const CC_HYPHEN_MINUS: number;
declare const CC_LEFT_PARENTHESIS: number;
declare const CC_LEFT_SQUARE: number;
declare const CC_LOWER_D: number;
declare const CC_LOW_LINE: number;
declare const CC_NUMBER_SIGN: number;
declare const CC_PLUS_SIGN: number;
declare const CC_QUOTATION_MARK: number;
declare const CC_REVERSE_SOLIDUS: number;
declare const CC_RIGHT_PARENTHESIS: number;
declare const CC_RIGHT_SQUARE: number;
declare const CC_SPACE: number;
declare const CC_TILDE: number;
declare const CC_UPPER_A: number;
declare const CC_UPPER_Z: number;
declare const LIST_KIND_KEYFRAME: 1;
declare const LIST_KIND_NESTED: 2;
declare const LIST_KIND_SELECTOR: 0;
declare const LIST_NO: 2;
declare const LIST_UNKNOWN: 0;
/**
 * @param {Node} n node
 * @returns {SimpleBlockToken} a simple block's opening bracket ("" for other nodes)
 */
export function _blockTokenOf(n: Node): SimpleBlockToken;
/**
 * AST node / leaf-token `type` discriminators (spec name where it has one, else
 * parse-css's PascalCase). Numeric for the same reasons as the `TT_*` token
 * constants: a compact `Node#type` slot and integer `===` / `Map` keys on the
 * visitor hot path. Kept as a `NodeType` namespace (not bare constants) because
 * consumers reference members as `NodeType.AtRule`; exported so visitor maps
 * (`SourceProcessor#use`) and `CssParser` name nodes instead of a string
 * literal. A lexer token type never reaches a `Node#type`.
 * @type {{ Ident: 1, Function: 2, AtKeyword: 3, Hash: 4, String: 5, BadString: 6, Url: 7, BadUrl: 8, Delim: 9, Number: 10, Percentage: 11, Dimension: 12, Whitespace: 13, Colon: 14, Semicolon: 15, Comma: 16, RightParenthesis: 17, RightSquareBracket: 18, RightCurlyBracket: 19, CDO: 20, CDC: 21, SimpleBlock: 22, Declaration: 23, AtRule: 24, QualifiedRule: 25, Stylesheet: 26, Comment: 27, Raw: 28 }}
 */
export const NodeType: {
    Ident: 1;
    Function: 2;
    AtKeyword: 3;
    Hash: 4;
    String: 5;
    BadString: 6;
    Url: 7;
    BadUrl: 8;
    Delim: 9;
    Number: 10;
    Percentage: 11;
    Dimension: 12;
    Whitespace: 13;
    Colon: 14;
    Semicolon: 15;
    Comma: 16;
    RightParenthesis: 17;
    RightSquareBracket: 18;
    RightCurlyBracket: 19;
    CDO: 20;
    CDC: 21;
    SimpleBlock: 22;
    Declaration: 23;
    AtRule: 24;
    QualifiedRule: 25;
    Stylesheet: 26;
    Comment: 27;
    Raw: 28;
};
/**
 * The lexer token types by spec name, as `readToken` and `TokenStream` callers
 * read them.
 * @type {{ Comment: 1, Whitespace: 2, String: 3, BadString: 4, Hash: 5, Delim: 6, LeftParenthesis: 7, LeftSquareBracket: 8, LeftCurlyBracket: 9, RightParenthesis: 10, RightSquareBracket: 11, RightCurlyBracket: 12, Comma: 13, Colon: 14, Semicolon: 15, AtKeyword: 16, Function: 17, Url: 18, BadUrl: 19, Ident: 20, Number: 21, Percentage: 22, Dimension: 23, CDO: 24, CDC: 25, EOF: 26 }}
 */
export const TokenType: {
    Comment: 1;
    Whitespace: 2;
    String: 3;
    BadString: 4;
    Hash: 5;
    Delim: 6;
    LeftParenthesis: 7;
    LeftSquareBracket: 8;
    LeftCurlyBracket: 9;
    RightParenthesis: 10;
    RightSquareBracket: 11;
    RightCurlyBracket: 12;
    Comma: 13;
    Colon: 14;
    Semicolon: 15;
    AtKeyword: 16;
    Function: 17;
    Url: 18;
    BadUrl: 19;
    Ident: 20;
    Number: 21;
    Percentage: 22;
    Dimension: 23;
    CDO: 24;
    CDC: 25;
    EOF: 26;
};
/**
 * Position-based view over the lexer — webpack's stand-in for the spec's
 * "normalize into a token stream" (CSS Syntax §9). It unifies the lexer and the
 * stream in one class: the `readToken` primitive lexes one token (the CSS
 * tokenizer), and the spec token-stream operations `next` / `consume` /
 * `discard` / `mark` / `restoreMark` / `discardMark` drive it from a byte
 * cursor. `parse*` entry points wrap a source string in one of these and every
 * `consume*` algorithm reads tokens from it.
 *
 * No token buffer is kept: the cursor is a byte offset and the only state is
 * the next token (lazily tokenized once and cached until consumed). The
 * declaration-vs-qualified-rule backtracking in `consumeABlocksContents`
 * rewinds by `mark`ing / `restoreMark`ing that byte offset, which simply
 * re-tokenizes the rewound span — comment tokens are filtered here and fire
 * `onComment` once each, tracked by a monotonic high-water mark so a
 * re-tokenized span never re-fires them.
 *
 * `SourceProcessor` is handed this class (not an instance) and threads it to
 * the grammar, so a different language can drive the same visitor machinery by
 * swapping the tokenizer — the per-token `readToken` primitive — for its own.
 */
export class TokenStream {
    /**
     * @param {string} input source
     * @param {number=} pos start byte offset (default `0`)
     * @param {LocConverter=} locConverter shared loc converter (default a fresh one over `input`)
     * @param {((input: string, start: number, end: number) => number)=} onComment comment-token callback
     */
    constructor(input: string, pos?: number | undefined, locConverter?: LocConverter | undefined, onComment?: ((input: string, start: number, end: number) => number) | undefined);
    /** @type {string} */
    input: string;
    /** @type {LocConverter} */
    locConverter: LocConverter;
    _onComment: (input: string, start: number, end: number) => number;
    /** @type {number} */
    _pos: number;
    /** @type {number} */
    _commentHigh: number;
    /** @type {MutableToken} */
    _tok: MutableToken;
    /** @type {boolean} whether `_tok` holds the (lazily tokenized) next token */
    _hasNext: boolean;
    /** @type {number[]} byte offsets to rewind to */
    _marks: number[];
    /**
     * The next token (CSS Syntax §3 "next token") — the upcoming token without
     * consuming it; the `<eof-token>` once the source is exhausted. This is the
     * token the consume algorithms dispatch on (the spec's "process"). Tokenized
     * from `_pos` on first use and cached until consumed; comment tokens are
     * skipped here, firing `onComment` once each.
     * @returns {MutableToken} the next token
     */
    next(): MutableToken;
    /**
     * Consume a token (CSS Syntax §3 "consume a token") — return the next token
     * and advance the cursor past it. The returned token is valid until the next
     * `next` re-tokenizes (the reused instance is not cleared by advancing).
     * @returns {MutableToken} the consumed token
     */
    consume(): MutableToken;
    /**
     * Discard a token (CSS Syntax §3 "discard a token") — advance the cursor past
     * the next token without returning it.
     * @returns {void}
     */
    discard(): void;
    /**
     * Advance past the already-peeked next token, skipping the redundant `next()`
     * re-check `consume` / `discard` pay. Precondition: the caller has just called
     * `next()` (so `_tok` is the cached next token and `_hasNext` is true) and that
     * token is not the `<eof-token>` — the hot "peek, decide, advance" sites where
     * both always hold. Callers that can't guarantee a non-EOF cached token use
     * `consume` / `discard` instead.
     * @returns {void}
     */
    advance(): void;
    /**
     * Step over the whitespace the next token would be, without tokenizing it —
     * for the sites that discard whitespace tokens. No-op while a token is cached.
     * @returns {void}
     */
    skipWhitespace(): void;
    /**
     * Step over the run of selector-prelude leaves a skip-mode parse drops (CSS
     * Syntax §5.4.3's "append to prelude", which skip mode does not do), without
     * lexing one token each. Only valid where every leaf up to the next
     * `BC_PRELUDE_STOP` code point is dropped whatever it is — which in
     * `consumeAQualifiedRule` is once the two tokens the `--foo: {`
     * disambiguation reads have both been seen. No-op while a token is cached.
     * @returns {void}
     */
    skipPreludeLeaves(): void;
    /**
     * Mark (CSS Syntax §3 "mark") — push the current cursor position.
     * @returns {void}
     */
    mark(): void;
    /**
     * Restore a mark (CSS Syntax §3 "restore a mark") — pop the last mark and
     * rewind the cursor to it. The rewound span is re-tokenized on the next read;
     * already-fired comments are not re-fired (`_commentHigh`).
     * @returns {void}
     */
    restoreMark(): void;
    /**
     * Discard a mark (CSS Syntax §3 "discard a mark") — pop without rewinding.
     * @returns {void}
     */
    discardMark(): void;
}
export const VENDOR_PREFIX: RegExp;
export const _IMPORTANT: "!important";
export const _LONE_NUMBER_RE: RegExp;
export const _NO_RULE_SPANS: RuleSpan[];
export const _NUMERIC_RE: RegExp;
/**
 * @param {Node} n at-rule
 * @returns {string} its name, escapes resolved and ASCII lowercased
 */
export function _atKeywordOf(n: Node): string;
/**
 * A node's text as the printer reads it: as written, but for an escape the
 * input ran out of, which is the character it names (§4.3.5, §4.3.7).
 * @param {Node} n node
 * @returns {string} its text
 */
export function _printedSource(n: Node): string;
/**
 * A rule's, declaration's or function's name as written, but for an escape the
 * input ran out of, which is the replacement character it names (§4.3.7).
 * @param {Node} n node
 * @returns {string} the raw name
 */
export function _rawName(n: Node): string;
/**
 * Name the printer that writes `_VERBATIM_LEAVES` as their source text, so a
 * walk printing through it stores their text without calling it.
 * @param {EXPECTED_FUNCTION} printer the CSS printer
 * @returns {void}
 */
declare function setVerbatimLeafPrinter(printer: EXPECTED_FUNCTION): void;
/**
 * Trim the whitespace CSS itself skips. `String#trim` also eats U+00A0 and the
 * other Unicode spaces, which an identifier carries as ordinary characters, so
 * a layer named `\u00A0x` would compare equal to one named `x`.
 * @param {string} text the text to trim
 * @returns {string} the text without its leading and trailing CSS whitespace
 */
export function _trimCssWhiteSpace(text: string): string;
/**
 * A rule's block declarations as the array the parser holds; for the minifier
 * and printer, which reorder and merge them. Empty on a streamed block.
 * @param {Node} n node
 * @returns {Declaration[] | null} the declarations (null without a block)
 */
export function _declarationsOf(n: Node): Declaration[] | null;
/**
 * The rules nested in a rule's block, as {@link _declarationsOf} reads them.
 * @param {Node} n node
 * @returns {Rule[] | null} the rules (null without a block)
 */
export function _rulesOf(n: Node): Rule[] | null;
/**
 * @param {Node} n node
 * @returns {boolean} whether a declaration is `!important`
 */
export function _isImportant(n: Node): boolean;
/**
 * A token's value as written (`A.value` resolves its escapes): what the
 * minifier reads to keep the author's spelling.
 * @param {Node} n node
 * @returns {string} the raw value
 */
export function _rawValue(n: Node): string;
export namespace _S {
    export let _valueDeclaration: Node | null;
    export let _inSubstitutedValue: boolean;
    export { _DEFAULT_TRANSFORMS as _transforms };
    export let _inSupportsPrelude: boolean;
    export let _inStyleAttribute: boolean;
    export let _inSupportsSelector: boolean;
    export let _inCustomProperty: boolean;
    export let _steppedFunctionDepth: number;
    export let _mathFunctionDepth: number;
    export let _prefixDropCandidate: {
        node: Node;
        signature: string;
        missing: Set<string> | null;
    } | null;
    export let _currentNode: Node;
    export let _keywordOnlyFor: Node | null;
    export let _rewriteCustomProperties: boolean;
    export let _openCustomValue: {
        printed: string;
        source: string;
    } | null;
    export let _eofPrinted: string;
    export let _eofOpen: string;
    export let _input: string;
    export let _inMediaConditionPrelude: boolean;
    export let _hexAlphaAllowed: boolean;
    export let _inColorOperand: boolean;
    export let _rangeSpellingAllowed: boolean;
    export let _inPropertyRule: boolean;
    export let _inFunctionRule: boolean;
    export let _inFeatureValuesRule: boolean;
    export let _prefixingOn: boolean;
    export let _isSelectorAllowed: boolean;
    export let _namespacePrologueOpen: boolean;
    export let _openCommentStart: number;
    export let _customMediaAllowed: boolean;
    export let _customAtRulesFixed: boolean;
    export let _doublePositionAllowed: boolean;
    export let _systemUiAllowed: boolean;
    export { ABSOLUTE_UNIT_SCALE as _unitScale };
    export let _convertLengthUnits: boolean;
    export let _keywordOnly: boolean;
    export let _deferEmbeddedSource: DeferredEmbeddedSource[] | undefined;
    export let _loweringNesting: boolean;
    export let _displayTwoValuesAllowed: boolean;
    export let _loweringLightDark: boolean;
    export let _lightDarkUsed: boolean;
    export let _charsetPiece: number;
    export let _assumeUtf8: boolean;
    export let _renderEmbeddedSource: EmbeddedSourceRenderer | undefined;
    export let _sourceNamesLightDark: boolean;
}
/**
 * What the CSS printer may be told, on top of the `mode` every language has —
 * the printing slice of `CssProcessOptions`, named once so nothing outside CSS
 * has to enumerate it.
 * @typedef {Pick<CssProcessOptions, "environment" | "declareCharset" | "charset" | "convertLengthUnits" | "convertApproximateColors" | "dropOverriddenDeclarations" | "mergeDistantRules" | "rewriteCustomProperties" | "renderEmbeddedSource" | "deferEmbeddedSource" | "transforms" | "unusedSymbols" | "pseudoClasses">} CssPrintOptions
 */
/** @typedef {import("../util/SourceProcessor").PrintContext<CssPath, Node, CssPrintOptions>} PrintContext */
export const _SEP: " ";
/**
 * @param {string[]} parts a condition's printed parts, in place
 * @returns {void}
 */
export function _keepKeywordComments(parts: string[]): void;
export const _TRIM_COMBINATORS: 1;
export const _TRIM_CONDITIONS: 2;
export const _TRIM_MATH: 3;
export const _TRIM_NOTHING: 0;
export const _TRIM_SEPARATORS: 4;
export const _UNREADABLE_COLOR_CALL_RE: RegExp;
export const _ZERO_LENGTH_RE: RegExp;
/**
 * The shortest `<alpha-value>` naming one of the 256 bytes a hex alpha spells.
 * The engine quantizes the channel to 8 bits, so any decimal that rounds back to
 * the same byte is the same color — `.5` for `80`. Every byte round-trips at
 * three decimals or fewer, so the search always ends. `255` is not one of them:
 * an opaque color is written without an alpha at all, so both callers take that
 * path before reaching here.
 * @param {number} a alpha 0..254
 * @returns {string} the alpha text
 */
export function _alphaByteText(a: number): string;
/**
 * Whether any of a block's children carries a list a join left concatenated.
 * @param {RuleEntry[]} joined the joined block's children
 * @returns {boolean} true when one of them is still to settle
 */
export function _anyUnordered(joined: RuleEntry[]): boolean;
/**
 * The CSS path: the AST accessor with the walk's
 * current position on it — the single argument every visitor receives.
 * @typedef {typeof A} CssPath
 */
/** @typedef {1 | 2 | 3 | 4} CssListField a list `Field` */
/** @typedef {1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22} CssComponentValueType a component value's `NodeType` */
/**
 * CSS's parts by node type, which type each visitor's path; every CSS `Field`
 * is a list.
 * @typedef {{
 * types: CssNodeType,
 * field: CssListField,
 * flag: typeof Flag.important | typeof Flag.integer | typeof Flag.id,
 * part: 1 | 2 | 3,
 * text: never,
 * fields: { 1: never, 2: 2, 3: never, 4: never, 5: never, 6: never, 7: never, 8: never, 9: never, 10: never, 11: never, 12: never, 13: never, 14: never, 15: never, 16: never, 17: never, 18: never, 19: never, 20: never, 21: never, 22: 2, 23: 2, 24: 1 | 3 | 4, 25: 1 | 3 | 4, 26: 4, 27: never, 28: never },
 * flags: { 1: never, 2: never, 3: never, 4: typeof Flag.id, 5: never, 6: never, 7: never, 8: never, 9: never, 10: typeof Flag.integer, 11: typeof Flag.integer, 12: typeof Flag.integer, 13: never, 14: never, 15: never, 16: never, 17: never, 18: never, 19: never, 20: never, 21: never, 22: never, 23: typeof Flag.important, 24: never, 25: never, 26: never, 27: never, 28: never },
 * parts: { 1: never, 2: typeof Part.name, 3: never, 4: never, 5: never, 6: never, 7: typeof Part.value, 8: never, 9: never, 10: never, 11: never, 12: typeof Part.name, 13: never, 14: never, 15: never, 16: never, 17: never, 18: never, 19: never, 20: never, 21: never, 22: never, 23: typeof Part.name, 24: typeof Part.name | typeof Part.block, 25: typeof Part.block, 26: never, 27: never, 28: never },
 * texts: { 1: never, 2: never, 3: never, 4: never, 5: never, 6: never, 7: never, 8: never, 9: never, 10: never, 11: never, 12: never, 13: never, 14: never, 15: never, 16: never, 17: never, 18: never, 19: never, 20: never, 21: never, 22: never, 23: never, 24: never, 25: never, 26: never, 27: never, 28: never },
 * items: { [field: number]: number, 1: CssComponentValueType, 2: CssComponentValueType, 3: 23, 4: 24 | 25 },
 * }} CssParts
 */
/**
 * The path a visitor of node type `T` receives, with the run's state `S`.
 * @template [T=number]
 * @template [S=unknown]
 * @typedef {import("../util/SourceProcessor").TypedNodePath<CssPath, Node, CssParts, T, S>} CssNodePath
 */
/**
 * A visitor map whose each visitor's path is typed by its node type and run state.
 * @template [S=unknown]
 * @typedef {{
 * 1?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<1, S>>,
 * 2?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<2, S>>,
 * 3?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<3, S>>,
 * 4?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<4, S>>,
 * 5?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<5, S>>,
 * 6?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<6, S>>,
 * 7?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<7, S>>,
 * 8?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<8, S>>,
 * 9?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<9, S>>,
 * 10?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<10, S>>,
 * 11?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<11, S>>,
 * 12?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<12, S>>,
 * 13?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<13, S>>,
 * 14?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<14, S>>,
 * 15?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<15, S>>,
 * 16?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<16, S>>,
 * 17?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<17, S>>,
 * 18?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<18, S>>,
 * 19?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<19, S>>,
 * 20?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<20, S>>,
 * 21?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<21, S>>,
 * 22?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<22, S>>,
 * 23?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<23, S>>,
 * 24?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<24, S>>,
 * 25?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<25, S>>,
 * 26?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<26, S>>,
 * 27?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<27, S>>,
 * 28?: import("../util/SourceProcessor").VisitorBucket<CssNodePath<28, S>>,
 * }} CssVisitorMap
 */
/** @typedef {(typeof NodeType)[keyof typeof NodeType]} CssNodeType a `NodeType` member */
/**
 * Append the printed text of every child of `n` to `out`, in order — read where
 * the child list lies rather than materialized into a list of its own first.
 * @param {Node} n the node
 * @param {PrintContext} writer the print context (children's printed text)
 * @param {string[]} out the array to append to
 */
export function _appendChildTexts(n: Node, writer: PrintContext, out: string[]): void;
/**
 * Fold an at-keyword's source spelling to the name the tokenizer read it as, so
 * a name written with escapes is looked up as the one it spells. Unescaping
 * comes first because `asciiLowercaseName` refuses a name still carrying one.
 * @param {string} raw the name as written, the `@` excluded
 * @returns {string} the name a table is looked up by
 */
export function _atKeyword(raw: string): string;
/** @type {BlockSpans[]} */
export const _blockSpans: BlockSpans[];
/**
 * Text the input ran out inside, closed where the tokenizer and parser closed it
 * (§4.3, §5.4): its last token's terminator, then each block and function still
 * open, innermost first. Printed as written instead, the next byte the printer
 * writes — a `;` or the rule's `}` — would be read as part of what was left open.
 * @param {string} text source text that runs to the end of the input
 * @returns {string} the text with what it left open closed
 */
export function _closeAtEof(text: string): string;
/**
 * Drop the box values CSS's `{1,4}` notation already implies: an omitted value
 * is copied from the opposite side, so a 4th equal to the 2nd, a 3rd equal to
 * the 1st and a 2nd equal to the 1st are each redundant.
 * @param {string[]} values one box's components
 * @returns {string[] | null} the kept values, or `null` when the box cannot be collapsed
 */
export function _collapseBox(values: string[]): string[] | null;
/**
 * Put one declaration list together: the list-wide transforms (merge a family's
 * longhands into their shorthand, drop what a later declaration supersedes, add
 * and drop vendor prefixes, join adjacent rules) and the body text they make.
 * A rule's block and a whole `block-contents` parse are the same production, so
 * both go through here — what differs is only what is written around the body.
 * @param {CssPath} path the walk's accessors
 * @param {Declaration[]} decls the list's declarations
 * @param {Rule[] | null} rules the rules interleaved with them, if any
 * @param {PrintContext} writer the print context holding each node's text
 * @param {boolean} minify whether to run the transforms
 * @param {string} nl what prefixes each item: nothing minifying, a line break beautifying (declarations end in `;`, rules don't)
 * @param {Node | null} owner the block this is the body of, or null at top level
 * @param {boolean=} unusedRule whether `unusedSymbols` marked this block's rule, so nothing in it is written
 * @returns {{ body: string, items: Node[], texts: string[], superseded: Set<number> | null, droppedPrefix: Set<number> | null, addedPrefix: Map<number, string> | null, deadPrefixed: Set<Node> | null, spans: RuleSpan[] | null }} the body, and what went into it
 */
export function _composeBlockBody(path: CssPath, decls: Declaration[], rules: Rule[] | null, writer: PrintContext, minify: boolean, nl: string, owner: Node | null, unusedRule?: boolean | undefined): {
    body: string;
    items: Node[];
    texts: string[];
    superseded: Set<number> | null;
    droppedPrefix: Set<number> | null;
    addedPrefix: Map<number, string> | null;
    deadPrefixed: Set<Node> | null;
    spans: RuleSpan[] | null;
};
/**
 * Each `@custom-media` name -> the query it stands for, as printed.
 * @type {Map<string, string>}
 */
export const _customMedia: Map<string, string>;
/**
 * A custom property's value, token for token: every token is written back as
 * written, and a run of whitespace and dropped comments between two of them is
 * one boundary — the space they need, or nothing where a comma or a block edge
 * is already one, which leaves every `var()` the same token stream.
 * @param {CssPath} path the accessor positioned on the declaration
 * @param {Node} node the declaration, function or block whose tokens are printed
 * @param {PrintContext} writer the print context (holds the kept comments)
 * @param {number} from source offset the tokens start at
 * @param {number} to source offset they end at
 * @returns {string} the printed value
 */
export function _customPropertyValue(path: CssPath, node: Node, writer: PrintContext, from: number, to: number): string;
/**
 * Each `@custom-selector` name taken down so far, to the selector list it
 * stands for, in the order the rules were written.
 * @type {Map<string, string>}
 */
export const _customSelectors: Map<string, string>;
/**
 * Drop each component of a family shorthand that holds its own slot's initial —
 * a slot nothing writes takes that value anyway, so writing it says nothing.
 * Where every slot holds its own, one of them says all of them.
 *
 * `_familySlots` is what decides which slot a component fills, so a value it
 * cannot part unambiguously is one this leaves alone — and with it every value
 * naming a slot twice, which the engine drops whole.
 * @param {string} property the declaration's lowercased property name
 * @param {string[]} components the value's top-level components
 * @returns {string[] | null} the fragments to join, or `null` to keep the value
 */
export function _dropFamilyInitials(property: string, components: string[]): string[] | null;
/**
 * Drop the universal selector a compound already implies (`*:before` is
 * `:before`), in the printed parts, in place. `*` carries no specificity and
 * matches every element, so a qualified compound means the same without it —
 * except before a featureless pseudo-class, which no element with features
 * matches.
 * @param {string[]} parts the prelude's printed parts
 * @returns {void}
 */
export function _dropImpliedUniversalSelector(parts: string[]): void;
/**
 * Drop a zero length's unit. Only a whole component: anything inside `calc()`
 * or a `var()` fallback stays, since there a bare `0` is a `<number>` and the
 * expression would stop parsing. `_dropZeroLengthUnitInCall` reaches into the
 * calls where it is a length instead.
 * @param {string} fragment one printed top-level component
 * @returns {string} the component, its zero unit dropped
 */
export function _dropZeroLengthUnit(fragment: string): string;
/**
 * Evaluate a tokenized expression into `key -> coefficient`, the sum CSS Values
 * 4 §10.11 reduces a calculation to.
 * @param {{ type: string, value: number, unit: string }[]} tokens the tokens
 * @param {{ at: number }} cursor the read position, carried through the recursion
 * @returns {Map<string, number> | null} the sum, or `null` when it cannot be evaluated exactly
 */
export function _evaluateCalcSum(tokens: {
    type: string;
    value: number;
    unit: string;
}[], cursor: {
    at: number;
}): Map<string, number> | null;
/**
 * Fold a selector's pseudo names to lowercase and drop the redundant colon of a
 * CSS2 pseudo-element, in one pass over the printed parts: both read the part
 * after a `:`, and the fold is what the legacy name is then matched against.
 * Empty parts are stepped over — a comment between the colons printed away, and
 * the tokenizer had already dropped it anyway.
 * @param {string[]} parts the prelude's printed parts
 * @returns {boolean} whether a pseudo it read may be an `:is()` for `_unwrapLoneIs`
 */
export function _foldPseudoNames(parts: string[]): boolean;
/**
 * Unwrap each `:is()` holding one compound, which matches the same elements with
 * the same specificity. Only where the targets read every pseudo it names, since
 * `:is()` forgives an argument it cannot parse and a bare compound does not.
 * @param {string[]} parts a selector's printed parts, rewritten in place, called only where `_foldPseudoNames` read a pseudo that may be an `:is()`
 */
export function _unwrapLoneIs(parts: string[]): void;
/**
 * Whether a value contains a substitution function such as `var()` or `env()`,
 * so its tokens are not what the engine will see there.
 * @param {string} text the text to look in
 * @returns {boolean} true when a substitution may stand in it
 */
export function containsSubstitutionFunction(text: string): boolean;
/**
 * {@link containsSubstitutionFunction} over a span of the input, which is cut out only once
 * the span turns out to hold a `(` at all.
 * @param {number} from the span's start offset
 * @param {number} to the span's end offset
 * @returns {boolean} true when a substitution may stand in it
 */
export function _hasSubstitutionInSpan(from: number, to: number): boolean;
/**
 * Add one held twin to its signature's list, made on first use. A block may
 * write several prefixed spellings of the same rule, and one twin kills them all.
 * @template T
 * @param {Map<string, T[]>} held every held twin, by signature
 * @param {string} signature the rule's sibling signature
 * @param {T} value the piece index or node to hold
 * @returns {void}
 */
export function _holdBySignature<T>(held: Map<string, T[]>, signature: string, value: T): void;
/**
 * Note that a piece was taken back, where a top-level prefixed rule went out as it.
 * @param {number} piece the piece taken back
 * @returns {void}
 */
export function _noteRetractedPiece(piece: number): void;
/**
 * Whether a channel lands a hair off a byte's half, where the precision an engine
 * computes it at picks the byte. An exact half is not one: it rounds up anywhere.
 * @param {number} channel the channel, on the 0..255 scale
 * @returns {boolean} true when engines may round it apart
 */
export function _nearByteHalf(channel: number): boolean;
/**
 * Whether a string token closed with its own quote rather than running to EOF.
 * §4.3.5 ends an unterminated string at EOF, so its text has no closing quote
 * and `slice(1, -1)` would drop a real character (`_minifyString` and
 * `_minifyUrlFunction` refuse to rewrite one for the same reason).
 * @param {string} text a string token's text
 * @returns {boolean} true when the string is closed
 */
export function _isClosedString(text: string): boolean;
/**
 * A digit (CSS Syntax §4.2): U+0030 to U+0039.
 * @param {number} cc char code
 * @returns {boolean} true, if cc is a digit
 */
export function isDigit(cc: number): boolean;
/**
 * A hex digit (CSS Syntax §4.2): a digit, or A to F in either case.
 * @param {number} cc char code
 * @returns {boolean} true, if cc is a hex digit
 */
export function isHexDigit(cc: number): boolean;
/**
 * @param {number} cc char code
 * @returns {boolean} true, if cc is an ident-sequence code point
 */
export function _isIdentCodePoint(cc: number): boolean;
/**
 * An ident code point (CSS Syntax §4.2): an ident-start code point, a digit or
 * `-`. The lookup table only spans ASCII, so non-ASCII is answered here.
 * @param {number} cc a code point
 * @returns {boolean} true when `cc` is an ident code point
 */
export function isIdentCodePoint(cc: number): boolean;
/**
 * An ident-start code point (CSS Syntax §4.2): a letter, a non-ASCII code
 * point or `_`.
 * @param {number} cc char code
 * @returns {boolean} true, if cc is an ident-start code point
 */
export function isIdentStartCodePoint(cc: number): boolean;
/**
 * A letter (CSS Syntax §4.2): A to Z in either case.
 * @param {number} cc char code
 * @returns {boolean} is letter (a-z / A-Z)
 */
export function isLetter(cc: number): boolean;
/**
 * The `url()` counterpart of `_isClosedString`: §4.3.6 ends a url-token at EOF, so
 * it has no closing `)` and the printer's next byte would land inside it.
 * @param {string} raw the url-token's source text
 * @returns {boolean} true when the `)` is absent or itself escaped
 */
export function _isUnterminatedUrl(raw: string): boolean;
/**
 * Join sibling fragments (a prelude / value / args / block body), resolving each
 * `_SEP` marker into a single space kept only where dropping it would merge two
 * tokens (minifying) or unconditionally (beautifying). `trim` additionally drops
 * whitespace next to the code points that carry their own meaning in this
 * context — a selector's combinators, a query condition's comparisons.
 * Fragments that had no separator at all still get one where concatenating them
 * would fuse two tokens into one (see {@link _wouldFuseTokens}).
 * @param {string[]} parts printed fragments in source order
 * @param {boolean} beautify whether every separator is kept
 * @param {number=} trim one of the `_TRIM_*` modes (default `_TRIM_NOTHING`)
 * @returns {string} the joined text
 */
export function _join(parts: string[], beautify: boolean, trim?: number | undefined): string;
/**
 * Lowercase the pseudo-class and pseudo-element names in a selector's printed
 * parts, in place: the name after a `:` matches ASCII case-insensitively, while
 * a type selector's does not (`linearGradient` is an SVG element) and neither
 * does an id, a class or an attribute's value. A functional pseudo prints as one
 * token and lowercases its own name, its argument being the author's.
 * @param {string[]} parts the prelude's printed parts
 * @returns {void}
 */
/**
 * Lowercase the names in a media condition's printed parts, in place: a feature
 * name, a media type, the keywords between them and a dimension's unit all match
 * ASCII case-insensitively. A custom media query's `--name` does not, and a
 * string or a nested function (a style query) carries text no such rule covers.
 * @param {string[]} parts the condition's printed parts
 * @returns {void}
 */
export function _lowercaseConditionParts(parts: string[]): void;
/**
 * Minify an `rgb()` / `rgba()` color function to the shortest opaque form. Only
 * rgb/rgba (exact integer / percent math); returns null for anything else —
 * a different function, non-numeric args, or a partly-transparent alpha —
 * leaving it as its normalized function form. Transparent black collapses to the
 * `transparent` keyword (identical value, universally supported, shorter). hsl is
 * intentionally not converted: its hue math can round to a different byte, which
 * would change the color.
 * @param {string} fn the lowercased function name
 * @param {string} inner the already-joined argument text
 * @param {boolean} hexAlpha whether the target reads a 4-/8-digit hex (see `output.environment`)
 * @param {boolean} operand whether the color is read as numbers here, which only an exact conversion survives
 * @returns {string | null} the shortest color, or null to keep the function
 */
export function _minifyColorFunction(fn: string, inner: string, hexAlpha: boolean, operand: boolean): string | null;
/**
 * Minify `hsl()` / `hwb()` / `lab()` / `lch()` / `oklab()` / `oklch()` to the
 * shortest hex.
 *
 * Two guards keep the rewrite from changing the color. A channel landing within
 * `_ROUNDING_MARGIN` of a `.5` boundary keeps the function, because that is the
 * only place implementations disagree — it is why esbuild and lightningcss emit
 * different bytes for `hwb(194 0% 0%)`. And a Lab-family color outside the sRGB
 * gamut keeps its function too: hex cannot express it, so converting would clip
 * it to a different color. Both are limitations, not correctness gaps, and
 * `convertApproximateColors` lifts them: the first to the byte other minifiers
 * write anyway, the second past where any of them goes.
 *
 * Both guards are about *replacing* the function. A fallback stands before the
 * function rather than in its place, so it is only ever read by an engine with
 * no better answer: `forFallback` clamps into the gamut and takes whichever byte
 * rounding picks, and writes an `rgba()` where the target has no hex alpha.
 * @param {string} fn the lowercased function name
 * @param {string} inner the already-joined argument text
 * @param {boolean} hexAlpha whether the target reads a 4-/8-digit hex (see `output.environment`)
 * @param {boolean=} forFallback whether this is the fallback for a function the target cannot read, rather than a replacement for one it can
 * @returns {string | null} the shortest color, or null to keep the function
 */
export function _minifyPolarColorFunction(fn: string, inner: string, hexAlpha: boolean, forFallback?: boolean | undefined): string | null;
/**
 * The vendor spellings at least one target browser still needs for a construct —
 * a target at version V needs spelling S when some `[browser, from, to]` of S has
 * `from <= V < to`. Null when not minifying for a target (leave prefixes alone),
 * the construct is never prefixed, or no target needs any of its spellings.
 * @param {Map<string, [string, number][]>} table its axis' prefix table
 * @param {string} name the construct name (unprefixed, lowercased)
 * @returns {Set<string> | null} the needed spellings, or null
 */
export function _neededPrefixes(table: Map<string, [string, number][]>, name: string): Set<string> | null;
/**
 * Write a number spelled with an exponent the shortest exact way: plainly where
 * that is no longer (`0.2e2`→`20`), else on an integer mantissa (`10E3`→`1e4`).
 * An exponent makes a `<number>`, never an `<integer>` (§4.3.12), so where that
 * is read `keepNumberType` keeps a spelling that is still not an integer.
 * @param {string} num numeric text with an exponent (may carry a sign)
 * @param {boolean} keepNumberType whether an integer spelling is ruled out
 * @returns {string} the normalized number
 */
export function _normalizeExponent(num: string, keepNumberType: boolean): string;
/**
 * Normalize a numeric string (no unit): drop a leading zero (`0.5`→`.5`) and
 * trailing fractional zeros (`1.50`→`1.5`, `1.0`→`1`). Value-preserving;
 * scientific notation is left untouched.
 * @param {string} num numeric text (may carry a sign)
 * @returns {string} the normalized number
 */
export function _normalizeNumber(num: string): string;
/** @type {(text: string) => RuleEntry} */
export const _opaqueEntry: (text: string) => RuleEntry;
/**
 * What an opener contributes to the key the rules under it are read by. The
 * name is compared unescaped, since `@l\61yer {` opens one of these too.
 * @param {string} opener the block's prelude, its `{` included
 * @returns {string} the opener, or a token no other occurrence shares
 */
export function _openerKey(opener: string): string;
/**
 * Rules taken out of the one they were written in, innermost first, each still
 * naming its parent with `&`. `owner` is the rule they are now written against,
 * which is the only one that drains them — siblings share it, and taking an
 * earlier sibling's would write it against the wrong parent.
 * `apart` marks one a prefix copy wrote, which is written as a rule of its own:
 * a selector an engine cannot read takes the whole list with it.
 * @type {{ prelude: string, rest: string, owner: Node | null, apart?: boolean }[]}
 */
export const _pendingNested: {
    prelude: string;
    rest: string;
    owner: Node | null;
    apart?: boolean;
}[];
/**
 * Whether a present vendor-spelled construct is dead weight: its spelling is one
 * the table knows for the base construct and no target browser needs it, so an
 * unprefixed sibling already covers every target.
 * @param {Map<string, [string, number][]>} table its axis' prefix table
 * @param {string} base the unprefixed construct name
 * @param {string} spelling the vendor spelling found in its place
 * @returns {boolean} true when the vendor-spelled construct can be dropped
 */
export function _prefixRemovable(table: Map<string, [string, number][]>, base: string, spelling: string): boolean;
/**
 * What a block's rules have shown so far: the signatures met (`seen`), and the
 * prefixed ones an unprefixed twin would make dead — as an output piece the
 * writer can take back (`retractable`, for a rule written straight out), or as
 * the node itself (`pending`, for a rule whose parent still has to assemble it).
 * @typedef {object} PrefixScope
 * @property {Set<string>} seen the signatures met, and the `signature\0prefix`
 * markers of the prefixed spellings among them
 * @property {Map<string, number[]> | null} retractable each dead-if-twinned
 * rule's piece index, by the signature of the twin that would make it dead
 * @property {Map<string, Node[]> | null} pending each dead-if-twinned nested
 * rule, by that same signature
 * @property {Set<Node> | null} dead the nested rules a twin has since made dead,
 * read by their parent as it assembles its body
 * @property {{ missing: Set<string>, piece: number, node: Node | null }[] | null}
 * covering each prefixed list still short of a twin for some of its selectors,
 * with the signatures it is still waiting for
 */
/**
 * The rules already met in the block a rule sits in, made on first use.
 * @param {Node | null} parent the block's rule, null for the stylesheet itself
 * @returns {PrefixScope} the block's running sibling state
 */
export function _prefixScope(parent: Node | null): PrefixScope;
/**
 * Round a numeric string to `_SIGNIFICANT_DIGITS`, or return it unchanged when
 * rounding would not shorten it (or would leave the range the measurement
 * covers). Scientific notation is left alone — `toPrecision` may produce it, and
 * an exponent is not shorter here anyway.
 * @param {string} num the normalized numeric text
 * @param {string=} unit its lowercased unit, where a scaled length keeps more digits
 * @returns {string} the rounded number, or `num`
 */
export function _roundSignificant(num: string, unit?: string | undefined): string;
/**
 * Whether every target reads a `<position>` property's lone edge keyword, which
 * an older engine took only as one of a pair. No selection reads everything.
 * @param {string} property the declaration's lowercased property name
 * @param {string} keyword the edge keyword
 * @returns {boolean} true when the keyword alone may stand for the position
 */
export function _edgeKeywordRead(property: string, keyword: string): boolean;
/**
 * A selector list is a set: the same selectors in any order match the same
 * elements at the same specificity, so a repeat inside it says nothing and one
 * canonical order lets equal lists compress alike. Only ever the author's own
 * list — a join seam concatenates, so a run of them stays linear.
 * @param {string} prelude the printed selector list
 * @returns {string} it, or `prelude` when nothing there is shorter
 */
export function _canonicalSelectorList(prelude: string): string;
/**
 * A node's entry, or an opaque one where the text it printed is not the text the
 * block ended up carrying.
 * @param {Node} node a block item
 * @param {string} text the text the block carries for it
 * @returns {RuleEntry} its entry
 */
export function _ruleEntryOf(node: Node, text: string): RuleEntry;
/**
 * A rule's prelude: everything before its `{`, which depends on nothing but the
 * prelude itself. Split out of the printer so a rule whose block is streamed can
 * print its opener when the block opens, long before the block's children exist.
 * @param {CssPath} path the accessor positioned on the rule
 * @param {PrintContext} writer the print context
 * @param {boolean} minify whether printing minified
 * @param {string[]=} outParts filled with the prelude's tokens, for prefixing
 * @returns {string} the rule's prelude text
 */
export function _rulePrelude(path: CssPath, writer: PrintContext, minify: boolean, outParts?: string[] | undefined): string;
/**
 * @param {Node} node a printed rule
 * @param {RuleEntry} entry its entry
 * @returns {void}
 */
export function _setRuleEntry(node: Node, entry: RuleEntry): void;
/**
 * @param {Node} node a rule whose text is several rules
 * @param {RuleEntry[]} runs an entry per rule, in the order the text holds them
 * @returns {void}
 */
export function _setHoistedRuns(node: Node, runs: RuleEntry[]): void;
/**
 * The shortest opaque color text for (r, g, b): a named color where one is
 * shorter than the hex (`RGB_TO_NAME` holds only those), else a collapsed 3-hex
 * or a 6-hex.
 * @param {number} r red 0..255
 * @param {number} g green 0..255
 * @param {number} b blue 0..255
 * @returns {string} the shortest form
 */
export function _shortestColor(r: number, g: number, b: number): string;
/**
 * The shortest spelling of a three-factor `flex` value, or `null` when it is
 * already the shortest. Shared with the merge, which arrives at the same three
 * factors from the longhands rather than from an authored shorthand.
 * @param {string[]} components the value's components, in grammar order
 * @returns {string[] | null} the fragments to join, or `null` to keep them as they are
 */
export function _shortestFlexValue(components: string[]): string[] | null;
/**
 * The shortest spelling of an authored `flex` value in whatever order and count
 * its grammar allows, or `null` when what was written is already that short.
 * @param {string[]} components the value's components, as written
 * @returns {string[] | null} the fragments to join, or `null` to keep them as they are
 */
export function _shortestAuthoredFlex(components: string[]): string[] | null;
/**
 * Join a merged shorthand's slots the way the printer joins any two fragments:
 * a separator only where leaving it out would fuse the tokens either side, so
 * the merge writes what the same value authored by hand would print as.
 * @param {string[]} slots the values the shorthand spells, in order
 * @returns {string} the value they spell
 */
export function _joinSlots(slots: string[]): string;
/**
 * The components of a printed value, where the print may have left out the
 * separator between two of them: `underline solid #fff` prints as
 * `underline solid#fff`, an ident and a hash being two tokens whatever stands
 * between them. Whitespace parts two components, and so does any junction the
 * print could have left bare — at the top level a component is one token or one
 * call, so a junction inside one is inside its parentheses.
 * @param {string} text a printed value
 * @returns {string[]} its top-level components
 */
export function _splitPrintedComponents(text: string): string[];
/**
 * Whether the target reads every slot of a shorthand, so one holding its own
 * initial can come out. A `text-decoration` slot the target does not read is
 * one the engine drops the whole declaration for.
 * @param {string} property the shorthand's lowercased property name
 * @returns {boolean} true when an initial slot may be dropped
 */
export function _shorthandSlotsReadable(property: string): boolean;
/**
 * Split a selector list at the commas that separate its selectors. A comma
 * inside `:is(…)`, an attribute value or a string belongs to one selector.
 * @param {string} prelude the printed selector list
 * @returns {string[]} the selectors, in written order
 */
export function _splitSelectorList(prelude: string): string[];
/**
 * Split on the commas at the top of a function body, so a nested call's own
 * arguments stay in the piece that holds it.
 * @param {string} text the body between one call's parentheses
 * @returns {string[]} its arguments, still as written
 */
export function _splitTopLevelArguments(text: string): string[];
/**
 * Split on the whitespace at the top of one value, a nested call's own spaces
 * staying inside it.
 * @param {string} text one comma-separated piece of a call's body
 * @returns {string[]} its components
 */
export function _splitTopLevelSpaces(text: string): string[];
export namespace _stream {
    let writer: PrintContext | undefined;
}
/**
 * Whether a rule is one `unusedSymbols` marked — its selectors all name an
 * unused symbol, or it is an `@keyframes` under an unused name. Reading the
 * mark clears it: a finished rule's node goes back to the pool, and a mark left
 * on it would land on whatever is built over it next.
 * @param {Node} rule the rule
 * @returns {boolean} true when it is to be dropped
 */
export function _takeUnusedRule(rule: Node): boolean;
/**
 * Write a token's terminator back. A `\` left dangling at EOF has to be replaced
 * rather than kept: kept, it would escape the terminator and leave the token open
 * on exactly the input this repairs. What it stands for differs by token — nothing
 * in a string (§4.3.5), U+FFFD in a url (§4.3.6 reads it as an escape, §4.3.7 ends
 * one at EOF with the replacement character).
 * @param {string} raw the token's source text, missing its terminator
 * @param {string} terminator the character that closes it
 * @param {string} dangling what a `\` left at EOF contributed to the token's value
 * @returns {string} the terminated token
 */
export function _terminate(raw: string, terminator: string, dangling: string): string;
/**
 * Tokenize one printed `calc()` body.
 * @param {string} text the body
 * @returns {{ type: string, value: number, unit: string }[] | null} the tokens, or `null` when something here is not arithmetic
 */
export function _tokenizeCalc(text: string): {
    type: string;
    value: number;
    unit: string;
}[] | null;
/**
 * Whether a color function is one some target does not read, so a declaration
 * naming it needs a fallback before it — and a fallback still naming one is no
 * fallback. Only the names `_FALLBACK_COLOR_FUNCTION_RE` and
 * `_UNREADABLE_COLOR_CALL_RE` match reach here.
 * @param {string} fn the lowercased function name
 * @returns {boolean} true when the target cannot read it
 */
export function _unreadableColorFunction(fn: string): boolean;
/**
 * The value classes a printed component could be read as, for deciding which
 * slot of an order-free shorthand would claim it. Only the classes those slots
 * name, which the generator asserts is this list; anything else — a function
 * other than `url()`, an escape, a substitution — is `null`, which declines the
 * merge rather than guessing a slot.
 * @param {string} value one printed component
 * @param {string} lower the same, lowercased
 * @returns {Set<string> | null} the classes, or `null` when unclassifiable
 */
export function _valueClasses(value: string, lower: string): Set<string> | null;
/**
 * Split a declaration value into its top-level components. Whitespace parts
 * them, and so does a `/` delim — it separates `border-radius`'s two boxes and
 * needs no whitespace of its own. A comment is no tree node, so the gap it
 * leaves between two children parts them too: it ends both tokens, and a
 * rewritten value joins its components with a space that has to stand where
 * the comment did.
 * @param {CssPath} path the accessor positioned on the declaration
 * @param {Node} node the declaration whose value's children are read
 * @param {PrintContext} writer the print context (children's printed text)
 * @returns {string[]} the components, with a `/` delim as its own entry
 */
export function _valueComponents(path: CssPath, node: Node, writer: PrintContext): string[];
/**
 * A name CSS matches ASCII case-insensitively — a property, at-keyword,
 * function, pseudo, media feature or unit — written lowercase, so the same name
 * is the same bytes wherever it is spelled. Only ASCII letters map, the matching
 * being ASCII-only; a name carrying an escape is written back as authored, since
 * `\G` and `\g` name different characters.
 * @param {string} s the name
 * @returns {string} it, lowercased
 */
export function asciiLowercaseName(s: string): string;
/**
 * Build a `SkipOptions.types` set (drop these component-value node types from
 * value / function-arg lists) from a list of `NodeType`s. Preludes are separate
 * (`SkipOptions.selectorPrelude` / `atRulePrelude`). The caller owns the safety
 * contract: only pass types nothing reads in the intended parse. Two
 * grammar-internal caveats beyond consumer needs: dropping both `Delim` and
 * `Ident` loses `!important` detection, and dropping `SimpleBlock` loses the
 * custom-property `{}`-value check (and its subtree). Precompute once per
 * configuration and reuse across parses.
 * @param {number[]} nodeTypes component-value node types to drop
 * @returns {Uint8Array} skip-types set indexed by `NodeType`
 */
export function buildSkipSet(nodeTypes: number[]): Uint8Array;
/**
 * If the source had a CR followed by an LF, advance past the LF —
 * the spec normalises CRLF to LF during preprocessing.
 * @param {number} cc char code already consumed (the CR)
 * @param {string} input input
 * @param {number} pos position just past `cc`
 * @returns {number} position past the CRLF pair (or unchanged for bare CR)
 */
export function consumeExtraNewline(cc: number, input: string, pos: number): number;
/**
 * Infra's ASCII case-insensitive match against a lowercase literal — avoids the
 * `toLowerCase()` allocation and matches CSS's ASCII case-insensitive keyword
 * matching. `lit` must be lowercase ASCII.
 * @param {string} s string to test
 * @param {string} lit lowercase ASCII literal to match
 * @returns {boolean} true, if `s` equals `lit` ignoring ASCII case
 */
export function asciiCaseInsensitiveMatch(s: string, lit: string): boolean;
export const escapeIdentifier: import("../util/identifier").MakeCacheableResult<string> & {
    bindCache: import("../util/identifier").BindCache<string>;
};
/**
 * Write a name the shortest way that still names it: as `escapeIdentifier` does,
 * except that a leading `--` starts an identifier by itself and needs no escape.
 * @param {string} name the name, escapes resolved
 * @returns {string} the name, escaped where it has to be
 */
export function escapeName(name: string): string;
/**
 * The CSS `SourceProcessor` grammar: consume top-level rules one at a time
 * (§5.4.1) and walk each immediately, firing `enter` / `exit` in source order
 * without building a whole-stylesheet array first. `recurseBlocks: false` skips
 * walking block bodies' (eagerly parsed) nested rules (caller drives nested
 * traversal itself). When `writer` is given the same walk also prints: it is
 * threaded down the walk and each node's printer builds its text into it as the
 * node finishes — one parse, no re-tokenization. `skip` is ignored while printing
 * (it needs every node).
 * @param {string} input source text
 * @param {CompiledVisitorMap} visitors compiled visitor map
 * @param {PrintContext | undefined} writer the print context to build output into, or undefined (walk only)
 * @param {CssProcessOptions} options process options
 */
export function grammar(input: string, visitors: CompiledVisitorMap, writer: PrintContext | undefined, options: CssProcessOptions): void;
/**
 * A custom property name (`<dashed-ident>`): a `--`-prefixed identifier other than bare `--`.
 * @param {string} identifier identifier
 * @returns {boolean} true when identifier is dashed, otherwise false
 */
export function isDashedIdentifier(identifier: string): boolean;
/**
 * Whether a string is one plain identifier, as a `@value` must be to name a class, at-rule or JS export.
 * @param {string} value candidate text, already trimmed
 * @returns {boolean} true when the whole string is one unescaped identifier
 */
export function isSimpleIdentifier(value: string): boolean;
/**
 * CSS Syntax §4.2 whitespace (newline, tab, space), the same set as Infra's
 * ASCII whitespace.
 * @param {number} cc char code
 * @returns {boolean} true, if cc is whitespace (space/tab/newline)
 */
export function isAsciiWhitespace(cc: number): boolean;
/**
 * Normalize a url value (a url-token's content or a url string's body) into
 * the form requests are resolved from: escaped newlines removed (string form),
 * edge whitespace trimmed, CSS escapes and percent-encoding decoded
 * (`data:` URIs excepted).
 * @param {string} str url string
 * @param {boolean} isString is url wrapped in quotes
 * @returns {string} normalized url
 */
export function normalizeUrl(str: string, isString: boolean): string;
/**
 * Parse a block's contents, CSS Syntax Level 3
 * [§5.3.6](https://drafts.csswg.org/css-syntax/#parse-block-contents).
 * @param {string | TokenStream} input source string or an existing token stream
 * @param {number=} pos start position (string input only; just past the opening `{`, or 0)
 * @param {ParseOptions=} options optional comment-token callback (string input only)
 * @returns {{ decls: Declaration[], rules: Rule[] }} block decls + rules
 */
export function parseABlocksContents(input: string | TokenStream, pos?: number | undefined, options?: ParseOptions | undefined): {
    decls: Declaration[];
    rules: Rule[];
};
/**
 * Parse a comma-separated list of component values, CSS Syntax Level 3 [§5.3.11](https://drafts.csswg.org/css-syntax/#parse-comma-list) — consumes one `<comma-token>`-stopped group of component values per iteration until EOF.
 * @param {string | TokenStream} input source string or an existing token stream
 * @param {number=} pos start position (string input only)
 * @param {ParseOptions=} options comment callback
 * @returns {ComponentValue[][]} comma-separated groups of component values
 */
export function parseACommaSeparatedListOfComponentValues(input: string | TokenStream, pos?: number | undefined, options?: ParseOptions | undefined): ComponentValue[][];
/**
 * Parse a component value, CSS Syntax Level 3 [§5.3.9](https://drafts.csswg.org/css-syntax/#parse-component-value) — strict entry point that consumes one value and returns `undefined` if non-whitespace input trails (use `consumeAComponentValue` for "one value, ignore the rest").
 * @param {string | TokenStream} input source string or an existing token stream
 * @param {number=} pos start position (string input only)
 * @param {ParseOptions=} options optional comment-token callback (string input only)
 * @returns {ComponentValue | undefined} the parsed component value, or `undefined` on empty / trailing-garbage input
 */
export function parseAComponentValue(input: string | TokenStream, pos?: number | undefined, options?: ParseOptions | undefined): ComponentValue | undefined;
/**
 * Parse a declaration, CSS Syntax Level 3
 * [§5.3.8](https://drafts.csswg.org/css-syntax/#parse-declaration).
 * @param {string | TokenStream} input source string or an existing token stream
 * @param {number=} pos start position (string input only)
 * @param {ParseOptions=} options optional comment-token callback (string input only)
 * @returns {Declaration | undefined} the parsed declaration, or undefined
 */
export function parseADeclaration(input: string | TokenStream, pos?: number | undefined, options?: ParseOptions | undefined): Declaration | undefined;
/**
 * Parse a list of component values, CSS Syntax Level 3
 * [§5.3.10](https://drafts.csswg.org/css-syntax/#parse-list-of-components).
 * @param {string | TokenStream} input source string or an existing token stream
 * @param {number=} pos start position (string input only)
 * @param {ParseOptions=} options comment callback
 * @returns {ComponentValue[]} component values
 */
export function parseAListOfComponentValues(input: string | TokenStream, pos?: number | undefined, options?: ParseOptions | undefined): ComponentValue[];
/**
 * Parse a rule, CSS Syntax Level 3
 * [§5.3.7](https://drafts.csswg.org/css-syntax/#parse-rule) — discards leading
 * whitespace, consumes one at-rule / qualified rule, and requires only trailing
 * whitespace; `undefined` (syntax error) otherwise.
 * @param {string | TokenStream} input source string or an existing token stream
 * @param {number=} pos start position (string input only)
 * @param {ParseOptions=} options optional comment-token callback (string input only)
 * @returns {Rule | undefined} the parsed rule
 */
export function parseARule(input: string | TokenStream, pos?: number | undefined, options?: ParseOptions | undefined): Rule | undefined;
/**
 * Parse a stylesheet, CSS Syntax Level 3
 * [§5.3.4](https://drafts.csswg.org/css-syntax/#parse-stylesheet).
 * @param {string | TokenStream} input source string or an existing token stream
 * @param {number=} pos start position (string input only)
 * @param {ParseOptions=} options optional comment-token callback (string input only)
 * @returns {Stylesheet} the parsed stylesheet
 */
export function parseAStylesheet(input: string | TokenStream, pos?: number | undefined, options?: ParseOptions | undefined): Stylesheet;
/**
 * Parse a stylesheet's contents, CSS Syntax Level 3
 * [§5.3.5](https://drafts.csswg.org/css-syntax/#parse-stylesheets-contents) —
 * the top-level rule list via `consumeAStylesheetsContents` (§5.4.1): top-level
 * declarations are parse errors (never produced) and top-level CDO (`<!--`) /
 * CDC (`-->`) tokens are discarded.
 * @param {string | TokenStream} input source string or an existing token stream
 * @param {number=} pos start position (string input only)
 * @param {ParseOptions=} options optional comment-token callback (string input only)
 * @returns {Rule[]} top-level rules
 */
export function parseAStylesheetsContents(input: string | TokenStream, pos?: number | undefined, options?: ParseOptions | undefined): Rule[];
/**
 * The per-transform switches out of a wider options object — what
 * `optimization.minimize.css` names beside `environment` and the two rewrites
 * that are off until asked for. Exported so the minify functions the minimizer
 * plugin ships to its workers can pick them without repeating the names.
 * @param {CssTransformOptions} options an options object that may carry them
 * @returns {CssTransformOptions | undefined} the switches, or undefined when none is set
 */
export function pickTransforms(options: CssTransformOptions): CssTransformOptions | undefined;
/**
 * Case-sensitive equality of a source range against a literal — no slice.
 * @param {string} input source
 * @param {number} start range start
 * @param {number} end range end (exclusive)
 * @param {string} lit literal to match
 * @returns {boolean} true when the range equals `lit`
 */
export function rangeEquals(input: string, start: number, end: number, lit: string): boolean;
/**
 * ASCII case-insensitive equality of a source range against a lowercase ASCII literal — no slice.
 * @param {string} input source
 * @param {number} start range start
 * @param {number} end range end (exclusive)
 * @param {string} lit lowercase ASCII literal to match
 * @returns {boolean} true when the range equals `lit` ignoring ASCII case
 */
export function rangeAsciiCaseInsensitiveMatch(input: string, start: number, end: number, lit: string): boolean;
/**
 * Read one raw token (comment / whitespace / value token) starting at byte
 * `pos`, writing it into the caller-supplied `out` and returning `out`. The
 * token's `end` is the next read position. Returns `undefined` at end-of-input —
 * `pos >= length`, an unterminated comment, or a string ending on a trailing
 * escape. This is the one tokenizer entry point: `TokenStream#next` reuses a
 * single `out` across calls so the parse hot path allocates no per-token object,
 * while `HtmlGenerator`'s `<style>` scan and the tests loop over it with their
 * own `out`. Comment tokens are returned here; `next` filters them.
 * @param {string} input input
 * @param {number} pos byte offset to read from
 * @param {MutableToken} out token to populate
 * @returns {MutableToken | undefined} the token, or undefined at EOF
 */
export function readToken(input: string, pos: number, out: MutableToken): MutableToken | undefined;
/**
 * CSS Syntax §4.3.7, entered at the `\` so a caller scanning raw source can
 * step over an escape without re-deriving what it spans.
 * @param {string} input input
 * @param {number} pos position of the `\`
 * @returns {number} position past the escape sequence
 */
export function skipEscape(input: string, pos: number): number;
/**
 * `s.toLowerCase()` that returns `s` itself (no allocation) when it can't
 * change — no ASCII uppercase and no non-ASCII (whose Unicode case mapping is
 * left to the real `toLowerCase`).
 * @param {string} s string
 * @returns {string} lowercased string
 */
export function toLowerCaseIfNeeded(s: string): string;
export const unescapeIdentifier: import("../util/identifier").MakeCacheableResult<string> & {
    bindCache: import("../util/identifier").BindCache<string>;
};
import LocConverter = require("../util/LocConverter");
/**
 * A top-level node's text as written out, which later rules cut dead rules from.
 * A cut is recorded against the text the piece last held, so a run of cuts builds
 * the text once, when something reads it, rather than once per cut.
 */
declare class TakenPiece {
    /**
     * @param {number} piece the writer's index for it
     * @param {string} text the text it went out as
     * @param {number} empties its length with every rule it holds cut, less one, or -1
     */
    constructor(piece: number, text: string, empties: number);
    /** @type {number} */
    piece: number;
    /** @type {RuleSpan[]} shared and empty until `_noteSpans` gives it its own */
    spans: RuleSpan[];
    /** @type {number} */
    empties: number;
    /** @type {string} */
    _text: string;
    /** @type {number[] | null} the ranges of `_text` cut since, as sorted start, end pairs */
    _cuts: number[] | null;
    /** @type {number} */
    length: number;
    /**
     * @param {string} value what the piece reads from now on
     */
    set text(value: string);
    /**
     * @returns {string} what the piece reads now
     */
    get text(): string;
    /**
     * @param {number} at an offset in what the piece reads now
     * @returns {number} the code unit there, read without building the text
     */
    charCodeAt(at: number): number;
    /**
     * Take `len` code units out at `from`, offsets in what the piece reads now.
     * @param {number} from where the cut starts
     * @param {number} len how much it takes
     * @returns {void}
     */
    cut(from: number, len: number): void;
    /**
     * @param {number} at an offset in what the piece reads now
     * @returns {number} the same offset in `_text`
     */
    _uncut(at: number): number;
}
/** @type {Required<CssTransformOptions>} */
declare const _DEFAULT_TRANSFORMS: Required<CssTransformOptions>;
import { ABSOLUTE_UNIT_SCALE } from "./data";
export { CC_0 as _CC_0, CC_APOSTROPHE as _CC_APOSTROPHE, CC_COMMA as _CC_COMMA, CC_FULL_STOP as _CC_FULL_STOP, CC_GREATER_THAN_SIGN as _CC_GREATER_THAN_SIGN, CC_HYPHEN_MINUS as _CC_HYPHEN_MINUS, CC_LEFT_PARENTHESIS as _CC_LEFT_PARENTHESIS, CC_LEFT_SQUARE as _CC_LEFT_SQUARE, CC_LOWER_D as _CC_LOWER_D, CC_LOW_LINE as _CC_LOW_LINE, CC_NUMBER_SIGN as _CC_NUMBER_SIGN, CC_PLUS_SIGN as _CC_PLUS_SIGN, CC_QUOTATION_MARK as _CC_QUOTATION_MARK, CC_REVERSE_SOLIDUS as _CC_REVERSE_SOLIDUS, CC_RIGHT_PARENTHESIS as _CC_RIGHT_PARENTHESIS, CC_RIGHT_SQUARE as _CC_RIGHT_SQUARE, CC_SPACE as _CC_SPACE, CC_TILDE as _CC_TILDE, CC_UPPER_A as _CC_UPPER_A, CC_UPPER_Z as _CC_UPPER_Z, LIST_KIND_KEYFRAME as _LIST_KIND_KEYFRAME, LIST_KIND_NESTED as _LIST_KIND_NESTED, LIST_KIND_SELECTOR as _LIST_KIND_SELECTOR, LIST_NO as _LIST_NO, LIST_UNKNOWN as _LIST_UNKNOWN, setVerbatimLeafPrinter as _setVerbatimLeafPrinter };
