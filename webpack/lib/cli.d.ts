export type PathItem = {
  /**
   * the part of the schema
   */
  schema: any;
  /**
   * the path in the config
   */
  path: string;
};
export type ProblemType =
  | 'unknown-argument'
  | 'unexpected-non-array-in-path'
  | 'unexpected-non-object-in-path'
  | 'multiple-values-unexpected'
  | 'invalid-value';
export type Problem = {
  type: ProblemType;
  path: string;
  argument: string;
  value?: any | undefined;
  index?: number | undefined;
  expected?: string | undefined;
};
export type LocalProblem = {
  type: ProblemType;
  path: string;
  expected?: string | undefined;
};
export type ArgumentConfig = {
  description: string;
  negatedDescription?: string;
  path: string;
  multiple: boolean;
  type: 'enum' | 'string' | 'path' | 'number' | 'boolean' | 'RegExp' | 'reset';
  values?: any[] | undefined;
};
export type Argument = {
  description: string;
  simpleType: 'string' | 'number' | 'boolean';
  multiple: boolean;
  configs: ArgumentConfig[];
};
/**
 * @typedef {Object} PathItem
 * @property {any} schema the part of the schema
 * @property {string} path the path in the config
 */
/** @typedef {"unknown-argument" | "unexpected-non-array-in-path" | "unexpected-non-object-in-path" | "multiple-values-unexpected" | "invalid-value"} ProblemType */
/**
 * @typedef {Object} Problem
 * @property {ProblemType} type
 * @property {string} path
 * @property {string} argument
 * @property {any=} value
 * @property {number=} index
 * @property {string=} expected
 */
/**
 * @typedef {Object} LocalProblem
 * @property {ProblemType} type
 * @property {string} path
 * @property {string=} expected
 */
/**
 * @typedef {Object} ArgumentConfig
 * @property {string} description
 * @property {string} [negatedDescription]
 * @property {string} path
 * @property {boolean} multiple
 * @property {"enum"|"string"|"path"|"number"|"boolean"|"RegExp"|"reset"} type
 * @property {any[]=} values
 */
/**
 * @typedef {Object} Argument
 * @property {string} description
 * @property {"string"|"number"|"boolean"} simpleType
 * @property {boolean} multiple
 * @property {ArgumentConfig[]} configs
 */
/**
 * @param {any=} schema a json schema to create arguments for (by default webpack schema is used)
 * @returns {Record<string, Argument>} object of arguments
 */
export function getArguments(
  schema?: any | undefined,
): Record<string, Argument>;
/**
 * @param {Record<string, Argument>} args object of arguments
 * @param {any} config configuration
 * @param {Record<string, string | number | boolean | RegExp | (string | number | boolean | RegExp)[]>} values object with values
 * @returns {Problem[] | null} problems or null for success
 */
export function processArguments(
  args: Record<string, Argument>,
  config: any,
  values: Record<
    string,
    string | number | boolean | RegExp | (string | number | boolean | RegExp)[]
  >,
): Problem[] | null;
