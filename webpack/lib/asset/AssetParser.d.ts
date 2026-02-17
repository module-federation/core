export = AssetParser;
/** @typedef {import("../../declarations/WebpackOptions").AssetParserDataUrlOptions} AssetParserDataUrlOptions */
/** @typedef {import("../../declarations/WebpackOptions").AssetParserOptions} AssetParserOptions */
/** @typedef {import("../Module").BuildInfo} BuildInfo */
/** @typedef {import("../Module").BuildMeta} BuildMeta */
/** @typedef {import("../Parser").ParserState} ParserState */
/** @typedef {import("../Parser").PreparsedAst} PreparsedAst */
declare class AssetParser extends Parser {
  /**
   * @param {AssetParserOptions["dataUrlCondition"] | boolean} dataUrlCondition condition for inlining as DataUrl
   */
  constructor(
    dataUrlCondition: AssetParserOptions['dataUrlCondition'] | boolean,
  );
  dataUrlCondition:
    | boolean
    | import('../../declarations/WebpackOptions').AssetParserDataUrlOptions
    | import('../../declarations/WebpackOptions').AssetParserDataUrlFunction;
}
declare namespace AssetParser {
  export {
    AssetParserDataUrlOptions,
    AssetParserOptions,
    BuildInfo,
    BuildMeta,
    ParserState,
    PreparsedAst,
  };
}
import Parser = require('../Parser');
type AssetParserOptions =
  import('../../declarations/WebpackOptions').AssetParserOptions;
type AssetParserDataUrlOptions =
  import('../../declarations/WebpackOptions').AssetParserDataUrlOptions;
type BuildInfo = import('../Module').BuildInfo;
type BuildMeta = import('../Module').BuildMeta;
type ParserState = import('../Parser').ParserState;
type PreparsedAst = import('../Parser').PreparsedAst;
