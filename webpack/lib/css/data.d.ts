export type MathArgumentReader = (sums: Map<string, number>[]) => [string, number[]] | null;
export type MathOperation = (values: number[], strategy: string, table: Map<number, number>) => number | null;
export type ColorSpaceModel = {
    to: (c: number[]) => number[];
    from: (c: number[]) => number[];
    hue: number;
    conversion: number;
    written: {
        open: string;
        scale: number[];
        percent: boolean[];
        feature: string;
    };
    uncertainHue: ((c: number[]) => boolean) | null;
};
/** @type {Map<string, [string, number]>} */
export const ABSOLUTE_UNIT_SCALE: Map<string, [string, number]>;
export const ALPHA_VALUE_PROPERTIES: Set<string>;
/** @type {Map<string, number>} */
export const ANGLE_DEGREES: Map<string, number>;
export const ANGLE_UNITS: Set<string>;
/** @type {Map<number, number>} */
export const ARC_COSINE_DEGREES: Map<number, number>;
/** @type {Map<number, number>} */
export const ARC_SINE_DEGREES: Map<number, number>;
/** @type {Map<number, number>} */
export const ARC_TANGENT_DEGREES: Map<number, number>;
export const ANIMATION_KEYWORD_SLOTS: Map<string, string[]>;
export const AUTO_SECOND_VALUE_PROPERTIES: Set<string>;
export const BOX_FAMILY_PREFIX: Map<string, string>;
export const BOX_LONGHANDS: Map<string, string[]>;
export const BOX_SHORTHANDS: Set<string>;
/** @type {Map<string, number | null>} */
export const CALC_CONSTANTS: Map<string, number | null>;
export const CALC_REJECTING_PROPERTIES: Set<string>;
export const CANONICAL_NAMES: Map<string, string>;
export const getDeclarationRanks: memoize.FunctionReturning<Map<string, number>>;
export const getPropertyAliases: memoize.FunctionReturning<Map<string, string>>;
/** @type {Map<string, [string, number, number]>} */
export const CLAMPED_VALUE_RANGES: Map<string, [string, number, number]>;
export const COLOR_ARGUMENT_FUNCTIONS: Set<string>;
export const COLOR_FUNCTIONS: Set<string>;
export const COLOR_KEYWORDS: Set<string>;
/** @type {() => Map<string, number>} */
export const getColorNameToRgb: () => Map<string, number>;
export const getColorNameToShortest: memoize.FunctionReturning<Map<string, string>>;
export const COLOR_ONLY_PROPERTIES: Set<string>;
/** @typedef {{ to: (c: number[]) => number[], from: (c: number[]) => number[], hue: number, conversion: number, written: { open: string, scale: number[], percent: boolean[], feature: string }, uncertainHue: ((c: number[]) => boolean) | null }} ColorSpaceModel */
/** @type {() => Map<string, ColorSpaceModel>} */
export const getColorSpaceModel: () => Map<string, ColorSpaceModel>;
export const COMPOUND_CONTINUATIONS: Set<string>;
export const getCssModulesKeywords: memoize.FunctionReturning<Map<string, Map<string, number>>>;
export const CSS_MODULES_KEYWORD_OPTIONS: Map<string, string>;
export const CSS_WIDE_KEYWORDS: Set<string>;
export const CUBIC_BEZIER_KEYWORDS: Map<string, string>;
export const CUSTOM_IDENT_LIST_PROPERTIES: Set<string>;
export const DEFAULT_GRADIENT_DIRECTIONS: Set<string>;
export const DEFAULT_GRADIENT_POSITIONS: Set<string>;
export const REVERSED_GRADIENT_DIRECTIONS: Set<string>;
export const DISPLAY_SHORT_FORMS: Map<string, string>;
export const DROPPABLE_WHEN_EMPTY_AT_RULES: Set<string>;
export const EASING_KEYWORDS: Set<string>;
/** @type {Map<number, number>} */
export const EIGHTH_TURN_COSINE: Map<number, number>;
/** @type {Map<number, number>} */
export const EIGHTH_TURN_SINE: Map<number, number>;
/** @type {Map<number, number>} */
export const EIGHTH_TURN_TANGENT: Map<number, number>;
export const ENCODED_ALREADY: 0;
export const ENGINE_TRANSFER_DIFFERS: 3;
export const FAMILY_LIST_PROPERTIES: Set<string>;
export const FAMILY_LONGHANDS: Map<string, string[]>;
export const FAMILY_SLOT_CLASSES: Map<string, string[]>;
export const FAMILY_SLOT_INITIALS: Map<string, string>;
export const FAMILY_SLOT_KEYWORDS: Map<string, string[]>;
export const FEATURELESS_PSEUDO_CLASSES: Set<string>;
export const FILTER_FUNCTION_OMITTED: Map<string, string>;
export const FLEX_KEYWORDS: Map<string, string>;
export const FONT_SIZE_KEYWORDS: Set<string>;
export const FONT_STRETCH_PERCENTAGES: Map<string, string>;
export const FONT_WEIGHT_NUMBERS: Map<string, string>;
export const GENERIC_FONT_FAMILIES: Set<string>;
export const GRADIENT_LAST_POSITIONS: Map<string, Set<string>>;
/** @type {Map<string, string>} */
export const GRADIENT_SIDE_ANGLES: Map<string, string>;
export const getInitialValueKeywords: memoize.FunctionReturning<Map<string, string>>;
export const INTEGER_PROPERTIES: Set<string>;
export const getKeywordOnlyProperties: memoize.FunctionReturning<Set<string>>;
export const LATER_COLOR_NAMES: Set<string>;
export const LAYER_INITIALS: Map<string, string[]>;
export const LEGACY_BOX_DISPLAYS: Set<string>;
export const LEGACY_BOX_SPELLINGS: Set<string>;
export const LEGACY_PSEUDO_ELEMENTS: Set<string>;
export const LENGTH_ONLY_FUNCTIONS: Set<string>;
export const LINEAR_GRADIENTS: Set<string>;
export const LINEAR_SRGB_TO_P3: number[];
export const MATH_FUNCTIONS: Set<string>;
/** @type {Map<string, [number, number]>} */
export const MATH_FUNCTION_ARITY: Map<string, [number, number]>;
/** @type {Map<string, { read: MathArgumentReader, apply: MathOperation, result: string, table: Map<number, number> }>} */
export const MATH_FUNCTION_FOLD: Map<string, {
    read: MathArgumentReader;
    apply: MathOperation;
    result: string;
    table: Map<number, number>;
}>;
/** @type {Map<string, string[]>} */
export const MATH_FUNCTION_KEYWORDS: Map<string, string[]>;
/** @type {Map<string, number[]>} */
export const MATH_FUNCTION_SUM_ARGUMENTS: Map<string, number[]>;
export const MERGEABLE_AT_RULES: Set<string>;
export const MERGE_LONGHANDS: Set<string>;
export const NEGATIVE_ACCEPTING_FUNCTIONS: Set<string>;
export const NEGATIVE_ACCEPTING_PROPERTIES: Set<string>;
export const NEVER: 1000000000;
export const NTH_NAMED_EQUIVALENTS: Map<string, string>;
export const NTH_PSEUDO_FUNCTIONS: Set<string>;
/** @type {Map<string, [string, string[]]>} */
export const OMITTABLE_INITIAL_KEYWORDS: Map<string, [string, string[]]>;
export const ONE_VALUE_PAIR_SHORTHANDS: Set<string>;
export const ORDERED_LONGHANDS: Map<string, string[]>;
export const NUMBER_ARGUMENT_FUNCTIONS: Set<string>;
export const NUMBER_ONLY_OUTSIDE_CALC_PROPERTIES: Set<string>;
export const NUMBER_ZERO_PROPERTIES: Set<string>;
export const PAIR_LONGHANDS: Map<string, string[]>;
export const PLACE_SHORTHANDS: Set<string>;
export const POSITION_PROPERTIES: Set<string>;
export const POSITION_X_KEYWORDS: Map<string, string>;
export const POSITION_Y_KEYWORDS: Map<string, string>;
/** @type {Map<string, { toSrgb: number[], transfer: (c: number) => number, conversion: number }>} */
export const PREDEFINED_COLOR_SPACES: Map<string, {
    toSrgb: number[];
    transfer: (c: number) => number;
    conversion: number;
}>;
/** @type {Map<string, [string, number][]>} */
export const PREFIXED_AT_RULES: Map<string, [string, number][]>;
/** @type {() => Map<string, [string, number][]>} */
export const getPrefixedProperties: () => Map<string, [string, number][]>;
/** @type {Map<string, [string, number][]>} */
export const PREFIXED_SELECTORS: Map<string, [string, number][]>;
/** @type {() => Map<string, Map<string, string>>} */
export const getPrefixedSpellingKeywords: () => Map<string, Map<string, string>>;
/** @type {Map<string, number>} */
export const PREFIXED_SPELLING_NUMBERS: Map<string, number>;
/** @type {() => Map<string, Map<string, [string, number][]>>} */
export const getPrefixedValues: () => Map<string, Map<string, [string, number][]>>;
export const getPrefixWindows: memoize.FunctionReturning<Uint32Array<ArrayBuffer>>;
export const PREFIX_WINDOW_STARTS: Uint16Array<ArrayBuffer>;
/** @type {Map<string, number>} */
export const QUARTER_TURN_ANGLE: Map<string, number>;
export const RATIO_PROPERTIES: Set<string>;
export const REPEAT_STYLE_KEYWORDS: Set<string>;
export const REPEAT_STYLE_PROPERTIES: Set<string>;
export const RGB_TO_NAME: Map<number, string>;
export const SELECTOR_FUNCTIONS: Set<string>;
/** @type {() => Map<string, number>} */
export const getSelectorSupportedFrom: () => Map<string, number>;
export const SHADOW_PROPERTIES: Map<string, number[]>;
/** @type {() => Map<string, Map<string, { spellings: Set<string>, classes: Set<string> }>>} */
export const getShorthandInitialKeywords: () => Map<string, Map<string, {
    spellings: Set<string>;
    classes: Set<string>;
}>>;
export const getShorthandLonghands: memoize.FunctionReturning<Map<string, Set<string>>>;
export const SLASH_BOX_SHORTHANDS: Set<string>;
export const SLASH_LONGHANDS: Map<string, string[]>;
export const SRGB_SPACE: "srgb";
export const STEPPED_FUNCTIONS: Set<string>;
/** @type {Map<string, number>} */
export const STEP_POSITION_MINIMUM_COUNTS: Map<string, number>;
export const SUBSTITUTION_FUNCTIONS: Set<string>;
/** @type {Map<string, number>} */
export const SUPPORTED_FROM: Map<string, number>;
/** @type {string[]} */
export const SUPPORT_BROWSERS: string[];
/** @type {Map<string, string | null>} */
export const UNSTATED_BROWSER_PREFIXES: Map<string, string | null>;
export const getSupportProfiles: memoize.FunctionReturning<Uint32Array<ArrayBuffer>>;
export const SVG_USER_UNIT_PROPERTIES: Set<string>;
export const SYSTEM_UI_STACK: "system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Noto Sans,Ubuntu,Cantarell,Helvetica Neue";
export const THROUGH_MATRIX: 2;
export const THROUGH_TRANSFER: 1;
export const TRANSITION_BEHAVIORS: Set<string>;
export const UNIT_CONVERSION_TARGETS: Set<string>;
/** @type {Map<string, [string, number]>} */
export const UNIT_GROUP_BASE: Map<string, [string, number]>;
export const UNSHARED_LONGHAND_KEYWORDS: Map<string, Set<string>>;
export const getValueSupportPacked: memoize.FunctionReturning<string>;
export const X_AXIS_TRANSFORMS: Map<string, string>;
export const ZERO_ANGLE_FUNCTIONS: Set<string>;
export const ZERO_UNIT_KEEPING_PROPERTIES: Set<string>;
/**
 * Add two doubles. Every sum a stylesheet can write is finite, and one that is
 * not is no value to print.
 * @param {number} a one term
 * @param {number} b the other
 * @returns {number | null} their sum, or `null`
 */
export function foldAdd(a: number, b: number): number | null;
/**
 * @param {number} a the value
 * @param {number} k the divisor
 * @returns {number | null} their quotient, or `null` where there is none
 */
export function foldDivide(a: number, k: number): number | null;
/**
 * @param {number} a the value
 * @param {number} k the factor
 * @returns {number | null} their product, or `null`
 */
export function foldMultiply(a: number, k: number): number | null;
import memoize = require("../util/memoize");
