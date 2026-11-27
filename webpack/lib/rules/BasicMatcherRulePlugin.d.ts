export = BasicMatcherRulePlugin;
declare class BasicMatcherRulePlugin {
    /**
     * Creates an instance of BasicMatcherRulePlugin.
     * @param {BasicMatcherRuleKeys} ruleProperty the rule property
     * @param {string=} dataProperty the data property
     * @param {boolean=} invert if true, inverts the condition
     */
    constructor(ruleProperty: BasicMatcherRuleKeys, dataProperty?: string | undefined, invert?: boolean | undefined);
    /** @type {BasicMatcherRuleKeys} */
    ruleProperty: BasicMatcherRuleKeys;
    /** @type {string | BasicMatcherRuleKeys} */
    dataProperty: string | BasicMatcherRuleKeys;
    /** @type {boolean} */
    invert: boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
     * @returns {void}
     */
    apply(ruleSetCompiler: RuleSetCompiler): void;
}
declare namespace BasicMatcherRulePlugin {
    export { KeysOfTypes, BasicMatcherRuleKeys };
}
import type RuleSetCompiler from "./RuleSetCompiler";
/**
 * Defines the keys of types type used by this module.
 */
type KeysOfTypes<T, V extends T[keyof T]> = import("./RuleSetCompiler").KeysOfTypes<T, V>;
type BasicMatcherRuleKeys = KeysOfTypes<RuleSetRule, RuleSetConditionOrConditions | RuleSetConditionOrConditionsAbsolute>;
import type { RuleSetRule } from "../../declarations/WebpackOptions";
import type { RuleSetConditionOrConditions } from "../../declarations/WebpackOptions";
import type { RuleSetConditionOrConditionsAbsolute } from "../../declarations/WebpackOptions";
