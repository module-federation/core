export function bailout(parserState: JavascriptParserState): void;
export function enable(parserState: JavascriptParserState): void;
export function isEnabled(parserState: JavascriptParserState): boolean;
export function setDynamic(parserState: JavascriptParserState): void;
export function setFlagged(parserState: JavascriptParserState): void;
export type BuildMeta = import("../Module").BuildMeta;
export type JavascriptParserState = import("../javascript/JavascriptParser").JavascriptParserState;
