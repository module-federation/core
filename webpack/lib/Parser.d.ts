export = Parser;
/** @typedef {import("./config/defaults").WebpackOptionsNormalizedWithDefaults} WebpackOptions */
/** @typedef {import("./Compilation")} Compilation */
/** @typedef {import("./NormalModule")} NormalModule */
/** @typedef {Record<string, EXPECTED_ANY>} PreparsedAst */
/**
 * @typedef {object} ParserStateBase
 * @property {string | Buffer} source
 * @property {NormalModule} current
 * @property {NormalModule} module
 * @property {Compilation} compilation
 * @property {WebpackOptions} options
 */
/** @typedef {ParserStateBase & Record<string, EXPECTED_ANY>} ParserState */
declare class Parser {
    /**
     * @abstract
     * @param {string | Buffer | PreparsedAst} source the source to parse
     * @param {ParserState} state the parser state
     * @returns {ParserState} the parser state
     */
    parse(source: string | Buffer | PreparsedAst, state: ParserState): ParserState;
}
declare namespace Parser {
    export { WebpackOptions, Compilation, NormalModule, PreparsedAst, ParserStateBase, ParserState };
}
type WebpackOptions = import("./config/defaults").WebpackOptionsNormalizedWithDefaults;
type Compilation = import("./Compilation");
type NormalModule = import("./NormalModule");
type PreparsedAst = Record<string, EXPECTED_ANY>;
type ParserStateBase = {
    source: string | Buffer;
    current: NormalModule;
    module: NormalModule;
    compilation: Compilation;
    options: WebpackOptions;
};
type ParserState = ParserStateBase & Record<string, EXPECTED_ANY>;
