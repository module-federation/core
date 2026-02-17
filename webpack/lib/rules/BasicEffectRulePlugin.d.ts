export = BasicEffectRulePlugin;
declare class BasicEffectRulePlugin {
    /**
     * @param {BasicEffectRuleKeys} ruleProperty the rule property
     * @param {string=} effectType the effect type
     */
    constructor(ruleProperty: BasicEffectRuleKeys, effectType?: string | undefined);
    ruleProperty: BasicEffectRuleKeys;
    effectType: string;
    /**
     * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
     * @returns {void}
     */
    apply(ruleSetCompiler: RuleSetCompiler): void;
}
declare namespace BasicEffectRulePlugin {
    export { RuleSetRule, RuleSetCompiler, KeysOfTypes, BasicEffectRuleKeys };
}
type RuleSetRule = import("../../declarations/WebpackOptions").RuleSetRule;
type RuleSetCompiler = import("./RuleSetCompiler");
type KeysOfTypes<T, V extends T[keyof T]> = import("./RuleSetCompiler").KeysOfTypes<T, V>;
type BasicEffectRuleKeys = KeysOfTypes<RuleSetRule, string | boolean | {
    [k: string]: EXPECTED_ANY;
}>;
