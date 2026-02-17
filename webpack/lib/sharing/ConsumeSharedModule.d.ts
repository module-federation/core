export = ConsumeSharedModule;
/** @typedef {import("../config/defaults").WebpackOptionsNormalizedWithDefaults} WebpackOptions */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../Module").BuildCallback} BuildCallback */
/** @typedef {import("../Module").CodeGenerationContext} CodeGenerationContext */
/** @typedef {import("../Module").CodeGenerationResult} CodeGenerationResult */
/** @typedef {import("../Module").LibIdentOptions} LibIdentOptions */
/** @typedef {import("../Module").LibIdent} LibIdent */
/** @typedef {import("../Module").NeedBuildCallback} NeedBuildCallback */
/** @typedef {import("../Module").NeedBuildContext} NeedBuildContext */
/** @typedef {import("../Module").SourceTypes} SourceTypes */
/** @typedef {import("../RequestShortener")} RequestShortener */
/** @typedef {import("../ResolverFactory").ResolverWithOptions} ResolverWithOptions */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
/** @typedef {import("../util/fs").InputFileSystem} InputFileSystem */
/** @typedef {import("../util/semver").SemVerRange} SemVerRange */
/**
 * @typedef {object} ConsumeOptions
 * @property {string=} import fallback request
 * @property {string=} importResolved resolved fallback request
 * @property {string} shareKey global share key
 * @property {string} shareScope share scope
 * @property {SemVerRange | false | undefined} requiredVersion version requirement
 * @property {string=} packageName package name to determine required version automatically
 * @property {boolean} strictVersion don't use shared version even if version isn't valid
 * @property {boolean} singleton use single global version
 * @property {boolean} eager include the fallback module in a sync way
 */
declare class ConsumeSharedModule extends Module {
    /**
     * @param {string} context context
     * @param {ConsumeOptions} options consume options
     */
    constructor(context: string, options: ConsumeOptions);
    options: ConsumeOptions;
    /**
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace ConsumeSharedModule {
    export { WebpackOptions, Compilation, UpdateHashContext, BuildCallback, CodeGenerationContext, CodeGenerationResult, LibIdentOptions, LibIdent, NeedBuildCallback, NeedBuildContext, SourceTypes, RequestShortener, ResolverWithOptions, ObjectDeserializerContext, ObjectSerializerContext, Hash, InputFileSystem, SemVerRange, ConsumeOptions };
}
import Module = require("../Module");
type WebpackOptions = import("../config/defaults").WebpackOptionsNormalizedWithDefaults;
type Compilation = import("../Compilation");
type UpdateHashContext = import("../Dependency").UpdateHashContext;
type BuildCallback = import("../Module").BuildCallback;
type CodeGenerationContext = import("../Module").CodeGenerationContext;
type CodeGenerationResult = import("../Module").CodeGenerationResult;
type LibIdentOptions = import("../Module").LibIdentOptions;
type LibIdent = import("../Module").LibIdent;
type NeedBuildCallback = import("../Module").NeedBuildCallback;
type NeedBuildContext = import("../Module").NeedBuildContext;
type SourceTypes = import("../Module").SourceTypes;
type RequestShortener = import("../RequestShortener");
type ResolverWithOptions = import("../ResolverFactory").ResolverWithOptions;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type Hash = import("../util/Hash");
type InputFileSystem = import("../util/fs").InputFileSystem;
type SemVerRange = import("../util/semver").SemVerRange;
type ConsumeOptions = {
    /**
     * fallback request
     */
    import?: string | undefined;
    /**
     * resolved fallback request
     */
    importResolved?: string | undefined;
    /**
     * global share key
     */
    shareKey: string;
    /**
     * share scope
     */
    shareScope: string;
    /**
     * version requirement
     */
    requiredVersion: SemVerRange | false | undefined;
    /**
     * package name to determine required version automatically
     */
    packageName?: string | undefined;
    /**
     * don't use shared version even if version isn't valid
     */
    strictVersion: boolean;
    /**
     * use single global version
     */
    singleton: boolean;
    /**
     * include the fallback module in a sync way
     */
    eager: boolean;
};
