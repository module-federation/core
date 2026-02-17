declare namespace _exports {
  export { CssTokenCallbacks, CharHandler };
}
declare function _exports(
  input: string,
  pos?: number | undefined,
  callbacks?: CssTokenCallbacks | undefined,
): number;
declare namespace _exports {
  export { consumeUntil };
  export { eatComments };
  export { eatIdentSequence };
  export { eatIdentSequenceOrString };
  export { eatImageSetStrings };
  export { eatImportTokens };
  export { eatString };
  export { eatUntil };
  export { eatWhiteLine };
  export { eatWhitespace };
  export { eatWhitespaceAndComments };
  export { isIdentStartCodePoint };
  export { _isWhiteSpace as isWhiteSpace };
  export { skipCommentsAndEatIdentSequence };
}
export = _exports;
type CssTokenCallbacks = {
  url?:
    | ((
        input: string,
        start: number,
        end: number,
        innerStart: number,
        innerEnd: number,
      ) => number)
    | undefined;
  comment?: ((input: string, start: number, end: number) => number) | undefined;
  string?: ((input: string, start: number, end: number) => number) | undefined;
  leftCurlyBracket?:
    | ((input: string, start: number, end: number) => number)
    | undefined;
  rightCurlyBracket?:
    | ((input: string, start: number, end: number) => number)
    | undefined;
  leftParenthesis?:
    | ((input: string, start: number, end: number) => number)
    | undefined;
  rightParenthesis?:
    | ((input: string, start: number, end: number) => number)
    | undefined;
  leftSquareBracket?:
    | ((input: string, start: number, end: number) => number)
    | undefined;
  rightSquareBracket?:
    | ((input: string, start: number, end: number) => number)
    | undefined;
  function?:
    | ((input: string, start: number, end: number) => number)
    | undefined;
  colon?: ((input: string, start: number, end: number) => number) | undefined;
  atKeyword?:
    | ((input: string, start: number, end: number) => number)
    | undefined;
  delim?: ((input: string, start: number, end: number) => number) | undefined;
  identifier?:
    | ((input: string, start: number, end: number) => number)
    | undefined;
  hash?:
    | ((input: string, start: number, end: number, isId: boolean) => number)
    | undefined;
  semicolon?:
    | ((input: string, start: number, end: number) => number)
    | undefined;
  comma?: ((input: string, start: number, end: number) => number) | undefined;
  needTerminate?: (() => boolean) | undefined;
};
type CharHandler = (
  input: string,
  pos: number,
  callbacks: CssTokenCallbacks,
) => number;
/**
 * @param {string} input input css
 * @param {number} pos pos
 * @param {CssTokenCallbacks} callbacks callbacks
 * @param {CssTokenCallbacks=} additional additional callbacks
 * @param {{ onlyTopLevel?: boolean, declarationValue?: boolean, atRulePrelude?: boolean, functionValue?: boolean }=} options options
 * @returns {number} pos
 */
declare function consumeUntil(
  input: string,
  pos: number,
  callbacks: CssTokenCallbacks,
  additional?: CssTokenCallbacks | undefined,
  options?:
    | {
        onlyTopLevel?: boolean;
        declarationValue?: boolean;
        atRulePrelude?: boolean;
        functionValue?: boolean;
      }
    | undefined,
): number;
/**
 * @param {string} input input
 * @param {number} pos position
 * @returns {number} position after comments
 */
declare function eatComments(input: string, pos: number): number;
/**
 * @param {string} input input
 * @param {number} pos position
 * @returns {[number, number] | undefined} positions of ident sequence
 */
declare function eatIdentSequence(
  input: string,
  pos: number,
): [number, number] | undefined;
/**
 * @param {string} input input
 * @param {number} pos position
 * @returns {[number, number, boolean] | undefined} positions of ident sequence or string
 */
declare function eatIdentSequenceOrString(
  input: string,
  pos: number,
): [number, number, boolean] | undefined;
/**
 * @param {string} input input
 * @param {number} pos position
 * @param {CssTokenCallbacks} cbs callbacks
 * @returns {[number, number][]} positions of ident sequence
 */
declare function eatImageSetStrings(
  input: string,
  pos: number,
  cbs: CssTokenCallbacks,
): [number, number][];
/**
 * @param {string} input input
 * @param {number} pos position
 * @param {CssTokenCallbacks} cbs callbacks
 * @returns {[[number, number, number, number] | undefined, [number, number] | undefined, [number, number] | undefined, [number, number] | undefined]} positions of top level tokens
 */
declare function eatImportTokens(
  input: string,
  pos: number,
  cbs: CssTokenCallbacks,
): [
  [number, number, number, number] | undefined,
  [number, number] | undefined,
  [number, number] | undefined,
  [number, number] | undefined,
];
/**
 * @param {string} input input
 * @param {number} pos position
 * @returns {[number, number] | undefined} positions of ident sequence
 */
declare function eatString(
  input: string,
  pos: number,
): [number, number] | undefined;
/**
 * @param {string} chars characters
 * @returns {(input: string, pos: number) => number} function to eat characters
 */
declare function eatUntil(
  chars: string,
): (input: string, pos: number) => number;
/**
 * @param {string} input input
 * @param {number} pos position
 * @returns {number} position after whitespace
 */
declare function eatWhiteLine(input: string, pos: number): number;
/**
 * @param {string} input input
 * @param {number} pos position
 * @returns {number} position after whitespace
 */
declare function eatWhitespace(input: string, pos: number): number;
/**
 * @param {string} input input
 * @param {number} pos position
 * @returns {[number, boolean]} position after whitespace and comments
 */
declare function eatWhitespaceAndComments(
  input: string,
  pos: number,
): [number, boolean];
/**
 * ident-start code point
 *
 * A letter, a non-ASCII code point, or U+005F LOW LINE (_).
 * @param {number} cc char code
 * @returns {boolean} true, if cc is a start code point of an identifier
 */
declare function isIdentStartCodePoint(cc: number): boolean;
/**
 * @param {number} cc char code
 * @returns {boolean} true, if cc is a whitespace
 */
declare function _isWhiteSpace(cc: number): boolean;
/**
 * @param {string} input input
 * @param {number} pos position
 * @returns {[number, number] | undefined} positions of ident sequence
 */
declare function skipCommentsAndEatIdentSequence(
  input: string,
  pos: number,
): [number, number] | undefined;
