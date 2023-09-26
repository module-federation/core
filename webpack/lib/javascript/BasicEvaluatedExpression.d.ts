export = BasicEvaluatedExpression;
declare class BasicEvaluatedExpression {
  type: number;
  /** @type {[number, number] | undefined} */
  range: [number, number] | undefined;
  /** @type {boolean} */
  falsy: boolean;
  /** @type {boolean} */
  truthy: boolean;
  /** @type {boolean | undefined} */
  nullish: boolean | undefined;
  /** @type {boolean} */
  sideEffects: boolean;
  /** @type {boolean | undefined} */
  bool: boolean | undefined;
  /** @type {number | undefined} */
  number: number | undefined;
  /** @type {bigint | undefined} */
  bigint: bigint | undefined;
  /** @type {RegExp | undefined} */
  regExp: RegExp | undefined;
  /** @type {string | undefined} */
  string: string | undefined;
  /** @type {BasicEvaluatedExpression[] | undefined} */
  quasis: BasicEvaluatedExpression[] | undefined;
  /** @type {BasicEvaluatedExpression[] | undefined} */
  parts: BasicEvaluatedExpression[] | undefined;
  /** @type {any[] | undefined} */
  array: any[] | undefined;
  /** @type {BasicEvaluatedExpression[] | undefined} */
  items: BasicEvaluatedExpression[] | undefined;
  /** @type {BasicEvaluatedExpression[] | undefined} */
  options: BasicEvaluatedExpression[] | undefined;
  /** @type {BasicEvaluatedExpression | undefined | null} */
  prefix: BasicEvaluatedExpression | undefined | null;
  /** @type {BasicEvaluatedExpression | undefined | null} */
  postfix: BasicEvaluatedExpression | undefined | null;
  /** @type {BasicEvaluatedExpression[] | undefined} */
  wrappedInnerExpressions: BasicEvaluatedExpression[] | undefined;
  /** @type {string | VariableInfoInterface | undefined} */
  identifier: string | VariableInfoInterface | undefined;
  /** @type {string | VariableInfoInterface | undefined} */
  rootInfo: string | VariableInfoInterface | undefined;
  /** @type {(() => string[]) | undefined} */
  getMembers: () => string[];
  /** @type {(() => boolean[]) | undefined} */
  getMembersOptionals: () => boolean[];
  /** @type {(() => Range[]) | undefined} */
  getMemberRanges: () => import('./JavascriptParser').Range[];
  /** @type {Node | undefined} */
  expression: Node | undefined;
  isUnknown(): boolean;
  isNull(): boolean;
  isUndefined(): boolean;
  isString(): boolean;
  isNumber(): boolean;
  isBigInt(): boolean;
  isBoolean(): boolean;
  isRegExp(): boolean;
  isConditional(): boolean;
  isArray(): boolean;
  isConstArray(): boolean;
  isIdentifier(): boolean;
  isWrapped(): boolean;
  isTemplateString(): boolean;
  /**
   * Is expression a primitive or an object type value?
   * @returns {boolean | undefined} true: primitive type, false: object type, undefined: unknown/runtime-defined
   */
  isPrimitiveType(): boolean | undefined;
  /**
   * Is expression a runtime or compile-time value?
   * @returns {boolean} true: compile time value, false: runtime value
   */
  isCompileTimeValue(): boolean;
  /**
   * Gets the compile-time value of the expression
   * @returns {any} the javascript value
   */
  asCompileTimeValue(): any;
  isTruthy(): boolean;
  isFalsy(): boolean;
  isNullish(): boolean;
  /**
   * Can this expression have side effects?
   * @returns {boolean} false: never has side effects
   */
  couldHaveSideEffects(): boolean;
  /**
   * Creates a boolean representation of this evaluated expression.
   * @returns {boolean | undefined} true: truthy, false: falsy, undefined: unknown
   */
  asBool(): boolean | undefined;
  /**
   * Creates a nullish coalescing representation of this evaluated expression.
   * @returns {boolean | undefined} true: nullish, false: not nullish, undefined: unknown
   */
  asNullish(): boolean | undefined;
  /**
   * Creates a string representation of this evaluated expression.
   * @returns {string | undefined} the string representation or undefined if not possible
   */
  asString(): string | undefined;
  /**
   * @param {string} string value
   * @returns {BasicEvaluatedExpression} basic evaluated expression
   */
  setString(string: string): BasicEvaluatedExpression;
  setUndefined(): this;
  setNull(): this;
  /**
   * Set's the value of this expression to a number
   * @param {number} number number to set
   * @returns {this} this
   */
  setNumber(number: number): this;
  /**
   * Set's the value of this expression to a BigInt
   * @param {bigint} bigint bigint to set
   * @returns {this} this
   */
  setBigInt(bigint: bigint): this;
  /**
   * Set's the value of this expression to a boolean
   * @param {boolean} bool boolean to set
   * @returns {this} this
   */
  setBoolean(bool: boolean): this;
  /**
   * Set's the value of this expression to a regular expression
   * @param {RegExp} regExp regular expression to set
   * @returns {this} this
   */
  setRegExp(regExp: RegExp): this;
  /**
   * Set's the value of this expression to a particular identifier and its members.
   *
   * @param {string | VariableInfoInterface} identifier identifier to set
   * @param {string | VariableInfoInterface} rootInfo root info
   * @param {() => string[]} getMembers members
   * @param {() => boolean[]=} getMembersOptionals optional members
   * @param {() => Range[]=} getMemberRanges ranges of progressively increasing sub-expressions
   * @returns {this} this
   */
  setIdentifier(
    identifier: string | VariableInfoInterface,
    rootInfo: string | VariableInfoInterface,
    getMembers: () => string[],
    getMembersOptionals?: () => boolean[],
    getMemberRanges?: () => import('./JavascriptParser').Range[],
  ): this;
  /**
   * Wraps an array of expressions with a prefix and postfix expression.
   *
   * @param {BasicEvaluatedExpression | null | undefined} prefix Expression to be added before the innerExpressions
   * @param {BasicEvaluatedExpression | null | undefined} postfix Expression to be added after the innerExpressions
   * @param {BasicEvaluatedExpression[]} innerExpressions Expressions to be wrapped
   * @returns {this} this
   */
  setWrapped(
    prefix: BasicEvaluatedExpression | null | undefined,
    postfix: BasicEvaluatedExpression | null | undefined,
    innerExpressions: BasicEvaluatedExpression[],
  ): this;
  /**
   * Stores the options of a conditional expression.
   *
   * @param {BasicEvaluatedExpression[]} options optional (consequent/alternate) expressions to be set
   * @returns {this} this
   */
  setOptions(options: BasicEvaluatedExpression[]): this;
  /**
   * Adds options to a conditional expression.
   *
   * @param {BasicEvaluatedExpression[]} options optional (consequent/alternate) expressions to be added
   * @returns {this} this
   */
  addOptions(options: BasicEvaluatedExpression[]): this;
  /**
   * Set's the value of this expression to an array of expressions.
   *
   * @param {BasicEvaluatedExpression[]} items expressions to set
   * @returns {this} this
   */
  setItems(items: BasicEvaluatedExpression[]): this;
  /**
   * Set's the value of this expression to an array of strings.
   *
   * @param {string[]} array array to set
   * @returns {this} this
   */
  setArray(array: string[]): this;
  /**
   * Set's the value of this expression to a processed/unprocessed template string. Used
   * for evaluating TemplateLiteral expressions in the JavaScript Parser.
   *
   * @param {BasicEvaluatedExpression[]} quasis template string quasis
   * @param {BasicEvaluatedExpression[]} parts template string parts
   * @param {"cooked" | "raw"} kind template string kind
   * @returns {this} this
   */
  setTemplateString(
    quasis: BasicEvaluatedExpression[],
    parts: BasicEvaluatedExpression[],
    kind: 'cooked' | 'raw',
  ): this;
  templateStringKind: 'raw' | 'cooked';
  setTruthy(): this;
  setFalsy(): this;
  /**
   * Set's the value of the expression to nullish.
   *
   * @param {boolean} value true, if the expression is nullish
   * @returns {this} this
   */
  setNullish(value: boolean): this;
  /**
   * Set's the range for the expression.
   *
   * @param {[number, number]} range range to set
   * @returns {this} this
   */
  setRange(range: [number, number]): this;
  /**
   * Set whether or not the expression has side effects.
   *
   * @param {boolean} sideEffects true, if the expression has side effects
   * @returns {this} this
   */
  setSideEffects(sideEffects?: boolean): this;
  /**
   * Set the expression node for the expression.
   *
   * @param {Node | undefined} expression expression
   * @returns {this} this
   */
  setExpression(expression: Node | undefined): this;
}
declare namespace BasicEvaluatedExpression {
  export { isValidRegExpFlags, Node, Range, VariableInfoInterface };
}
type VariableInfoInterface = import('./JavascriptParser').VariableInfoInterface;
type Node = import('estree').Node;
/**
 * @param {string} flags regexp flags
 * @returns {boolean} is valid flags
 */
declare function isValidRegExpFlags(flags: string): boolean;
type Range = import('./JavascriptParser').Range;
