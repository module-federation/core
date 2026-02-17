export type JSONSchema4 = import("json-schema").JSONSchema4;
export type JSONSchema6 = import("json-schema").JSONSchema6;
export type JSONSchema7 = import("json-schema").JSONSchema7;
export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;
export type Schema = JSONSchema & {
    absolutePath: boolean;
    instanceof: string;
    cli: {
        helper?: boolean;
        exclude?: boolean;
        description?: string;
        negatedDescription?: string;
        resetDescription?: string;
    };
};
export type PathItem = {
    /**
     * the part of the schema
     */
    schema: Schema;
    /**
     * the path in the config
     */
    path: string;
};
export type ProblemType = "unknown-argument" | "unexpected-non-array-in-path" | "unexpected-non-object-in-path" | "multiple-values-unexpected" | "invalid-value";
export type Value = string | number | boolean | RegExp;
export type Problem = {
    type: ProblemType;
    path: string;
    argument: string;
    value?: Value | undefined;
    index?: number | undefined;
    expected?: string | undefined;
};
export type LocalProblem = {
    type: ProblemType;
    path: string;
    expected?: string | undefined;
};
export type EnumValueObject = {
    [key: string]: EnumValue;
};
export type EnumValueArray = EnumValue[];
export type EnumValue = string | number | boolean | EnumValueObject | EnumValueArray | null;
export type ArgumentConfig = {
    description?: string | undefined;
    negatedDescription?: string | undefined;
    path: string;
    multiple: boolean;
    type: "enum" | "string" | "path" | "number" | "boolean" | "RegExp" | "reset";
    values?: EnumValue[] | undefined;
};
export type SimpleType = "string" | "number" | "boolean";
export type Argument = {
    description: string | undefined;
    simpleType: SimpleType;
    multiple: boolean;
    configs: ArgumentConfig[];
};
export type Flags = Record<string, Argument>;
export type ObjectConfiguration = Record<string, EXPECTED_ANY>;
export type Property = string | number;
export type ParsedValue = null | string | number | boolean | RegExp | EnumValue | [];
export type Values = Record<string, Value[]>;
export type PrintFunction = (value: EXPECTED_ANY) => string;
export type Colors = {
    reset: PrintFunction;
    bold: PrintFunction;
    dim: PrintFunction;
    italic: PrintFunction;
    underline: PrintFunction;
    inverse: PrintFunction;
    hidden: PrintFunction;
    strikethrough: PrintFunction;
    black: PrintFunction;
    red: PrintFunction;
    green: PrintFunction;
    yellow: PrintFunction;
    blue: PrintFunction;
    magenta: PrintFunction;
    cyan: PrintFunction;
    white: PrintFunction;
    gray: PrintFunction;
    bgBlack: PrintFunction;
    bgRed: PrintFunction;
    bgGreen: PrintFunction;
    bgYellow: PrintFunction;
    bgBlue: PrintFunction;
    bgMagenta: PrintFunction;
    bgCyan: PrintFunction;
    bgWhite: PrintFunction;
    blackBright: PrintFunction;
    redBright: PrintFunction;
    greenBright: PrintFunction;
    yellowBright: PrintFunction;
    blueBright: PrintFunction;
    magentaBright: PrintFunction;
    cyanBright: PrintFunction;
    whiteBright: PrintFunction;
    bgBlackBright: PrintFunction;
    bgRedBright: PrintFunction;
    bgGreenBright: PrintFunction;
    bgYellowBright: PrintFunction;
    bgBlueBright: PrintFunction;
    bgMagentaBright: PrintFunction;
    bgCyanBright: PrintFunction;
    bgWhiteBright: PrintFunction;
};
export type ColorsOptions = {
    /**
     * force use colors
     */
    useColor?: boolean | undefined;
};
/**
 * @typedef {{ reset: PrintFunction, bold: PrintFunction, dim: PrintFunction, italic: PrintFunction, underline: PrintFunction, inverse: PrintFunction, hidden: PrintFunction, strikethrough: PrintFunction, black: PrintFunction, red: PrintFunction, green: PrintFunction, yellow: PrintFunction, blue: PrintFunction, magenta: PrintFunction, cyan: PrintFunction, white: PrintFunction, gray: PrintFunction, bgBlack: PrintFunction, bgRed: PrintFunction, bgGreen: PrintFunction, bgYellow: PrintFunction, bgBlue: PrintFunction, bgMagenta: PrintFunction, bgCyan: PrintFunction, bgWhite: PrintFunction, blackBright: PrintFunction, redBright: PrintFunction, greenBright: PrintFunction, yellowBright: PrintFunction, blueBright: PrintFunction, magentaBright: PrintFunction, cyanBright: PrintFunction, whiteBright: PrintFunction, bgBlackBright: PrintFunction, bgRedBright: PrintFunction, bgGreenBright: PrintFunction, bgYellowBright: PrintFunction, bgBlueBright: PrintFunction, bgMagentaBright: PrintFunction, bgCyanBright: PrintFunction, bgWhiteBright: PrintFunction }} Colors
 */
/**
 * @typedef {object} ColorsOptions
 * @property {boolean=} useColor force use colors
 */
/**
 * @param {ColorsOptions=} options options
 * @returns {Colors} colors
 */
export function createColors({ useColor }?: ColorsOptions | undefined): Colors;
/** @typedef {import("json-schema").JSONSchema4} JSONSchema4 */
/** @typedef {import("json-schema").JSONSchema6} JSONSchema6 */
/** @typedef {import("json-schema").JSONSchema7} JSONSchema7 */
/** @typedef {JSONSchema4 | JSONSchema6 | JSONSchema7} JSONSchema */
/** @typedef {JSONSchema & { absolutePath: boolean, instanceof: string, cli: { helper?: boolean, exclude?: boolean, description?: string, negatedDescription?: string, resetDescription?: string } }} Schema */
/**
 * @typedef {object} PathItem
 * @property {Schema} schema the part of the schema
 * @property {string} path the path in the config
 */
/** @typedef {"unknown-argument" | "unexpected-non-array-in-path" | "unexpected-non-object-in-path" | "multiple-values-unexpected" | "invalid-value"} ProblemType */
/** @typedef {string | number | boolean | RegExp} Value */
/**
 * @typedef {object} Problem
 * @property {ProblemType} type
 * @property {string} path
 * @property {string} argument
 * @property {Value=} value
 * @property {number=} index
 * @property {string=} expected
 */
/**
 * @typedef {object} LocalProblem
 * @property {ProblemType} type
 * @property {string} path
 * @property {string=} expected
 */
/** @typedef {{ [key: string]: EnumValue }} EnumValueObject */
/** @typedef {EnumValue[]} EnumValueArray */
/** @typedef {string | number | boolean | EnumValueObject | EnumValueArray | null} EnumValue */
/**
 * @typedef {object} ArgumentConfig
 * @property {string=} description
 * @property {string=} negatedDescription
 * @property {string} path
 * @property {boolean} multiple
 * @property {"enum" | "string" | "path" | "number" | "boolean" | "RegExp" | "reset"} type
 * @property {EnumValue[]=} values
 */
/** @typedef {"string" | "number" | "boolean"} SimpleType */
/**
 * @typedef {object} Argument
 * @property {string | undefined} description
 * @property {SimpleType} simpleType
 * @property {boolean} multiple
 * @property {ArgumentConfig[]} configs
 */
/** @typedef {Record<string, Argument>} Flags */
/** @typedef {Record<string, EXPECTED_ANY>} ObjectConfiguration */
/**
 * @param {Schema=} schema a json schema to create arguments for (by default webpack schema is used)
 * @returns {Flags} object of arguments
 */
export function getArguments(schema?: Schema | undefined): Flags;
/**
 * @returns {boolean} true when colors supported, otherwise false
 */
export function isColorSupported(): boolean;
/** @typedef {Record<string, Value[]>} Values */
/**
 * @param {Flags} args object of arguments
 * @param {ObjectConfiguration} config configuration
 * @param {Values} values object with values
 * @returns {Problem[] | null} problems or null for success
 */
export function processArguments(args: Flags, config: ObjectConfiguration, values: Values): Problem[] | null;
