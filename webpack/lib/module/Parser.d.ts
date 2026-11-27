export = Parser;
/**
 * @import {
 * 	WebpackOptionsNormalizedWithDefaults as WebpackOptions
 * } from "../config/defaults"
 */
/** @import Compilation from "../Compilation" */
/** @import NormalModule from "./NormalModule" */
/** @typedef {Record<string, EXPECTED_ANY>} PreparsedAst */
/**
 * Defines the parser state base type used by this module.
 * @template {NormalModule} [TModule=NormalModule]
 * @typedef {object} ParserStateBase
 * @property {string | Buffer} source
 * @property {NormalModule} current
 * @property {TModule} module the module being parsed
 * @property {Compilation} compilation
 * @property {WebpackOptions} options
 */
/**
 * @template {NormalModule} [TModule=NormalModule]
 * @typedef {ParserStateBase<TModule> & Record<string, EXPECTED_ANY>} ParserState
 */
/**
 * @template {NormalModule} [TModule=NormalModule] the module class this parser parses
 */
declare class Parser<TModule extends NormalModule = NormalModule> {
    /**
     * Parses the provided source and updates the parser state.
     * @abstract
     * @param {string | Buffer | PreparsedAst} source the source to parse
     * @param {ParserState} state the parser state
     * @returns {ParserState} the parser state
     */
    parse(source: string | Buffer | PreparsedAst, state: ParserState): ParserState;
}
declare namespace Parser {
    export { PreparsedAst, ParserStateBase, ParserState };
}
import type NormalModule from "./NormalModule";
type PreparsedAst = Record<string, EXPECTED_ANY>;
/**
 * Defines the parser state base type used by this module.
 */
type ParserStateBase<TModule extends NormalModule = NormalModule> = {
    source: string | Buffer;
    current: NormalModule;
    /**
     * the module being parsed
     */
    module: TModule;
    compilation: Compilation;
    options: WebpackOptions;
};
type ParserState<TModule extends NormalModule = NormalModule> = ParserStateBase<TModule> & Record<string, EXPECTED_ANY>;
import type Compilation from "../Compilation";
import type { WebpackOptionsNormalizedWithDefaults as WebpackOptions } from "../config/defaults";
