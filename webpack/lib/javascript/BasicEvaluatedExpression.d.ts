export = BasicEvaluatedExpression;
/**
 * An instance is allocated for a large share of walked expressions, so the
 * boolean facts live in one packed flags slot and the scalar/identifier
 * fields in five slots shared by type, with accessors keeping every public
 * field readable. This shrinks instances from 224 to 144 bytes on V8.
 */
declare class BasicEvaluatedExpression {
    _flags: number;
    /** @type {Range | undefined} */
    _range: Range | undefined;
    /** @type {Node | undefined} */
    expression: Node | undefined;
    /** @type {boolean | number | bigint | RegExp | string | string[] | InstanceType<VariableInfo> | undefined} */
    _v1: boolean | number | bigint | RegExp | string | string[] | InstanceType<{
        new (declaredScope: import("./JavascriptParser").ScopeInfo, name: string | undefined, flags: import("./JavascriptParser").VariableInfoFlagsType, tagInfo: import("./JavascriptParser").TagInfo | undefined): {
            declaredScope: import("./JavascriptParser").ScopeInfo;
            name: string | undefined;
            flags: import("./JavascriptParser").VariableInfoFlagsType;
            tagInfo: import("./JavascriptParser").TagInfo | undefined;
            isFree(): boolean;
            isTagged(): boolean;
        };
    }> | undefined;
    /** @type {string | InstanceType<VariableInfo> | undefined} */
    _v2: string | InstanceType<{
        new (declaredScope: import("./JavascriptParser").ScopeInfo, name: string | undefined, flags: import("./JavascriptParser").VariableInfoFlagsType, tagInfo: import("./JavascriptParser").TagInfo | undefined): {
            declaredScope: import("./JavascriptParser").ScopeInfo;
            name: string | undefined;
            flags: import("./JavascriptParser").VariableInfoFlagsType;
            tagInfo: import("./JavascriptParser").TagInfo | undefined;
            isFree(): boolean;
            isTagged(): boolean;
        };
    }> | undefined;
    /** @type {"cooked" | "raw" | GetMembers | undefined} */
    _v3: "cooked" | "raw" | GetMembers | undefined;
    /** @type {GetMembersOptionals | undefined} */
    _v4: GetMembersOptionals | undefined;
    /** @type {GetMemberRanges | undefined} */
    _v5: GetMemberRanges | undefined;
    /** @type {BasicEvaluatedExpression[] | undefined} */
    quasis: BasicEvaluatedExpression[] | undefined;
    /** @type {BasicEvaluatedExpression[] | undefined} */
    parts: BasicEvaluatedExpression[] | undefined;
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
    /**
     * @param {Range | undefined} value range of the evaluated expression
     */
    set range(value: Range | undefined);
    /**
     * Served lazily from the attached expression when not set explicitly:
     * `evaluateExpression`'s plain results share the expression's range, and
     * most evaluations never read it, so the node's range array is only
     * materialized on demand.
     * @returns {Range | undefined} range of the evaluated expression
     */
    get range(): Range | undefined;
    /**
     * @param {number} value expression type
     */
    set type(value: number);
    /**
     * @returns {number} expression type
     */
    get type(): number;
    /**
     * @param {boolean} value known truthy
     */
    set truthy(value: boolean);
    /**
     * @returns {boolean} true when the expression is known truthy
     */
    get truthy(): boolean;
    /**
     * @param {boolean} value known falsy
     */
    set falsy(value: boolean);
    /**
     * @returns {boolean} true when the expression is known falsy
     */
    get falsy(): boolean;
    /**
     * @param {boolean | undefined} value whether the value is nullish
     */
    set nullish(value: boolean | undefined);
    /**
     * @returns {boolean | undefined} whether the value is nullish, when known
     */
    get nullish(): boolean | undefined;
    /**
     * @param {boolean} value could have side effects
     */
    set sideEffects(value: boolean);
    /**
     * @returns {boolean} true when the expression could have side effects
     */
    get sideEffects(): boolean;
    /**
     * @param {boolean | undefined} value boolean value
     */
    set bool(value: boolean | undefined);
    /**
     * @returns {boolean | undefined} boolean value when boolean-typed
     */
    get bool(): boolean | undefined;
    /**
     * @param {number | undefined} value number value
     */
    set number(value: number | undefined);
    /**
     * @returns {number | undefined} number value when number-typed
     */
    get number(): number | undefined;
    /**
     * @param {bigint | undefined} value bigint value
     */
    set bigint(value: bigint | undefined);
    /**
     * @returns {bigint | undefined} bigint value when bigint-typed
     */
    get bigint(): bigint | undefined;
    /**
     * @param {RegExp | undefined} value regexp value
     */
    set regExp(value: RegExp | undefined);
    /**
     * @returns {RegExp | undefined} regexp value when regexp-typed
     */
    get regExp(): RegExp | undefined;
    /**
     * @param {string | undefined} value string value
     */
    set string(value: string | undefined);
    /**
     * @returns {string | undefined} string value when string-typed
     */
    get string(): string | undefined;
    /**
     * @param {"cooked" | "raw" | undefined} value template string kind
     */
    set templateStringKind(value: "cooked" | "raw" | undefined);
    /**
     * @returns {"cooked" | "raw" | undefined} template string kind
     */
    get templateStringKind(): "cooked" | "raw" | undefined;
    /**
     * @param {string[] | undefined} value const array values
     */
    set array(value: string[] | undefined);
    /**
     * @returns {string[] | undefined} const array values
     */
    get array(): string[] | undefined;
    /**
     * @param {string | InstanceType<VariableInfo> | undefined} value identifier
     */
    set identifier(value: string | InstanceType<{
        new (declaredScope: import("./JavascriptParser").ScopeInfo, name: string | undefined, flags: import("./JavascriptParser").VariableInfoFlagsType, tagInfo: import("./JavascriptParser").TagInfo | undefined): {
            declaredScope: import("./JavascriptParser").ScopeInfo;
            name: string | undefined;
            flags: import("./JavascriptParser").VariableInfoFlagsType;
            tagInfo: import("./JavascriptParser").TagInfo | undefined;
            isFree(): boolean;
            isTagged(): boolean;
        };
    }> | undefined);
    /**
     * @returns {string | InstanceType<VariableInfo> | undefined} identifier
     */
    get identifier(): string | InstanceType<{
        new (declaredScope: import("./JavascriptParser").ScopeInfo, name: string | undefined, flags: import("./JavascriptParser").VariableInfoFlagsType, tagInfo: import("./JavascriptParser").TagInfo | undefined): {
            declaredScope: import("./JavascriptParser").ScopeInfo;
            name: string | undefined;
            flags: import("./JavascriptParser").VariableInfoFlagsType;
            tagInfo: import("./JavascriptParser").TagInfo | undefined;
            isFree(): boolean;
            isTagged(): boolean;
        };
    }> | undefined;
    /**
     * @param {string | InstanceType<VariableInfo> | undefined} value root info
     */
    set rootInfo(value: string | InstanceType<{
        new (declaredScope: import("./JavascriptParser").ScopeInfo, name: string | undefined, flags: import("./JavascriptParser").VariableInfoFlagsType, tagInfo: import("./JavascriptParser").TagInfo | undefined): {
            declaredScope: import("./JavascriptParser").ScopeInfo;
            name: string | undefined;
            flags: import("./JavascriptParser").VariableInfoFlagsType;
            tagInfo: import("./JavascriptParser").TagInfo | undefined;
            isFree(): boolean;
            isTagged(): boolean;
        };
    }> | undefined);
    /**
     * @returns {string | InstanceType<VariableInfo> | undefined} root info
     */
    get rootInfo(): string | InstanceType<{
        new (declaredScope: import("./JavascriptParser").ScopeInfo, name: string | undefined, flags: import("./JavascriptParser").VariableInfoFlagsType, tagInfo: import("./JavascriptParser").TagInfo | undefined): {
            declaredScope: import("./JavascriptParser").ScopeInfo;
            name: string | undefined;
            flags: import("./JavascriptParser").VariableInfoFlagsType;
            tagInfo: import("./JavascriptParser").TagInfo | undefined;
            isFree(): boolean;
            isTagged(): boolean;
        };
    }> | undefined;
    /**
     * @param {GetMembers | undefined} value members getter
     */
    set getMembers(value: GetMembers | undefined);
    /**
     * @returns {GetMembers | undefined} members getter
     */
    get getMembers(): GetMembers | undefined;
    /**
     * @param {GetMembersOptionals | undefined} value members optionals getter
     */
    set getMembersOptionals(value: GetMembersOptionals | undefined);
    /**
     * @returns {GetMembersOptionals | undefined} members optionals getter
     */
    get getMembersOptionals(): GetMembersOptionals | undefined;
    /**
     * @param {GetMemberRanges | undefined} value member ranges getter
     */
    set getMemberRanges(value: GetMemberRanges | undefined);
    /**
     * @returns {GetMemberRanges | undefined} member ranges getter
     */
    get getMemberRanges(): GetMemberRanges | undefined;
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
     * As compile time value.
     * @returns {undefined | null | string | number | boolean | RegExp | string[] | bigint} the javascript value
     */
    asCompileTimeValue(): undefined | null | string | number | boolean | RegExp | string[] | bigint;
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
     * Updates string using the provided string.
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
     * @param {string | InstanceType<VariableInfo>} identifier identifier to set
     * @param {string | InstanceType<VariableInfo>} rootInfo root info
     * @param {GetMembers} getMembers members
     * @param {GetMembersOptionals=} getMembersOptionals optional members
     * @param {GetMemberRanges=} getMemberRanges ranges of progressively increasing sub-expressions
     * @returns {this} this
     */
    setIdentifier(identifier: string | InstanceType<{
        new (declaredScope: import("./JavascriptParser").ScopeInfo, name: string | undefined, flags: import("./JavascriptParser").VariableInfoFlagsType, tagInfo: import("./JavascriptParser").TagInfo | undefined): {
            declaredScope: import("./JavascriptParser").ScopeInfo;
            name: string | undefined;
            flags: import("./JavascriptParser").VariableInfoFlagsType;
            tagInfo: import("./JavascriptParser").TagInfo | undefined;
            isFree(): boolean;
            isTagged(): boolean;
        };
    }>, rootInfo: string | InstanceType<{
        new (declaredScope: import("./JavascriptParser").ScopeInfo, name: string | undefined, flags: import("./JavascriptParser").VariableInfoFlagsType, tagInfo: import("./JavascriptParser").TagInfo | undefined): {
            declaredScope: import("./JavascriptParser").ScopeInfo;
            name: string | undefined;
            flags: import("./JavascriptParser").VariableInfoFlagsType;
            tagInfo: import("./JavascriptParser").TagInfo | undefined;
            isFree(): boolean;
            isTagged(): boolean;
        };
    }>, getMembers: GetMembers, getMembersOptionals?: GetMembersOptionals | undefined, getMemberRanges?: GetMemberRanges | undefined): this;
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
     * Adds the provided basic evaluated expression to the basic evaluated expression.
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
    export { isValidRegExpFlags, GetMembers, GetMembersOptionals, GetMemberRanges };
}
import type { Range } from "./JavascriptParser";
import type { Node } from "estree";
/**
 * Returns is valid flags.
 * @param {string} flags regexp flags
 * @returns {boolean} is valid flags
 */
declare function isValidRegExpFlags(flags: string): boolean;
type GetMembers = () => Members;
type GetMembersOptionals = () => MembersOptionals;
type GetMemberRanges = () => MemberRanges;
import type { Members } from "./JavascriptParser";
import type { MembersOptionals } from "./JavascriptParser";
import type { MemberRanges } from "./JavascriptParser";
