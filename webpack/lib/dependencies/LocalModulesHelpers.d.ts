export function addLocalModule(state: JavascriptParserState, name: string): LocalModule;
export function getLocalModule(state: JavascriptParserState, name: string, namedModule?: string | undefined): LocalModule | null;
export type JavascriptParserState = import("../javascript/JavascriptParser").JavascriptParserState;
import LocalModule = require("./LocalModule");
