export function addLocalModule(state: JavascriptParserState, name: string): LocalModule;
export function getLocalModule(state: JavascriptParserState, name: string, namedModule?: string | undefined): LocalModule | null;
import type { JavascriptParserState } from "../../javascript/JavascriptParser";
import LocalModule = require("./LocalModule");
