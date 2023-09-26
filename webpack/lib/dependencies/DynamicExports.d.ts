export function bailout(parserState: ParserState): void;
export function enable(parserState: ParserState): void;
export function setFlagged(parserState: ParserState): void;
export function setDynamic(parserState: ParserState): void;
export function isEnabled(parserState: ParserState): boolean;
export type BuildMeta = import('../Module').BuildMeta;
export type ParserState = import('../Parser').ParserState;
