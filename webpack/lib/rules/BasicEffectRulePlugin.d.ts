export = BasicEffectRulePlugin;
declare class BasicEffectRulePlugin {
    /**
     * Creates an instance of BasicEffectRulePlugin.
     * @param {BasicEffectRuleKeys} ruleProperty the rule property
     * @param {string=} effectType the effect type
     */
    constructor(ruleProperty: BasicEffectRuleKeys, effectType?: string | undefined);
    /** @type {BasicEffectRuleKeys} */
    ruleProperty: BasicEffectRuleKeys;
    /** @type {string | BasicEffectRuleKeys} */
    effectType: string | BasicEffectRuleKeys;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
     * @returns {void}
     */
    apply(ruleSetCompiler: RuleSetCompiler): void;
}
declare namespace BasicEffectRulePlugin {
    export { KeysOfTypes, BasicEffectRuleKeys };
}
import type RuleSetCompiler from "./RuleSetCompiler";
/**
 * Defines the keys of types type used by this module.
 */
type KeysOfTypes<T, V extends T[keyof T]> = import("./RuleSetCompiler").KeysOfTypes<T, V>;
type BasicEffectRuleKeys = KeysOfTypes<RuleSetRule, string | boolean | EXPECTED_OBJECT>;
import type { RuleSetRule } from "../../declarations/WebpackOptions";
