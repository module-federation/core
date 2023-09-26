export function addLocalModule(state: ParserState, name: string): LocalModule;
export function getLocalModule(
  state: ParserState,
  name: string,
  namedModule?: string,
): LocalModule | null;
export type ParserState = import('../javascript/JavascriptParser').ParserState;
import LocalModule = require('./LocalModule');
