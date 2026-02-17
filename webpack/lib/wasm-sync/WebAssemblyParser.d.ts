export = WebAssemblyParser;
declare class WebAssemblyParser extends Parser {
}
declare namespace WebAssemblyParser {
    export { ModuleImport, BuildInfo, BuildMeta, ParserState, PreparsedAst };
}
import Parser = require("../Parser");
type ModuleImport = any;
type BuildInfo = import("../Module").BuildInfo;
type BuildMeta = import("../Module").BuildMeta;
type ParserState = import("../Parser").ParserState;
type PreparsedAst = import("../Parser").PreparsedAst;
