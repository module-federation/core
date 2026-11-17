export = UseEffectRulePlugin;
declare class UseEffectRulePlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {RuleSetCompiler} ruleSetCompiler the rule set compiler
     * @returns {void}
     */
    apply(ruleSetCompiler: RuleSetCompiler): void;
}
import type RuleSetCompiler from "./RuleSetCompiler";
