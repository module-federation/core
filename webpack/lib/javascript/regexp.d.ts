export type UnicodePropertyTables = {
    /**
     * the binary property names and general category values
     */
    binary: RegExp;
    /**
     * the string-valued property names
     */
    binaryOfStrings: RegExp;
    /**
     * each non-binary property's values, by property name
     */
    nonBinary: Record<string, RegExp>;
};
export type GroupNames = Record<string, BranchID[] | true>;
/** The cursor a regexp literal is validated through. */
export class RegExpValidationState {
    /**
     * @param {Parser} parser the parser that owns it
     */
    constructor(parser: Parser);
    parser: Parser;
    validFlags: string;
    unicodeProperties: UnicodePropertyTables;
    source: string;
    flags: string;
    start: number;
    switchU: boolean;
    switchV: boolean;
    switchN: boolean;
    pos: number;
    lastIntValue: number;
    lastStringValue: string;
    lastAssertionIsQuantifiable: boolean;
    numCapturingParens: number;
    maxBackReference: number;
    /** @type {GroupNames} */
    groupNames: GroupNames;
    /** @type {string[]} */
    backReferenceNames: string[];
    /** @type {BranchID | null} */
    branchID: BranchID | null;
    /**
     * @param {number} start where the literal starts in the source
     * @param {string} pattern the pattern's text
     * @param {string} flags the flags' text
     * @returns {void}
     */
    reset(start: number, pattern: string, flags: string): void;
    /**
     * @param {string} message what is wrong with the pattern
     * @returns {void}
     */
    raise(message: string): void;
    /**
     * The code point at an index, joining a surrogate pair where the `u` flag
     * asks for code points rather than units.
     * @param {number} i the index to read
     * @param {boolean=} forceU whether to read as if the `u` flag were set
     * @returns {number} the code point, or `-1` past the end
     */
    at(i: number, forceU?: boolean | undefined): number;
    /**
     * @param {number} i the index to step from
     * @param {boolean=} forceU whether to read as if the `u` flag were set
     * @returns {number} the next index
     */
    nextIndex(i: number, forceU?: boolean | undefined): number;
    /**
     * @param {boolean=} forceU whether to read as if the `u` flag were set
     * @returns {number} the code point at the cursor
     */
    current(forceU?: boolean | undefined): number;
    /**
     * @param {boolean=} forceU whether to read as if the `u` flag were set
     * @returns {number} the code point after the cursor
     */
    lookahead(forceU?: boolean | undefined): number;
    /**
     * @param {boolean=} forceU whether to read as if the `u` flag were set
     * @returns {void}
     */
    advance(forceU?: boolean | undefined): void;
    /**
     * @param {number} ch the code point to consume
     * @param {boolean=} forceU whether to read as if the `u` flag were set
     * @returns {boolean} whether it was there
     */
    eat(ch: number, forceU?: boolean | undefined): boolean;
    /**
     * @param {number[]} chs the code points to consume, in order
     * @param {boolean=} forceU whether to read as if the `u` flag were set
     * @returns {boolean} whether they were all there
     */
    eatChars(chs: number[], forceU?: boolean | undefined): boolean;
}
/**
 * The regexp validator, as prototype methods `install` copies onto the parser.
 * It extends `Parser` so each method reads the cursor it is handed through
 * `this`, the way acorn declares them.
 */
export class RegExpValidator extends Parser {
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {void}
     */
    regexp_pattern(state: RegExpValidationState): void;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {void}
     */
    regexp_disjunction(state: RegExpValidationState): void;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {void}
     */
    regexp_alternative(state: RegExpValidationState): void;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a term was read
     */
    regexp_eatTerm(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether an assertion was read
     */
    regexp_eatAssertion(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @param {boolean=} noError whether to read without reporting
     * @returns {boolean} whether a quantifier was read
     */
    regexp_eatQuantifier(state: RegExpValidationState, noError?: boolean | undefined): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @param {boolean=} noError whether to read without reporting
     * @returns {boolean} whether a quantifier prefix was read
     */
    regexp_eatQuantifierPrefix(state: RegExpValidationState, noError?: boolean | undefined): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @param {boolean=} noError whether to read without reporting
     * @returns {boolean} whether a braced quantifier was read
     */
    regexp_eatBracedQuantifier(state: RegExpValidationState, noError?: boolean | undefined): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether an atom was read
     */
    regexp_eatAtom(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether an escape was read
     */
    regexp_eatReverseSolidusAtomEscape(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a non-capturing group was read
     */
    regexp_eatUncapturingGroup(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a capturing group was read
     */
    regexp_eatCapturingGroup(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {string} the modifiers that were read
     */
    regexp_eatModifiers(state: RegExpValidationState): string;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether an atom was read
     */
    regexp_eatExtendedAtom(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} always false, since a match is an error
     */
    regexp_eatInvalidBracedQuantifier(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a syntax character was read
     */
    regexp_eatSyntaxCharacter(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether any pattern character was read
     */
    regexp_eatPatternCharacters(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a pattern character was read
     */
    regexp_eatExtendedPatternCharacter(state: RegExpValidationState): boolean;
    /**
     * Read a capture group's name, and report one that another branch of the
     * same disjunction already used.
     * @param {RegExpValidationState} state the validation state
     * @returns {void}
     */
    regexp_groupSpecifier(state: RegExpValidationState): void;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a group name was read
     */
    regexp_eatGroupName(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a name was read
     */
    regexp_eatRegExpIdentifierName(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a name start was read
     */
    regexp_eatRegExpIdentifierStart(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a name character was read
     */
    regexp_eatRegExpIdentifierPart(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether an escape was read
     */
    regexp_eatAtomEscape(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a back reference was read
     */
    regexp_eatBackReference(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a named back reference was read
     */
    regexp_eatKGroupName(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a character escape was read
     */
    regexp_eatCharacterEscape(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a `\c` escape was read
     */
    regexp_eatCControlLetter(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a `\0` escape was read
     */
    regexp_eatZero(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a control escape was read
     */
    regexp_eatControlEscape(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a control letter was read
     */
    regexp_eatControlLetter(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @param {boolean=} forceU whether to read as if the `u` flag were set
     * @returns {boolean} whether an escape was read
     */
    regexp_eatRegExpUnicodeEscapeSequence(state: RegExpValidationState, forceU?: boolean | undefined): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether an identity escape was read
     */
    regexp_eatIdentityEscape(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a decimal escape was read
     */
    regexp_eatDecimalEscape(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {number} which kind of character set was read
     */
    regexp_eatCharacterClassEscape(state: RegExpValidationState): number;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {number} which kind of character set was read
     */
    regexp_eatUnicodePropertyValueExpression(state: RegExpValidationState): number;
    /**
     * @param {RegExpValidationState} state the validation state
     * @param {string} name the property's name
     * @param {string} value the value asked for
     * @returns {void}
     */
    regexp_validateUnicodePropertyNameAndValue(state: RegExpValidationState, name: string, value: string): void;
    /**
     * @param {RegExpValidationState} state the validation state
     * @param {string} nameOrValue the lone name
     * @returns {number} which kind of character set it names
     */
    regexp_validateUnicodePropertyNameOrValue(state: RegExpValidationState, nameOrValue: string): number;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a property name was read
     */
    regexp_eatUnicodePropertyName(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a property value was read
     */
    regexp_eatUnicodePropertyValue(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a lone name was read
     */
    regexp_eatLoneUnicodePropertyNameOrValue(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a character class was read
     */
    regexp_eatCharacterClass(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {number} which kind of character set the contents are
     */
    regexp_classContents(state: RegExpValidationState): number;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {void}
     */
    regexp_nonEmptyClassRanges(state: RegExpValidationState): void;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a class atom was read
     */
    regexp_eatClassAtom(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a class escape was read
     */
    regexp_eatClassEscape(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {number} which kind of character set was read
     */
    regexp_classSetExpression(state: RegExpValidationState): number;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a range was read
     */
    regexp_eatClassSetRange(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {number | null} which kind of character set was read
     */
    regexp_eatClassSetOperand(state: RegExpValidationState): number | null;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {number | null} which kind of character set was read
     */
    regexp_eatNestedClass(state: RegExpValidationState): number | null;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {number | null} which kind of character set was read
     */
    regexp_eatClassStringDisjunction(state: RegExpValidationState): number | null;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {number} which kind of character set was read
     */
    regexp_classStringDisjunctionContents(state: RegExpValidationState): number;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {number} which kind of character set was read
     */
    regexp_classString(state: RegExpValidationState): number;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a character was read
     */
    regexp_eatClassSetCharacter(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a reserved punctuator was read
     */
    regexp_eatClassSetReservedPunctuator(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a control letter was read
     */
    regexp_eatClassControlLetter(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a hex escape was read
     */
    regexp_eatHexEscapeSequence(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether any digits were read
     */
    regexp_eatDecimalDigits(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether any digits were read
     */
    regexp_eatHexDigits(state: RegExpValidationState): boolean;
    /**
     * Read a legacy octal escape, which names only `0` through `377`.
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether one was read
     */
    regexp_eatLegacyOctalEscapeSequence(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @returns {boolean} whether a digit was read
     */
    regexp_eatOctalDigit(state: RegExpValidationState): boolean;
    /**
     * @param {RegExpValidationState} state the validation state
     * @param {number} length exactly how many digits to read
     * @returns {boolean} whether that many were there
     */
    regexp_eatFixedHexDigits(state: RegExpValidationState, length: number): boolean;
}
/**
 * Copy the validator onto the parser's prototype, leaving alone any name the
 * parser (or something that patched it) already declares.
 * @param {typeof Parser} target the parser class to extend
 * @returns {void}
 */
export function install(target: typeof Parser): void;
/**
 * Which disjunction branch a named group sits in, so that the same name in two
 * alternatives of one disjunction is allowed and a repeat in one is not.
 */
declare class BranchID {
    /**
     * @param {BranchID | null} parent the enclosing disjunction's branch
     * @param {BranchID | null=} base the set of sibling branches this belongs to
     */
    constructor(parent: BranchID | null, base?: (BranchID | null) | undefined);
    parent: BranchID;
    /** @type {BranchID} */
    base: BranchID;
    walk: number;
    /** @type {BranchID | null} */
    taken: BranchID | null;
    /**
     * Two branches are separated when some disjunction they both sit under took
     * a different alternative for each, so nothing can match both.
     * @param {BranchID} alt the other branch
     * @returns {boolean} whether the two are alternatives of one disjunction
     */
    separatedFrom(alt: BranchID): boolean;
    /** @returns {BranchID} the next branch of the same disjunction */
    sibling(): BranchID;
}
import { Parser } from "./syntax-parser";
export {};
