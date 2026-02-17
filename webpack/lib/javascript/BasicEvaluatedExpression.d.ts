export = BasicEvaluatedExpression;
/** @typedef {() => Members} GetMembers */
/** @typedef {() => MembersOptionals} GetMembersOptionals */
/** @typedef {() => MemberRanges} GetMemberRanges */
declare class BasicEvaluatedExpression {
    type: number;
    /** @type {Range | undefined} */
    range: Range | undefined;
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
    /** @type {EXPECTED_ANY[] | undefined} */
    array: EXPECTED_ANY[] | undefined;
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
    /** @type {string | VariableInfo | undefined} */
    identifier: string | VariableInfo | undefined;
    /** @type {string | VariableInfo | undefined} */
    rootInfo: string | VariableInfo | undefined;
    /** @type {GetMembers | undefined} */
    getMembers: GetMembers | undefined;
    /** @type {GetMembersOptionals | undefined} */
    getMembersOptionals: GetMembersOptionals | undefined;
    /** @type {GetMemberRanges | undefined} */
    getMemberRanges: GetMemberRanges | undefined;
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
     * @returns {undefined | null | string | number | boolean | RegExp | EXPECTED_ANY[] | bigint} the javascript value
     */
    asCompileTimeValue(): undefined | null | string | number | boolean | RegExp | EXPECTED_ANY[] | bigint;
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
     * @param {string | VariableInfo} identifier identifier to set
     * @param {string | VariableInfo} rootInfo root info
     * @param {GetMembers} getMembers members
     * @param {GetMembersOptionals=} getMembersOptionals optional members
     * @param {GetMemberRanges=} getMemberRanges ranges of progressively increasing sub-expressions
     * @returns {this} this
     */
    setIdentifier(identifier: string | VariableInfo, rootInfo: string | VariableInfo, getMembers: GetMembers, getMembersOptionals?: GetMembersOptionals | undefined, getMemberRanges?: GetMemberRanges | undefined): this;
    /**
     * Wraps an array of expressions with a prefix and postfix expression.
     * @param {BasicEvaluatedExpression | null | undefined} prefix Expression to be added before the innerExpressions
     * @param {BasicEvaluatedExpression | null | undefined} postfix Expression to be added after the innerExpressions
     * @param {BasicEvaluatedExpression[] | undefined} innerExpressions Expressions to be wrapped
     * @returns {this} this
     */
    setWrapped(prefix: BasicEvaluatedExpression | null | undefined, postfix: BasicEvaluatedExpression | null | undefined, innerExpressions: BasicEvaluatedExpression[] | undefined): this;
    /**
     * Stores the options of a conditional expression.
     * @param {BasicEvaluatedExpression[]} options optional (consequent/alternate) expressions to be set
     * @returns {this} this
     */
    setOptions(options: BasicEvaluatedExpression[]): this;
    /**
     * Adds options to a conditional expression.
     * @param {BasicEvaluatedExpression[]} options optional (consequent/alternate) expressions to be added
     * @returns {this} this
     */
    addOptions(options: BasicEvaluatedExpression[]): this;
    /**
     * Set's the value of this expression to an array of expressions.
     * @param {BasicEvaluatedExpression[]} items expressions to set
     * @returns {this} this
     */
    setItems(items: BasicEvaluatedExpression[]): this;
    /**
     * Set's the value of this expression to an array of strings.
     * @param {string[]} array array to set
     * @returns {this} this
     */
    setArray(array: string[]): this;
    /**
     * Set's the value of this expression to a processed/unprocessed template string. Used
     * for evaluating TemplateLiteral expressions in the JavaScript Parser.
     * @param {BasicEvaluatedExpression[]} quasis template string quasis
     * @param {BasicEvaluatedExpression[]} parts template string parts
     * @param {"cooked" | "raw"} kind template string kind
     * @returns {this} this
     */
    setTemplateString(quasis: BasicEvaluatedExpression[], parts: BasicEvaluatedExpression[], kind: "cooked" | "raw"): this;
    templateStringKind: "cooked" | "raw";
    setTruthy(): this;
    setFalsy(): this;
    /**
     * Set's the value of the expression to nullish.
     * @param {boolean} value true, if the expression is nullish
     * @returns {this} this
     */
    setNullish(value: boolean): this;
    /**
     * Set's the range for the expression.
     * @param {Range} range range to set
     * @returns {this} this
     */
    setRange(range: Range): this;
    /**
     * Set whether or not the expression has side effects.
     * @param {boolean} sideEffects true, if the expression has side effects
     * @returns {this} this
     */
    setSideEffects(sideEffects?: boolean): this;
    /**
     * Set the expression node for the expression.
     * @param {Node | undefined} expression expression
     * @returns {this} this
     */
    setExpression(expression: Node | undefined): this;
}
declare namespace BasicEvaluatedExpression {
    export { isValidRegExpFlags, Node, Range, VariableInfo, Members, MembersOptionals, MemberRanges, GetMembers, GetMembersOptionals, GetMemberRanges };
}
/**
 * @param {string} flags regexp flags
 * @returns {boolean} is valid flags
 */
declare function isValidRegExpFlags(flags: string): boolean;
type Node = import("estree").Node;
type Range = import("./JavascriptParser").Range;
type VariableInfo = import("./JavascriptParser").VariableInfo;
type Members = import("./JavascriptParser").Members;
type MembersOptionals = import("./JavascriptParser").MembersOptionals;
type MemberRanges = import("./JavascriptParser").MemberRanges;
type GetMembers = () => Members;
type GetMembersOptionals = () => MembersOptionals;
type GetMemberRanges = () => MemberRanges;
