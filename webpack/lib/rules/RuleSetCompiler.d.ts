export = RuleSetCompiler;
/** @typedef {import("enhanced-resolve").ResolveRequest} ResolveRequest */
/** @typedef {import("../../declarations/WebpackOptions").Falsy} Falsy */
/** @typedef {import("../../declarations/WebpackOptions").RuleSetLoaderOptions} RuleSetLoaderOptions */
/** @typedef {import("../../declarations/WebpackOptions").RuleSetRule} RuleSetRule */
/** @typedef {(Falsy | RuleSetRule)[]} RuleSetRules */
/**
 * @typedef {(value: EffectData[keyof EffectData]) => boolean} RuleConditionFunction
 */
/**
 * @typedef {object} RuleCondition
 * @property {string | string[]} property
 * @property {boolean} matchWhenEmpty
 * @property {RuleConditionFunction} fn
 */
/**
 * @typedef {object} Condition
 * @property {boolean} matchWhenEmpty
 * @property {RuleConditionFunction} fn
 */
/**
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
 * @property {string=} compiler
 * @property {string} issuer
 * @property {string} issuerLayer
 */
/**
 * @typedef {object} CompiledRule
 * @property {RuleCondition[]} conditions
 * @property {(Effect | ((effectData: EffectData) => Effect[]))[]} effects
 * @property {CompiledRule[]=} rules
 * @property {CompiledRule[]=} oneOf
 */
/** @typedef {"use" | "use-pre" | "use-post"} EffectUseType */
/**
 * @typedef {object} EffectUse
 * @property {EffectUseType} type
 * @property {{ loader: string, options?: string | null | Record<string, EXPECTED_ANY>, ident?: string }} value
 */
/**
 * @typedef {object} EffectBasic
 * @property {string} type
 * @property {EXPECTED_ANY} value
 */
/** @typedef {EffectUse | EffectBasic} Effect */
/** @typedef {Map<string, RuleSetLoaderOptions>} References */
/**
 * @typedef {object} RuleSet
 * @property {References} references map of references in the rule set (may grow over time)
 * @property {(effectData: EffectData) => Effect[]} exec execute the rule set
 */
/**
 * @template T
 * @template {T[keyof T]} V
 * @typedef {({ [key in keyof Required<T>]: Required<T>[key] extends V ? key : never })[keyof T]} KeysOfTypes
 */
/** @typedef {Set<string>} UnhandledProperties */
/** @typedef {{ apply: (ruleSetCompiler: RuleSetCompiler) => void }} RuleSetPlugin */
declare class RuleSetCompiler {
    /**
     * @param {RuleSetPlugin[]} plugins plugins
     */
    constructor(plugins: RuleSetPlugin[]);
    hooks: Readonly<{
        /** @type {SyncHook<[string, RuleSetRule, UnhandledProperties, CompiledRule, References]>} */
        rule: SyncHook<[string, RuleSetRule, UnhandledProperties, CompiledRule, References]>;
    }>;
    /**
     * @param {RuleSetRules} ruleSet raw user provided rules
     * @returns {RuleSet} compiled RuleSet
     */
    compile(ruleSet: RuleSetRules): RuleSet;
    /**
     * @param {string} path current path
     * @param {RuleSetRules} rules the raw rules provided by user
     * @param {References} refs references
     * @returns {CompiledRule[]} rules
     */
    compileRules(path: string, rules: RuleSetRules, refs: References): CompiledRule[];
    /**
     * @param {string} path current path
     * @param {RuleSetRule} rule the raw rule provided by user
     * @param {References} refs references
     * @returns {CompiledRule} normalized and compiled rule for processing
     */
    compileRule(path: string, rule: RuleSetRule, refs: References): CompiledRule;
    /**
     * @param {string} path current path
     * @param {RuleSetLoaderOptions} condition user provided condition value
     * @returns {Condition} compiled condition
     */
    compileCondition(path: string, condition: RuleSetLoaderOptions): Condition;
    /**
     * @param {Condition[]} conditions some conditions
     * @returns {Condition} merged condition
     */
    combineConditionsOr(conditions: Condition[]): Condition;
    /**
     * @param {Condition[]} conditions some conditions
     * @returns {Condition} merged condition
     */
    combineConditionsAnd(conditions: Condition[]): Condition;
    /**
     * @param {string} path current path
     * @param {EXPECTED_ANY} value value at the error location
     * @param {string} message message explaining the problem
     * @returns {Error} an error object
     */
    error(path: string, value: EXPECTED_ANY, message: string): Error;
}
declare namespace RuleSetCompiler {
    export { ResolveRequest, Falsy, RuleSetLoaderOptions, RuleSetRule, RuleSetRules, RuleConditionFunction, RuleCondition, Condition, EffectData, CompiledRule, EffectUseType, EffectUse, EffectBasic, Effect, References, RuleSet, KeysOfTypes, UnhandledProperties, RuleSetPlugin };
}
import { SyncHook } from "tapable";
type ResolveRequest = import("enhanced-resolve").ResolveRequest;
type Falsy = import("../../declarations/WebpackOptions").Falsy;
type RuleSetLoaderOptions = import("../../declarations/WebpackOptions").RuleSetLoaderOptions;
type RuleSetRule = import("../../declarations/WebpackOptions").RuleSetRule;
type RuleSetRules = (Falsy | RuleSetRule)[];
type RuleConditionFunction = (value: EffectData[keyof EffectData]) => boolean;
type RuleCondition = {
    property: string | string[];
    matchWhenEmpty: boolean;
    fn: RuleConditionFunction;
};
type Condition = {
    matchWhenEmpty: boolean;
    fn: RuleConditionFunction;
};
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
    compiler?: string | undefined;
    issuer: string;
    issuerLayer: string;
};
type CompiledRule = {
    conditions: RuleCondition[];
    effects: (Effect | ((effectData: EffectData) => Effect[]))[];
    rules?: CompiledRule[] | undefined;
    oneOf?: CompiledRule[] | undefined;
};
type EffectUseType = "use" | "use-pre" | "use-post";
type EffectUse = {
    type: EffectUseType;
    value: {
        loader: string;
        options?: string | null | Record<string, EXPECTED_ANY>;
        ident?: string;
    };
};
type EffectBasic = {
    type: string;
    value: EXPECTED_ANY;
};
type Effect = EffectUse | EffectBasic;
type References = Map<string, RuleSetLoaderOptions>;
type RuleSet = {
    /**
     * map of references in the rule set (may grow over time)
     */
    references: References;
    /**
     * execute the rule set
     */
    exec: (effectData: EffectData) => Effect[];
};
type KeysOfTypes<T, V extends T[keyof T]> = ({ [key in keyof Required<T>]: Required<T>[key] extends V ? key : never; })[keyof T];
type UnhandledProperties = Set<string>;
type RuleSetPlugin = {
    apply: (ruleSetCompiler: RuleSetCompiler) => void;
};
