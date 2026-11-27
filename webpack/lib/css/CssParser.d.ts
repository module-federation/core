export = CssParser;
/**
 * @extends {Parser<BuiltCssModule>}
 */
declare class CssParser extends Parser<CssModule.BuiltCssModule> {
    /**
     * Creates an instance of CssParser.
     * @param {CssParserOptions=} options options
     */
    constructor(options?: CssParserOptions | undefined);
    defaultMode: "local" | "auto" | "global" | "pure";
    options: {
        animation: import("../../declarations/WebpackOptions").CssParserAnimation;
        as: string;
        container: import("../../declarations/WebpackOptions").CssParserContainer;
        customIdents: import("../../declarations/WebpackOptions").CssParserCustomIdents;
        customMedia: import("../../declarations/WebpackOptions").CssParserCustomMedia;
        customSelectors: import("../../declarations/WebpackOptions").CssParserCustomSelectors;
        dashedIdents: import("../../declarations/WebpackOptions").CssParserDashedIdents;
        exportType?: import("../../declarations/WebpackOptions").CssParserExportType;
        fontPreload?: import("../../declarations/WebpackOptions").CssParserFontPreload;
        function: import("../../declarations/WebpackOptions").CssParserFunction;
        grid: import("../../declarations/WebpackOptions").CssParserGrid;
        import: import("../../declarations/WebpackOptions").CssParserImport;
        namedExports: import("../../declarations/WebpackOptions").CssParserNamedExports;
        pure?: import("../../declarations/WebpackOptions").CssParserPure;
        url: import("../../declarations/WebpackOptions").CssParserUrl;
        urlHints?: import("../../declarations/WebpackOptions").UrlHints;
        /**
         * default mode
         */
        defaultMode?: ("pure" | "global" | "local" | "auto") | undefined;
    };
    magicCommentContext: import("node:vm").Context;
    /**
     * Processes the provided state.
     * @param {ParserState} state parser state
     * @param {string} message warning message
     * @param {LocConverter} locConverter location converter
     * @param {number} start start offset
     * @param {number} end end offset
     */
    _emitWarning(state: Parser.ParserState, message: string, locConverter: LocConverter, start: number, end: number): void;
    /**
     * Emits a build error for the provided range.
     * @param {ParserState} state parser state
     * @param {string} message error message
     * @param {LocConverter} locConverter location converter
     * @param {number} start start offset
     * @param {number} end end offset
     */
    _emitError(state: Parser.ParserState, message: string, locConverter: LocConverter, start: number, end: number): void;
    /**
     * Arbitrate cross-kind CSS-Modules export collisions collected during
     * parsing. A class always wins the shared JS export key over the
     * CSS-only kinds (`@keyframes`, `@counter-style`, `@container`, custom
     * property, grid identifier) — matching css-loader / lightning css /
     * postcss-modules; the loser's `EXPORT_MODE` is demoted to `NONE` so
     * the CSS-side rewrite is preserved but the entry no longer contributes
     * to `styles.<name>`. Other pairs (`class` ↔ `id`,
     * `class` ↔ `:export`, `class` ↔ `@value`, kind-vs-kind without a
     * class present, …) surface as a warning so the user resolves the name
     * themselves. Same-kind redeclarations are silent.
     * @param {ParserState} state parser state
     * @param {Map<string, { kind: string, line: number, column: number, entries: number[] }[]>} declaredExports collected declarations grouped by (name, kind)
     * @param {import("../dependencies/css/CssIcssExportDependency").CssExportEntry[]} cssExportEntries all export entries — losers are demoted in place
     * @returns {void}
     */
    _resolveAmbiguousExports(state: Parser.ParserState, declaredExports: Map<string, {
        kind: string;
        line: number;
        column: number;
        entries: number[];
    }[]>, cssExportEntries: import("../dependencies/css/CssIcssExportDependency").CssExportEntry[]): void;
}
declare namespace CssParser {
    export { Range, Position, ValueAtRuleImport, ValueAtRuleValue, CustomMediaValue, CustomMediaQuery, CustomMediaDefinition, CustomMediaUse, MediaSlot, MediaNode, Comment, CssParserOwnOptions, CssParserOptions, ImportPrelude };
}
import type CssModule from "./CssModule";
import Parser = require("../module/Parser");
import LocConverter = require("../util/LocConverter");
type Range = [number, number];
type Position = {
    line: number;
    column: number;
};
type ValueAtRuleImport = {
    from: string;
    items: ({
        localName: string;
        importName: string;
    })[];
};
type ValueAtRuleValue = {
    localName: string;
    value: string;
};
/**
 * What a `@custom-media` name resolves to. `condition` substitutes into any
 * `<media-in-parens>` slot, `type` only at the start of a query, `boolean` is the
 * spec's `true` / `false` (folded into the enclosing query rather than written
 * out — no `<media-in-parens>` is unconditionally true on every engine).
 */
type CustomMediaValue = {
    kind: "condition" | "type";
    text: string;
} | {
    kind: "boolean";
    value: boolean;
} | {
    kind: "unsupported";
};
type CustomMediaQuery = {
    node: MediaNode;
    uses: CustomMediaUse[];
};
type CustomMediaDefinition = CustomMediaValue | {
    kind: "alias";
    name: string;
} | {
    kind: "or";
    parts: ({
        text: string;
    } | {
        alias: string;
    } | {
        query: CustomMediaQuery;
    })[];
} | ({
    kind: "query";
} & CustomMediaQuery);
/**
 * One `(--name)` a `@media` prelude or a `@custom-media` value asks for. `slot`
 * is what the condition written there joins: nothing, an `and`, or `not` / `or`.
 */
type CustomMediaUse = {
    name: string;
    start: number;
    end: number;
    invalid: boolean;
    leading: boolean;
    slot: MediaSlot;
};
type MediaSlot = "alone" | "and" | "or";
/**
 * A `@media` prelude captured as its boolean shape, so a `true` / `false`
 * definition found later can be folded into it. Node ids are recycled per
 * top-level rule, so this holds text and offsets rather than AST nodes.
 */
type MediaNode = {
    kind: "text";
    text: string;
} | {
    kind: "ref";
    text: string;
    use: CustomMediaUse;
} | {
    kind: "group";
    operand: MediaNode;
} | {
    kind: "not";
    operand: MediaNode;
} | {
    kind: "chain";
    isOr: boolean;
    terms: MediaNode[];
} | {
    kind: "typed";
    text: string;
    rest: MediaNode | null;
};
type Comment = {
    value: string;
    range: Range;
};
/**
 * Defines the css parser own options type used by this module.
 */
type CssParserOwnOptions = {
    /**
     * default mode
     */
    defaultMode?: ("pure" | "global" | "local" | "auto") | undefined;
};
type CssParserOptions = CssAutoOrModuleParserOptions & CssParserOwnOptions;
type ImportPrelude = {
    urlNode: (AstNode | undefined);
    layerNode: (AstNode | undefined);
    supportsNode: (FunctionNode | undefined);
};
import type { CssAutoOrModuleParserOptions } from "../../declarations/WebpackOptions";
import type { Node as AstNode } from "./syntax-parser";
import type { FunctionNode } from "./syntax-parser";
