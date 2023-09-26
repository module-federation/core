export = ObjectMatcherRulePlugin;
/** @typedef {import("./RuleSetCompiler")} RuleSetCompiler */
/** @typedef {import("./RuleSetCompiler").RuleCondition} RuleCondition */
declare class ObjectMatcherRulePlugin {
  constructor(ruleProperty: any, dataProperty: any);
  ruleProperty: any;
  dataProperty: any;
  /**
   * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
   * @returns {void}
   */
  apply(ruleSetCompiler: RuleSetCompiler): void;
}
declare namespace ObjectMatcherRulePlugin {
  export { RuleSetCompiler, RuleCondition };
}
type RuleSetCompiler = import('./RuleSetCompiler');
type RuleCondition = import('./RuleSetCompiler').RuleCondition;
