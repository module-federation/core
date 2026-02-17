export = BasicMatcherRulePlugin;
/** @typedef {import("./RuleSetCompiler")} RuleSetCompiler */
/** @typedef {import("./RuleSetCompiler").RuleCondition} RuleCondition */
declare class BasicMatcherRulePlugin {
  /**
   * @param {string} ruleProperty the rule property
   * @param {string=} dataProperty the data property
   * @param {boolean=} invert if true, inverts the condition
   */
  constructor(
    ruleProperty: string,
    dataProperty?: string | undefined,
    invert?: boolean | undefined,
  );
  ruleProperty: string;
  dataProperty: string;
  invert: boolean;
  /**
   * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
   * @returns {void}
   */
  apply(ruleSetCompiler: RuleSetCompiler): void;
}
declare namespace BasicMatcherRulePlugin {
  export { RuleSetCompiler, RuleCondition };
}
type RuleSetCompiler = import('./RuleSetCompiler');
type RuleCondition = import('./RuleSetCompiler').RuleCondition;
