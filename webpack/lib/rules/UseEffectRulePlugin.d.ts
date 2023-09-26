export = UseEffectRulePlugin;
/** @typedef {import("./RuleSetCompiler")} RuleSetCompiler */
/** @typedef {import("./RuleSetCompiler").Effect} Effect */
declare class UseEffectRulePlugin {
  /**
   * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
   * @returns {void}
   */
  apply(ruleSetCompiler: RuleSetCompiler): void;
  useItemToEffects(path: any, item: any): void;
}
declare namespace UseEffectRulePlugin {
  export { RuleSetCompiler, Effect };
}
type RuleSetCompiler = import('./RuleSetCompiler');
type Effect = import('./RuleSetCompiler').Effect;
