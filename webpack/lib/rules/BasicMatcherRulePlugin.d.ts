export = BasicMatcherRulePlugin;
declare class BasicMatcherRulePlugin {
  /**
   * @param {BasicMatcherRuleKeys} ruleProperty the rule property
   * @param {string=} dataProperty the data property
   * @param {boolean=} invert if true, inverts the condition
   */
  constructor(
    ruleProperty: BasicMatcherRuleKeys,
    dataProperty?: string | undefined,
    invert?: boolean | undefined,
  );
  ruleProperty: BasicMatcherRuleKeys;
  dataProperty: string;
  invert: boolean;
  /**
   * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
   * @returns {void}
   */
  apply(ruleSetCompiler: RuleSetCompiler): void;
}
declare namespace BasicMatcherRulePlugin {
  export {
    RuleSetConditionOrConditions,
    RuleSetConditionOrConditionsAbsolute,
    RuleSetRule,
    RuleSetCompiler,
    KeysOfTypes,
    BasicMatcherRuleKeys,
  };
}
type RuleSetConditionOrConditions =
  import('../../declarations/WebpackOptions').RuleSetConditionOrConditions;
type RuleSetConditionOrConditionsAbsolute =
  import('../../declarations/WebpackOptions').RuleSetConditionOrConditionsAbsolute;
type RuleSetRule = import('../../declarations/WebpackOptions').RuleSetRule;
type RuleSetCompiler = import('./RuleSetCompiler');
type KeysOfTypes<
  T,
  V extends T[keyof T],
> = import('./RuleSetCompiler').KeysOfTypes<T, V>;
type BasicMatcherRuleKeys = KeysOfTypes<
  RuleSetRule,
  RuleSetConditionOrConditions | RuleSetConditionOrConditionsAbsolute
>;
