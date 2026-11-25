export = ObjectMatcherRulePlugin;
declare class ObjectMatcherRulePlugin {
    /**
     * Creates an instance of ObjectMatcherRulePlugin.
     * @param {ObjectMatcherRuleKeys} ruleProperty the rule property
     * @param {DataProperty=} dataProperty the data property
     * @param {RuleConditionFunction=} additionalConditionFunction need to check
     */
    constructor(ruleProperty: ObjectMatcherRuleKeys, dataProperty?: DataProperty | undefined, additionalConditionFunction?: RuleSetCompiler.RuleConditionFunction | undefined);
    /** @type {ObjectMatcherRuleKeys} */
    ruleProperty: ObjectMatcherRuleKeys;
    /** @type {DataProperty | ObjectMatcherRuleKeys} */
    dataProperty: DataProperty | ObjectMatcherRuleKeys;
    /** @type {RuleConditionFunction | undefined} */
    additionalConditionFunction: RuleSetCompiler.RuleConditionFunction | undefined;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
     * @returns {void}
     */
    apply(ruleSetCompiler: RuleSetCompiler): void;
}
declare namespace ObjectMatcherRulePlugin {
    export { KeysOfTypes, ObjectMatcherRuleKeys, DataProperty };
}
import type RuleSetCompiler from "./RuleSetCompiler";
/**
 * Defines the keys of types type used by this module.
 */
type KeysOfTypes<T, V extends T[keyof T]> = import("./RuleSetCompiler").KeysOfTypes<T, V>;
type ObjectMatcherRuleKeys = KeysOfTypes<RuleSetRule, {
    [k: string]: RuleSetConditionOrConditions;
}>;
type DataProperty = keyof RuleSetCompiler.EffectData;
import type { RuleSetRule } from "../../declarations/WebpackOptions";
import type { RuleSetConditionOrConditions } from "../../declarations/WebpackOptions";
