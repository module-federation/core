export = BasicEffectRulePlugin;
/** @typedef {import("./RuleSetCompiler")} RuleSetCompiler */
declare class BasicEffectRulePlugin {
  /**
   * @param {string} ruleProperty the rule property
   * @param {string=} effectType the effect type
   */
  constructor(ruleProperty: string, effectType?: string | undefined);
  ruleProperty: string;
  effectType: string;
  /**
   * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
   * @returns {void}
   */
  apply(ruleSetCompiler: RuleSetCompiler): void;
}
declare namespace BasicEffectRulePlugin {
  export { RuleSetCompiler };
}
type RuleSetCompiler = import('./RuleSetCompiler');
