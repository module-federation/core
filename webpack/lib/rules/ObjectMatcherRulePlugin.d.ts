export = ObjectMatcherRulePlugin;
declare class ObjectMatcherRulePlugin {
    /**
     * @param {ObjectMatcherRuleKeys} ruleProperty the rule property
     * @param {keyof EffectData=} dataProperty the data property
     * @param {RuleConditionFunction=} additionalConditionFunction need to check
     */
    constructor(ruleProperty: ObjectMatcherRuleKeys, dataProperty?: keyof EffectData | undefined, additionalConditionFunction?: RuleConditionFunction | undefined);
    ruleProperty: ObjectMatcherRuleKeys;
    dataProperty: "with" | "assert" | "compiler" | "dependency" | "descriptionData" | "generator" | "issuer" | "issuerLayer" | "mimetype" | "parser" | "realResource" | "resource" | "resourceFragment" | "resourceQuery" | "scheme" | "attributes";
    additionalConditionFunction: import("./RuleSetCompiler").RuleConditionFunction;
    /**
     * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
     * @returns {void}
     */
    apply(ruleSetCompiler: RuleSetCompiler): void;
}
declare namespace ObjectMatcherRulePlugin {
    export { RuleSetConditionOrConditions, RuleSetRule, RuleSetCompiler, EffectData, RuleConditionFunction, KeysOfTypes, ObjectMatcherRuleKeys };
}
type RuleSetConditionOrConditions = import("../../declarations/WebpackOptions").RuleSetConditionOrConditions;
type RuleSetRule = import("../../declarations/WebpackOptions").RuleSetRule;
type RuleSetCompiler = import("./RuleSetCompiler");
type EffectData = import("./RuleSetCompiler").EffectData;
type RuleConditionFunction = import("./RuleSetCompiler").RuleConditionFunction;
type KeysOfTypes<T, V extends T[keyof T]> = import("./RuleSetCompiler").KeysOfTypes<T, V>;
type ObjectMatcherRuleKeys = KeysOfTypes<RuleSetRule, {
    [k: string]: RuleSetConditionOrConditions;
}>;
