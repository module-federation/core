export = DefinePlugin;
/**
 * @typedef {ReturnType<typeof createCompilationHooks>} DefinePluginHooks
 */
/** @typedef {Record<string, CodeValue>} Definitions */
declare class DefinePlugin {
    /**
     * Creates a runtime value. Async generators resolve once per module and key
     * before parsing; promise-returning functions require the `async` option.
     * @param {GeneratorFn} fn generator function
     * @param {true | string[] | RuntimeValueOptions=} options options
     * @returns {RuntimeValue} runtime value
     */
    static runtimeValue(fn: GeneratorFn, options?: (true | string[] | RuntimeValueOptions) | undefined): RuntimeValue;
    /**
     * Create a new define plugin
     * @param {Definitions} definitions A map of global object definitions
     */
    constructor(definitions: Definitions);
    /** @type {Definitions} */
    definitions: Definitions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DefinePlugin {
    export { getCompilationHooks, VALUE_DEP_MAIN, VALUE_DEP_PREFIX, getDeclaredKeys, getMergedDefinitionNode, getRuntimeRequirements, markInternal, stringifyMergedDefinition, toPropertyKey, CodeValuePrimitive, CodeValue, RuntimeValueOptions, GeneratedValue, GeneratorFn, ObjKeys, AsiSafe, MergedDefinitionMap, MergedDefinitionNode, MergedDefinitions, ResolvedRuntimeValue, ResolvedRuntimeValues, AsyncRuntimeValue, AsyncRuntimeDefinitions, DefinePluginHooks, Definitions };
}
import type Compiler from "../Compiler";
declare class RuntimeValue {
    /**
     * Creates an instance of RuntimeValue.
     * @param {GeneratorFn} fn generator function
     * @param {true | string[] | RuntimeValueOptions=} options options
     */
    constructor(fn: GeneratorFn, options?: (true | string[] | RuntimeValueOptions) | undefined);
    /** @type {GeneratorFn} */
    fn: GeneratorFn;
    /** @type {true | RuntimeValueOptions} */
    options: true | RuntimeValueOptions;
    /**
     * Resolved before the module is parsed, since the parser cannot wait.
     * Use the option for promise-returning functions not declared `async`.
     * @type {boolean}
     */
    async: boolean;
    get fileDependencies(): true | string[];
    /**
     * Records what the value is computed from on the module it is rendered into,
     * so a change to any of it rebuilds that module.
     * @param {NormalModule} module the module the value is rendered into
     * @param {string} key the defined key
     * @returns {void}
     */
    addDependencies(module: NormalModule, key: string): void;
    /**
     * Runs the generator for one module.
     * @param {NormalModule} module the module the value is rendered into
     * @param {ValueCacheVersions} valueCacheVersions valueCacheVersions
     * @param {string} key the defined key
     * @returns {GeneratedValue} the value, or a promise of it
     */
    call(module: NormalModule, valueCacheVersions: Module.ValueCacheVersions, key: string): GeneratedValue;
    /**
     * Returns code.
     * @param {JavascriptParser} parser the parser
     * @param {ValueCacheVersions} valueCacheVersions valueCacheVersions
     * @param {string} key the defined key
     * @returns {CodeValuePrimitive} code
     */
    exec(parser: JavascriptParser, valueCacheVersions: Module.ValueCacheVersions, key: string): CodeValuePrimitive;
    getCacheVersion(): string;
}
declare var getCompilationHooks: (compilation: import("../Compilation")) => {
    /**
     * @type {SyncWaterfallHook<[Record<string, CodeValue>]>}
     * @since 5.104.0
     */
    definitions: SyncWaterfallHook<[Record<string, CodeValue>]>;
};
declare const VALUE_DEP_MAIN: "webpack/DefinePlugin_hash";
declare const VALUE_DEP_PREFIX: "webpack/DefinePlugin ";
/**
 * The keys the configuration declared, webpack's own excluded.
 * @param {Compilation} compilation the compilation
 * @returns {Set<string> | undefined} the keys, or undefined when none were collected
 */
declare function getDeclaredKeys(compilation: Compilation): Set<string> | undefined;
/**
 * Returns the merged definition node for a definition key.
 * @param {Compilation} compilation the compilation
 * @param {string} key definition key
 * @returns {MergedDefinitionNode | undefined} merged node
 */
declare function getMergedDefinitionNode(compilation: Compilation, key: string): MergedDefinitionNode | undefined;
/**
 * Runtime requirements of replacement code referencing the require function.
 * @param {string} code replacement code
 * @returns {string[] | undefined} runtime requirements
 */
declare function getRuntimeRequirements(code: string): string[] | undefined;
/**
 * Marks an instance as webpack's own, so `performance.unusedConfig` never
 * reports the keys it declares against the user.
 * @param {DefinePlugin} plugin the instance webpack constructed itself
 * @returns {DefinePlugin} the same instance
 */
declare function markInternal(plugin: DefinePlugin): DefinePlugin;
/**
 * Renders a merged definition node to raw code (object literal for map nodes).
 * @param {Compilation} compilation the compilation
 * @param {JavascriptParser} parser Parser
 * @param {MergedDefinitionNode} node merged node
 * @param {string} key the defined key
 * @param {ObjKeys=} objKeys used keys
 * @returns {string} code
 */
declare function stringifyMergedDefinition(compilation: Compilation, parser: JavascriptParser, node: MergedDefinitionNode, key: string, objKeys?: ObjKeys | undefined): string;
/**
 * Object literal key code; `__proto__` must be computed to stay an own property.
 * @param {string} key property key
 * @returns {string} property key code
 */
declare function toPropertyKey(key: string): string;
type CodeValuePrimitive = null | undefined | RegExp | EXPECTED_FUNCTION | string | number | boolean | bigint | undefined;
type CodeValue = RecursiveArrayOrRecord<CodeValuePrimitive | RuntimeValue>;
/**
 * Defines the runtime value options type used by this module.
 */
type RuntimeValueOptions = {
    fileDependencies?: string[] | undefined;
    contextDependencies?: string[] | undefined;
    missingDependencies?: string[] | undefined;
    buildDependencies?: string[] | undefined;
    version?: (string | (() => string)) | undefined;
    /**
     * resolve the generator before parsing, including promise-returning functions not declared `async`
     */
    async?: boolean | undefined;
};
type GeneratedValue = CodeValuePrimitive | PromiseLike<CodeValuePrimitive>;
type GeneratorFn = (value: {
    module: NormalModule;
    key: string;
    readonly version: Module.ValueCacheVersion;
}) => GeneratedValue;
type ObjKeys = Set<string> | null;
type AsiSafe = boolean | undefined | null;
type MergedDefinitionMap = Map<string, MergedDefinitionNode>;
type MergedDefinitionNode = CodeValue | MergedDefinitionMap;
/**
 * Merged view of the definitions of every DefinePlugin instance.
 */
type MergedDefinitions = {
    /**
     * the compilation
     */
    compilation: Compilation;
    /**
     * flat definitions
     */
    definitions: Definitions;
    /**
     * nested view (dotted keys expanded)
     */
    root: MergedDefinitionMap;
    /**
     * final key segments by nested object key
     */
    finalByNestedKey: Map<string, Set<string>>;
    /**
     * nested object keys by final key segment
     */
    nestedByFinalKey: Map<string, Set<string>>;
    /**
     * definition keys below each dotted-key prefix
     */
    keysByPrefix: Map<string, string[]>;
    /**
     * renders are module-dependent (RuntimeValue present)
     */
    hasRuntimeValue: boolean;
    /**
     * asynchronous generators need to resolve before parsing
     */
    hasAsyncRuntimeValue: boolean;
    /**
     * rendered code per node (static trees only)
     */
    codeCache: WeakMap<MergedDefinitionMap, string>;
    /**
     * the logger
     */
    logger: Logger;
};
type ResolvedRuntimeValue = {
    value: CodeValuePrimitive;
} | {
    error: unknown;
};
type ResolvedRuntimeValues = Map<RuntimeValue, Map<string, ResolvedRuntimeValue>>;
type AsyncRuntimeValue = {
    value: RuntimeValue;
    keys: Set<string>;
    roots: Set<string>;
};
type AsyncRuntimeDefinitions = {
    /**
     * async generators
     */
    values: Map<RuntimeValue, AsyncRuntimeValue>;
    /**
     * replacement code by definition root
     */
    references: Map<string, string[]>;
    /**
     * roots whose synchronous generators may return more references
     */
    dynamicRoots: Set<string>;
};
type DefinePluginHooks = ReturnType<typeof createCompilationHooks>;
type Definitions = Record<string, CodeValue>;
import NormalModule = require("../module/NormalModule");
import type Module from "../module/Module";
import type JavascriptParser from "../javascript/JavascriptParser";
import type Compilation from "../Compilation";
import { SyncWaterfallHook } from "tapable";
import type { Logger } from "../logging/Logger";
declare function createCompilationHooks(): {
    /**
     * @type {SyncWaterfallHook<[Record<string, CodeValue>]>}
     * @since 5.104.0
     */
    definitions: SyncWaterfallHook<[Record<string, CodeValue>]>;
};
