export = Parser;
/** @typedef {import("./Compilation")} Compilation */
/** @typedef {import("./NormalModule")} NormalModule */
/** @typedef {Record<string, any>} PreparsedAst */
/**
 * @typedef {Object} ParserStateBase
 * @property {string | Buffer} source
 * @property {NormalModule} current
 * @property {NormalModule} module
 * @property {Compilation} compilation
 * @property {{[k: string]: any}} options
 */
/** @typedef {Record<string, any> & ParserStateBase} ParserState */
declare class Parser {
  /**
   * @abstract
   * @param {string | Buffer | PreparsedAst} source the source to parse
   * @param {ParserState} state the parser state
   * @returns {ParserState} the parser state
   */
  parse(
    source: string | Buffer | PreparsedAst,
    state: ParserState,
  ): ParserState;
}
declare namespace Parser {
  export {
    Compilation,
    NormalModule,
    PreparsedAst,
    ParserStateBase,
    ParserState,
  };
}
type PreparsedAst = Record<string, any>;
type ParserState = Record<string, any> & ParserStateBase;
type Compilation = import('./Compilation');
type NormalModule = import('./NormalModule');
type ParserStateBase = {
  source: string | Buffer;
  current: NormalModule;
  module: NormalModule;
  compilation: Compilation;
  options: {
    [k: string]: any;
  };
};
