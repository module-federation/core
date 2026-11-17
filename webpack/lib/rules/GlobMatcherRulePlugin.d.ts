export = GlobMatcherRulePlugin;
declare class GlobMatcherRulePlugin {
    /**
     * Creates an instance of GlobMatcherRulePlugin.
     * @param {GlobMatcherRuleKeys} ruleProperty the rule property
     * @param {string=} dataProperty the data property
     */
    constructor(ruleProperty: GlobMatcherRuleKeys, dataProperty?: string | undefined);
    /** @type {GlobMatcherRuleKeys} */
    ruleProperty: GlobMatcherRuleKeys;
    /** @type {string | GlobMatcherRuleKeys} */
    dataProperty: string | GlobMatcherRuleKeys;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
     * @returns {void}
     */
    apply(ruleSetCompiler: RuleSetCompiler): void;
}
declare namespace GlobMatcherRulePlugin {
    export { KeysOfTypes, GlobMatcherRuleKeys };
}
import type RuleSetCompiler from "./RuleSetCompiler";
/**
 * Defines the keys of types type used by this module.
 */
type KeysOfTypes<T, V extends T[keyof T]> = import("./RuleSetCompiler").KeysOfTypes<T, V>;
type GlobMatcherRuleKeys = KeysOfTypes<RuleSetRule, RuleSetGlob | RuleSetGlobs>;
import type { RuleSetRule } from "../../declarations/WebpackOptions";
import type { RuleSetGlob } from "../../declarations/WebpackOptions";
import type { RuleSetGlobs } from "../../declarations/WebpackOptions";
