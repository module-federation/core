export = RuleSetCompiler;
/** @import { ResolveRequest } from "enhanced-resolve" */
/** @import { JsonValue } from "../fs/fs" */
/**
 * @import {
 * 	Falsy,
 * 	RuleSetUseItem,
 * 	RuleSetLoaderOptions,
 * 	RuleSetRule,
 * 	RuleSetConditionAbsolute,
 * 	RuleSetGlob,
 * 	RuleSetGlobs
 * } from "../../declarations/WebpackOptions"
 */
/** @typedef {(Falsy | RuleSetRule)[]} RuleSetRules */
/**
 * Defines the rule condition function type used by this module.
 * @typedef {(value: EffectData[keyof EffectData]) => boolean} RuleConditionFunction
 */
/**
 * Defines the rule condition type used by this module.
 * @typedef {object} RuleCondition
 * @property {string | string[]} property
 * @property {boolean} matchWhenEmpty
 * @property {RuleConditionFunction} fn
 */
/**
 * Defines the condition type used by this module.
 * @typedef {object} Condition
 * @property {boolean} matchWhenEmpty
 * @property {RuleConditionFunction} fn
 */
/**
 * Defines the effect data type used by this module.
 * @typedef {object} EffectData
 * @property {string=} resource
 * @property {string=} realResource
 * @property {string=} resourceQuery
 * @property {string=} resourceFragment
 * @property {string=} scheme
 * @property {ImportAttributes=} attributes
 * @property {string=} mimetype
 * @property {string} dependency
 * @property {ResolveRequest["descriptionFileData"]=} descriptionData
 * @property {ResolveRequest["relativePath"]=} descriptionRelativePath
 * @property {string=} compiler
 * @property {string} issuer
 * @property {string} issuerLayer
 * @property {string=} phase
 */
/**
 * Defines the compiled rule type used by this module.
 * @typedef {object} CompiledRule
 * @property {string} path
 * @property {RuleSetRule} raw
 * @property {boolean} used
 * @property {RuleCondition[]} conditions
 * @property {(Effect | ((effectData: EffectData) => Effect[]))[]} effects
 * @property {CompiledRule[]=} rules
 * @property {CompiledRule[]=} oneOf
 */
/** @typedef {"use" | "use-pre" | "use-post"} EffectUseType */
/**
 * Defines the effect use type used by this module.
 * @typedef {object} EffectUse
 * @property {EffectUseType} type
 * @property {{ loader: string, options?: RuleSetLoaderOptions | null, ident?: string }} value
 */
/**
 * Defines the effect basic type used by this module.
 * @typedef {object} EffectBasic
 * @property {string} type
 * @property {EXPECTED_ANY} value
 */
/** @typedef {EffectUse | EffectBasic} Effect */
/** @typedef {Map<string, RuleSetLoaderOptions>} References */
/**
 * Defines the rule set type used by this module.
 * @typedef {object} RuleSet
 * @property {References} references map of references in the rule set (may grow over time)
 * @property {(effectData: EffectData) => Effect[]} exec execute the rule set
 * @property {() => CompiledRule[]} unusedRules the rules that never matched, outermost first
 */
/**
 * Defines the keys of types type used by this module.
 * @template T
 * @template {T[keyof T]} V
 * @typedef {({ [key in keyof Required<T>]: Required<T>[key] extends V ? key : never })[keyof T]} KeysOfTypes
 */
/** @typedef {Set<string>} UnhandledProperties */
/** @typedef {(data: EffectData) => (RuleSetUseItem | (Falsy | RuleSetUseItem)[])} RuleSetUseFn */
/** @typedef {(value: string) => boolean} RuleSetConditionFn */
/** @typedef {{ apply: (ruleSetCompiler: RuleSetCompiler) => void }} RuleSetPlugin */
declare class RuleSetCompiler {
    /**
     * Best-effort detection of a user-registered loader (or explicit module type)
     * for a resource, without building the whole rule set. Used to resolve the
     * `experiments.css`/`experiments.html`/`experiments.asyncWebAssembly` "auto"
     * defaults: when the user already handles these files the built-in module type
     * stays off, so enabling it by default is non-breaking.
     *
     * `include`/`exclude` are treated leniently — a matching `test`/`resource`/
     * `include` with a loader counts even when another condition would narrow it —
     * so a loader scoped to e.g. `include: /src/` still keeps the built-in type off
     * and those files are not double-processed. `enforce: "pre"`/`"post"` loaders
     * are ignored: they don't establish the module type (e.g. a stylelint pre-loader
     * must not suppress the built-in css type). A `test` regexp that references the
     * extension (e.g. `/source\.css$/`) also counts even if the sample path itself
     * doesn't match, so a loader scoped to specific filenames is still detected; a
     * `glob` condition naming the extension counts the same way.
     * @param {import("../../declarations/WebpackOptions").RuleSetRules | undefined} rules user `module.rules`
     * @param {string} resource sample resource path (e.g. `"/file.css"`)
     * @param {boolean=} inherited whether an enclosing rule already matched the resource
     * @returns {boolean} whether a rule assigns a loader or module type to the resource
     */
    static hasRuleForResource(rules: import("../../declarations/WebpackOptions").RuleSetRules | undefined, resource: string, inherited?: boolean | undefined): boolean;
    /**
     * Creates an instance of RuleSetCompiler.
     * @param {RuleSetPlugin[]} plugins plugins
     */
    constructor(plugins: RuleSetPlugin[]);
    hooks: Readonly<{
        /** @type {SyncHook<[string, RuleSetRule, UnhandledProperties, CompiledRule, References]>} */
        rule: SyncHook<[string, RuleSetRule, UnhandledProperties, CompiledRule, References]>;
    }>;
    /**
     * Returns compiled RuleSet.
     * @param {RuleSetRules} ruleSet raw user provided rules
     * @returns {RuleSet} compiled RuleSet
     */
    compile(ruleSet: RuleSetRules): RuleSet;
    /**
     * Returns rules.
     * @param {string} path current path
     * @param {RuleSetRules} rules the raw rules provided by user
     * @param {References} refs references
     * @returns {CompiledRule[]} rules
     */
    compileRules(path: string, rules: RuleSetRules, refs: References): CompiledRule[];
    /**
     * Returns normalized and compiled rule for processing.
     * @param {string} path current path
     * @param {RuleSetRule} rule the raw rule provided by user
     * @param {References} refs references
     * @returns {CompiledRule} normalized and compiled rule for processing
     */
    compileRule(path: string, rule: RuleSetRule, refs: References): CompiledRule;
    /**
     * Returns compiled condition.
     * @param {string} path current path
     * @param {RuleSetLoaderOptions} condition user provided condition value
     * @returns {Condition} compiled condition
     */
    compileCondition(path: string, condition: RuleSetLoaderOptions): Condition;
    /**
     * Returns a compiled glob condition. Unlike a regexp it matches the same way
     * on every OS: `\` is a path separator in both the pattern and the tested
     * value, and a relative pattern matches at any depth. Patterns are OR-ed,
     * a `!` prefix subtracts, and a list of only `!` patterns subtracts from
     * everything.
     * @param {string} path current path
     * @param {string | string[]} glob user provided glob pattern(s)
     * @returns {Condition} compiled condition
     */
    compileGlobCondition(path: string, glob: string | string[]): Condition;
    /**
     * Combine conditions or.
     * @param {Condition[]} conditions some conditions
     * @returns {Condition} merged condition
     */
    combineConditionsOr(conditions: Condition[]): Condition;
    /**
     * Combine conditions and.
     * @param {Condition[]} conditions some conditions
     * @returns {Condition} merged condition
     */
    combineConditionsAnd(conditions: Condition[]): Condition;
    /**
     * Returns an error object.
     * @template T
     * @param {string} path current path
     * @param {T} value value at the error location
     * @param {string} message message explaining the problem
     * @returns {Error} an error object
     */
    error<T>(path: string, value: T, message: string): Error;
}
declare namespace RuleSetCompiler {
    export { RuleSetRules, RuleConditionFunction, RuleCondition, Condition, EffectData, CompiledRule, EffectUseType, EffectUse, EffectBasic, Effect, References, RuleSet, KeysOfTypes, UnhandledProperties, RuleSetUseFn, RuleSetConditionFn, RuleSetPlugin };
}
import { SyncHook } from "tapable";
import type { RuleSetRule } from "../../declarations/WebpackOptions";
import type { RuleSetLoaderOptions } from "../../declarations/WebpackOptions";
type RuleSetRules = (Falsy | RuleSetRule)[];
/**
 * Defines the rule condition function type used by this module.
 */
type RuleConditionFunction = (value: EffectData[keyof EffectData]) => boolean;
/**
 * Defines the rule condition type used by this module.
 */
type RuleCondition = {
    property: string | string[];
    matchWhenEmpty: boolean;
    fn: RuleConditionFunction;
};
/**
 * Defines the condition type used by this module.
 */
type Condition = {
    matchWhenEmpty: boolean;
    fn: RuleConditionFunction;
};
/**
 * Defines the effect data type used by this module.
 */
type EffectData = {
    resource?: string | undefined;
    realResource?: string | undefined;
    resourceQuery?: string | undefined;
    resourceFragment?: string | undefined;
    scheme?: string | undefined;
    attributes?: ImportAttributes | undefined;
    mimetype?: string | undefined;
    dependency: string;
    descriptionData?: ResolveRequest["descriptionFileData"] | undefined;
    descriptionRelativePath?: ResolveRequest["relativePath"] | undefined;
    compiler?: string | undefined;
    issuer: string;
    issuerLayer: string;
    phase?: string | undefined;
};
/**
 * Defines the compiled rule type used by this module.
 */
type CompiledRule = {
    path: string;
    raw: RuleSetRule;
    used: boolean;
    conditions: RuleCondition[];
    effects: (Effect | ((effectData: EffectData) => Effect[]))[];
    rules?: CompiledRule[] | undefined;
    oneOf?: CompiledRule[] | undefined;
};
type EffectUseType = "use" | "use-pre" | "use-post";
/**
 * Defines the effect use type used by this module.
 */
type EffectUse = {
    type: EffectUseType;
    value: {
        loader: string;
        options?: RuleSetLoaderOptions | null;
        ident?: string;
    };
};
/**
 * Defines the effect basic type used by this module.
 */
type EffectBasic = {
    type: string;
    value: EXPECTED_ANY;
};
type Effect = EffectUse | EffectBasic;
type References = Map<string, RuleSetLoaderOptions>;
/**
 * Defines the rule set type used by this module.
 */
type RuleSet = {
    /**
     * map of references in the rule set (may grow over time)
     */
    references: References;
    /**
     * execute the rule set
     */
    exec: (effectData: EffectData) => Effect[];
    /**
     * the rules that never matched, outermost first
     */
    unusedRules: () => CompiledRule[];
};
/**
 * Defines the keys of types type used by this module.
 */
type KeysOfTypes<T, V extends T[keyof T]> = ({ [key in keyof Required<T>]: Required<T>[key] extends V ? key : never; })[keyof T];
type UnhandledProperties = Set<string>;
type RuleSetUseFn = (data: EffectData) => (RuleSetUseItem | (Falsy | RuleSetUseItem)[]);
type RuleSetConditionFn = (value: string) => boolean;
type RuleSetPlugin = {
    apply: (ruleSetCompiler: RuleSetCompiler) => void;
};
import type { Falsy } from "../../declarations/WebpackOptions";
import type { ResolveRequest } from "enhanced-resolve";
import type { RuleSetUseItem } from "../../declarations/WebpackOptions";
