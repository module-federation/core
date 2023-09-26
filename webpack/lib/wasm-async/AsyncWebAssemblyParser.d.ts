export = WebAssemblyParser;
declare class WebAssemblyParser extends Parser {
  /**
   * @param {{}=} options parser options
   */
  constructor(options?: {} | undefined);
  hooks: Readonly<{}>;
  options: {};
}
declare namespace WebAssemblyParser {
  export { BuildInfo, BuildMeta, ParserState, PreparsedAst };
}
import Parser = require('../Parser');
type BuildInfo = import('../Module').BuildInfo;
type BuildMeta = import('../Module').BuildMeta;
type ParserState = import('../Parser').ParserState;
type PreparsedAst = import('../Parser').PreparsedAst;
