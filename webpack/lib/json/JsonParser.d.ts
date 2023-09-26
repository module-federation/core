export = JsonParser;
declare class JsonParser extends Parser {
  /**
   * @param {JsonModulesPluginParserOptions} options parser options
   */
  constructor(options: JsonModulesPluginParserOptions);
  options: import('../../declarations/plugins/JsonModulesPluginParser').JsonModulesPluginParserOptions;
}
declare namespace JsonParser {
  export {
    JsonModulesPluginParserOptions,
    BuildInfo,
    BuildMeta,
    ParserState,
    PreparsedAst,
    RawJsonData,
  };
}
import Parser = require('../Parser');
type JsonModulesPluginParserOptions =
  import('../../declarations/plugins/JsonModulesPluginParser').JsonModulesPluginParserOptions;
type BuildInfo = import('../Module').BuildInfo;
type BuildMeta = import('../Module').BuildMeta;
type ParserState = import('../Parser').ParserState;
type PreparsedAst = import('../Parser').PreparsedAst;
type RawJsonData = import('./JsonModulesPlugin').RawJsonData;
