export = RuleSetCompiler;
/**
 * @typedef {Object} RuleCondition
 * @property {string | string[]} property
 * @property {boolean} matchWhenEmpty
 * @property {function(string): boolean} fn
 */
/**
 * @typedef {Object} Condition
 * @property {boolean} matchWhenEmpty
 * @property {function(string): boolean} fn
 */
/**
 * @typedef {Object} CompiledRule
 * @property {RuleCondition[]} conditions
 * @property {(Effect|function(object): Effect[])[]} effects
 * @property {CompiledRule[]=} rules
 * @property {CompiledRule[]=} oneOf
 */
/**
 * @typedef {Object} Effect
 * @property {string} type
 * @property {any} value
 */
/**
 * @typedef {Object} RuleSet
 * @property {Map<string, any>} references map of references in the rule set (may grow over time)
 * @property {function(object): Effect[]} exec execute the rule set
 */
declare class RuleSetCompiler {
  constructor(plugins: any);
  hooks: Readonly<{
    /** @type {SyncHook<[string, object, Set<string>, CompiledRule, Map<string, any>]>} */
    rule: SyncHook<
      [string, object, Set<string>, CompiledRule, Map<string, any>]
    >;
  }>;
  /**
   * @param {object[]} ruleSet raw user provided rules
   * @returns {RuleSet} compiled RuleSet
   */
  compile(ruleSet: object[]): RuleSet;
  /**
   * @param {string} path current path
   * @param {object[]} rules the raw rules provided by user
   * @param {Map<string, any>} refs references
   * @returns {CompiledRule[]} rules
   */
  compileRules(
    path: string,
    rules: object[],
    refs: Map<string, any>,
  ): CompiledRule[];
  /**
   * @param {string} path current path
   * @param {object} rule the raw rule provided by user
   * @param {Map<string, any>} refs references
   * @returns {CompiledRule} normalized and compiled rule for processing
   */
  compileRule(path: string, rule: object, refs: Map<string, any>): CompiledRule;
  /**
   * @param {string} path current path
   * @param {any} condition user provided condition value
   * @returns {Condition} compiled condition
   */
  compileCondition(path: string, condition: any): Condition;
  /**
   * @param {Condition[]} conditions some conditions
   * @returns {Condition} merged condition
   */
  combineConditionsOr(conditions: Condition[]): Condition;
  /**
   * @param {Condition[]} conditions some conditions
   * @returns {Condition} merged condition
   */
  combineConditionsAnd(conditions: Condition[]): Condition;
  /**
   * @param {string} path current path
   * @param {any} value value at the error location
   * @param {string} message message explaining the problem
   * @returns {Error} an error object
   */
  error(path: string, value: any, message: string): Error;
}
declare namespace RuleSetCompiler {
  export { RuleCondition, Condition, CompiledRule, Effect, RuleSet };
}
import { SyncHook } from 'tapable';
type CompiledRule = {
  conditions: RuleCondition[];
  effects: (Effect | ((arg0: object) => Effect[]))[];
  rules?: CompiledRule[] | undefined;
  oneOf?: CompiledRule[] | undefined;
};
type RuleSet = {
  /**
   * map of references in the rule set (may grow over time)
   */
  references: Map<string, any>;
  /**
   * execute the rule set
   */
  exec: (arg0: object) => Effect[];
};
type Condition = {
  matchWhenEmpty: boolean;
  fn: (arg0: string) => boolean;
};
type RuleCondition = {
  property: string | string[];
  matchWhenEmpty: boolean;
  fn: (arg0: string) => boolean;
};
type Effect = {
  type: string;
  value: any;
};
