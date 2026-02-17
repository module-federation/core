export = CssParser;
declare class CssParser extends Parser {
  constructor({
    allowModeSwitch,
    defaultMode,
  }?: {
    allowModeSwitch?: boolean;
    defaultMode?: string;
  });
  allowModeSwitch: boolean;
  defaultMode: string;
  /**
   * @param {ParserState} state parser state
   * @param {string} message warning message
   * @param {LocConverter} locConverter location converter
   * @param {number} start start offset
   * @param {number} end end offset
   */
  _emitWarning(
    state: ParserState,
    message: string,
    locConverter: LocConverter,
    start: number,
    end: number,
  ): void;
}
declare namespace CssParser {
  export { ParserState, PreparsedAst, Range };
}
import Parser = require('../Parser');
type ParserState = import('../Parser').ParserState;
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
type PreparsedAst = import('../Parser').PreparsedAst;
type Range = [number, number];
