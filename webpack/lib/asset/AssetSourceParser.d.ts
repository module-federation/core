export = AssetSourceParser;
/** @typedef {import("../Module").BuildInfo} BuildInfo */
/** @typedef {import("../Module").BuildMeta} BuildMeta */
/** @typedef {import("../Parser").ParserState} ParserState */
/** @typedef {import("../Parser").PreparsedAst} PreparsedAst */
declare class AssetSourceParser extends Parser {}
declare namespace AssetSourceParser {
  export { BuildInfo, BuildMeta, ParserState, PreparsedAst };
}
import Parser = require('../Parser');
type BuildInfo = import('../Module').BuildInfo;
type BuildMeta = import('../Module').BuildMeta;
type ParserState = import('../Parser').ParserState;
type PreparsedAst = import('../Parser').PreparsedAst;
