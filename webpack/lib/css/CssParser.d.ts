export = CssParser;
/**
 * @typedef {object} CssParserOwnOptions
 * @property {("pure" | "global" | "local" | "auto")=} defaultMode default mode
 */
/** @typedef {CssModuleParserOptions & CssParserOwnOptions} CssParserOptions */
declare class CssParser extends Parser {
    /**
     * @param {CssParserOptions=} options options
     */
    constructor(options?: CssParserOptions | undefined);
    defaultMode: "global" | "auto" | "pure" | "local";
    options: {
        animation: import("../../declarations/WebpackOptions").CssParserAnimation;
        container: import("../../declarations/WebpackOptions").CssParserContainer;
        customIdents: import("../../declarations/WebpackOptions").CssParserCustomIdents;
        dashedIdents: import("../../declarations/WebpackOptions").CssParserDashedIdents;
        exportType?: import("../../declarations/WebpackOptions").CssParserExportType;
        function: import("../../declarations/WebpackOptions").CssParserFunction;
        grid: import("../../declarations/WebpackOptions").CssParserGrid;
        import: import("../../declarations/WebpackOptions").CssParserImport;
        namedExports: import("../../declarations/WebpackOptions").CssParserNamedExports;
        url: import("../../declarations/WebpackOptions").CssParserUrl;
        /**
         * default mode
         */
        defaultMode?: ("pure" | "global" | "local" | "auto") | undefined;
    };
    /** @type {Comment[] | undefined} */
    comments: Comment[] | undefined;
    magicCommentContext: vm.Context;
    /**
     * @param {ParserState} state parser state
     * @param {string} message warning message
     * @param {LocConverter} locConverter location converter
     * @param {number} start start offset
     * @param {number} end end offset
     */
    _emitWarning(state: ParserState, message: string, locConverter: LocConverter, start: number, end: number): void;
    /**
     * @param {Range} range range
     * @returns {Comment[]} comments in the range
     */
    getComments(range: Range): Comment[];
    /**
     * @param {Range} range range of the comment
     * @returns {{ options: Record<string, EXPECTED_ANY> | null, errors: (Error & { comment: Comment })[] | null }} result
     */
    parseCommentOptions(range: Range): {
        options: Record<string, EXPECTED_ANY> | null;
        errors: (Error & {
            comment: Comment;
        })[] | null;
    };
}
declare namespace CssParser {
    export { escapeIdentifier, unescapeIdentifier, BuildInfo, BuildMeta, ParserState, PreparsedAst, CssTokenCallbacks, CssModuleParserOptions, Range, Position, Comment, CssParserOwnOptions, CssParserOptions };
}
import Parser = require("../Parser");
import vm = require("vm");
declare class LocConverter {
    /**
     * @param {string} input input
     */
    constructor(input: string);
    _input: string;
    line: number;
    column: number;
    pos: number;
    /**
     * @param {number} pos position
     * @returns {LocConverter} location converter
     */
    get(pos: number): LocConverter;
}
/**
 * @param {string} str string
 * @returns {string} escaped identifier
 */
declare function escapeIdentifier(str: string): string;
/**
 * @param {string} str string
 * @returns {string} unescaped string
 */
declare function unescapeIdentifier(str: string): string;
type BuildInfo = import("../Module").BuildInfo;
type BuildMeta = import("../Module").BuildMeta;
type ParserState = import("../Parser").ParserState;
type PreparsedAst = import("../Parser").PreparsedAst;
type CssTokenCallbacks = import("./walkCssTokens").CssTokenCallbacks;
type CssModuleParserOptions = import("../../declarations/WebpackOptions").CssModuleParserOptions;
type Range = [number, number];
type Position = {
    line: number;
    column: number;
};
type Comment = {
    value: string;
    range: Range;
    loc: {
        start: Position;
        end: Position;
    };
};
type CssParserOwnOptions = {
    /**
     * default mode
     */
    defaultMode?: ("pure" | "global" | "local" | "auto") | undefined;
};
type CssParserOptions = CssModuleParserOptions & CssParserOwnOptions;
