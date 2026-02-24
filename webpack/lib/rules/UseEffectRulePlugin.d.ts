export = UseEffectRulePlugin;
declare class UseEffectRulePlugin {
  /**
   * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
   * @returns {void}
   */
  apply(ruleSetCompiler: RuleSetCompiler): void;
}
declare namespace UseEffectRulePlugin {
  export {
    Falsy,
    RuleSetLoader,
    RuleSetLoaderOptions,
    RuleSetRule,
    RuleSetUse,
    RuleSetUseItem,
    RuleSetCompiler,
    Effect,
    EffectData,
    EffectUseType,
  };
}
type Falsy = import('../../declarations/WebpackOptions').Falsy;
type RuleSetLoader = import('../../declarations/WebpackOptions').RuleSetLoader;
type RuleSetLoaderOptions =
  import('../../declarations/WebpackOptions').RuleSetLoaderOptions;
type RuleSetRule = import('../../declarations/WebpackOptions').RuleSetRule;
type RuleSetUse = import('../../declarations/WebpackOptions').RuleSetUse;
type RuleSetUseItem =
  import('../../declarations/WebpackOptions').RuleSetUseItem;
type RuleSetCompiler = import('./RuleSetCompiler');
type Effect = import('./RuleSetCompiler').Effect;
type EffectData = import('./RuleSetCompiler').EffectData;
type EffectUseType = import('./RuleSetCompiler').EffectUseType;
