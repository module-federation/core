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
/**
 * Defines the path item type used by this module.
 */
export type PathItem = {
    /**
     * the part of the schema
     */
    schema: Schema;
    /**
     * the path in the config
     */
    path: string;
    /**
     * the JSON pointer segment of this schema part (absolute when starting with "#")
     */
    segment: string;
};
export type ProblemType = "unknown-argument" | "unexpected-non-array-in-path" | "unexpected-non-object-in-path" | "prototype-pollution-in-path" | "multiple-values-unexpected" | "invalid-value";
export type Value = string | number | boolean | RegExp;
/**
 * Defines the problem type used by this module.
 */
export type Problem = {
    type: ProblemType;
    path: string;
    argument: string;
    value?: Value | undefined;
    index?: number | undefined;
    expected?: string | undefined;
};
/**
 * Defines the local problem type used by this module.
 */
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
/**
 * Defines the argument config type used by this module.
 */
export type ArgumentConfig = {
    description?: string | undefined;
    negatedDescription?: string | undefined;
    path: string;
    multiple: boolean;
    type: "enum" | "string" | "path" | "number" | "boolean" | "RegExp" | "reset";
    values?: EnumValue[] | undefined;
};
export type SimpleType = "string" | "number" | "boolean";
/**
 * Defines the argument type used by this module.
 */
export type Argument = {
    description: string | undefined;
    simpleType: SimpleType;
    multiple: boolean;
    configs: ArgumentConfig[];
};
export type Flags = Record<string, Argument>;
export type ObjectConfiguration = Record<string, EXPECTED_ANY>;
export type ConfigurationValue = ObjectConfiguration | ParsedValue | undefined;
export type Property = string | number;
export type ParsedValue = null | string | number | boolean | RegExp | EnumValue | [];
export type Values = Record<string, Value[]>;
/** @import { JSONSchema4, JSONSchema6, JSONSchema7 } from "json-schema" */
/** @typedef {JSONSchema4 | JSONSchema6 | JSONSchema7} JSONSchema */
/** @typedef {JSONSchema & { absolutePath: boolean, instanceof: string, cli: { helper?: boolean, exclude?: boolean, description?: string, negatedDescription?: string, resetDescription?: string } }} Schema */
/**
 * Defines the path item type used by this module.
 * @typedef {object} PathItem
 * @property {Schema} schema the part of the schema
 * @property {string} path the path in the config
 * @property {string} segment the JSON pointer segment of this schema part (absolute when starting with "#")
 */
/** @typedef {"unknown-argument" | "unexpected-non-array-in-path" | "unexpected-non-object-in-path" | "prototype-pollution-in-path" | "multiple-values-unexpected" | "invalid-value"} ProblemType */
/** @typedef {string | number | boolean | RegExp} Value */
/**
 * Defines the problem type used by this module.
 * @typedef {object} Problem
 * @property {ProblemType} type
 * @property {string} path
 * @property {string} argument
 * @property {Value=} value
 * @property {number=} index
 * @property {string=} expected
 */
/**
 * Defines the local problem type used by this module.
 * @typedef {object} LocalProblem
 * @property {ProblemType} type
 * @property {string} path
 * @property {string=} expected
 */
/** @typedef {{ [key: string]: EnumValue }} EnumValueObject */
/** @typedef {EnumValue[]} EnumValueArray */
/** @typedef {string | number | boolean | EnumValueObject | EnumValueArray | null} EnumValue */
/**
 * Defines the argument config type used by this module.
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
 * Defines the argument type used by this module.
 * @typedef {object} Argument
 * @property {string | undefined} description
 * @property {SimpleType} simpleType
 * @property {boolean} multiple
 * @property {ArgumentConfig[]} configs
 */
/** @typedef {Record<string, Argument>} Flags */
/** @typedef {Record<string, EXPECTED_ANY>} ObjectConfiguration */
/**
 * Returns object of arguments.
 * @param {Schema=} schema a json schema to create arguments for (by default webpack schema is used)
 * @returns {Flags} object of arguments
 */
export function getArguments(schema?: Schema | undefined): Flags;
/** @typedef {Record<string, Value[]>} Values */
/**
 * Processes the provided arg.
 * @param {Flags} args object of arguments
 * @param {ObjectConfiguration} config configuration
 * @param {Values} values object with values
 * @returns {Problem[] | null} problems or null for success
 */
export function processArguments(args: Flags, config: ObjectConfiguration, values: Values): Problem[] | null;
import type { JSONSchema4 } from "json-schema";
import type { JSONSchema6 } from "json-schema";
import type { JSONSchema7 } from "json-schema";
