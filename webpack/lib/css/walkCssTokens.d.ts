declare function _exports(input: string, callbacks: CssTokenCallbacks): void;
declare namespace _exports {
  export { isIdentStartCodePoint };
  export function eatComments(input: string, pos: number): number;
  export function eatWhitespace(input: string, pos: number): number;
  export function eatWhitespaceAndComments(input: string, pos: number): number;
  export function eatWhiteLine(input: string, pos: number): number;
  export { CssTokenCallbacks, CharHandler };
}
export = _exports;
export type CssTokenCallbacks = {
  isSelector?: ((arg0: string, arg1: number) => boolean) | undefined;
  url?:
    | ((
        arg0: string,
        arg1: number,
        arg2: number,
        arg3: number,
        arg4: number,
      ) => number)
    | undefined;
  string?: ((arg0: string, arg1: number, arg2: number) => number) | undefined;
  leftParenthesis?:
    | ((arg0: string, arg1: number, arg2: number) => number)
    | undefined;
  rightParenthesis?:
    | ((arg0: string, arg1: number, arg2: number) => number)
    | undefined;
  pseudoFunction?:
    | ((arg0: string, arg1: number, arg2: number) => number)
    | undefined;
  function?: ((arg0: string, arg1: number, arg2: number) => number) | undefined;
  pseudoClass?:
    | ((arg0: string, arg1: number, arg2: number) => number)
    | undefined;
  atKeyword?:
    | ((arg0: string, arg1: number, arg2: number) => number)
    | undefined;
  class?: ((arg0: string, arg1: number, arg2: number) => number) | undefined;
  identifier?:
    | ((arg0: string, arg1: number, arg2: number) => number)
    | undefined;
  id?: ((arg0: string, arg1: number, arg2: number) => number) | undefined;
  leftCurlyBracket?:
    | ((arg0: string, arg1: number, arg2: number) => number)
    | undefined;
  rightCurlyBracket?:
    | ((arg0: string, arg1: number, arg2: number) => number)
    | undefined;
  semicolon?:
    | ((arg0: string, arg1: number, arg2: number) => number)
    | undefined;
  comma?: ((arg0: string, arg1: number, arg2: number) => number) | undefined;
};
export type CharHandler = (
  arg0: string,
  arg1: number,
  arg2: CssTokenCallbacks,
) => number;
/**
 * ident-start code point
 *
 * A letter, a non-ASCII code point, or U+005F LOW LINE (_).
 *
 * @param {number} cc char code
 * @returns {boolean} true, if cc is a start code point of an identifier
 */
declare function isIdentStartCodePoint(cc: number): boolean;
