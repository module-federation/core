export = ConsumeSharedModule;
declare class ConsumeSharedModule extends Module {
    /**
     * @param {string} context context
     * @param {ConsumeOptions} options consume options
     */
    constructor(context: string, options: ConsumeOptions);
    options: ConsumeOptions;
    /**
     * @param {NeedBuildContext} context context info
     * @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
     * @returns {void}
     */
    needBuild(context: NeedBuildContext, callback: (arg0: (WebpackError | null) | undefined, arg1: boolean | undefined) => void): void;
    /**
     * @param {WebpackOptions} options webpack options
     * @param {Compilation} compilation the compilation
     * @param {ResolverWithOptions} resolver the resolver
     * @param {InputFileSystem} fs the file system
     * @param {function(WebpackError=): void} callback callback function
     * @returns {void}
     */
    build(options: WebpackOptions, compilation: Compilation, resolver: ResolverWithOptions, fs: InputFileSystem, callback: (arg0: WebpackError | undefined) => void): void;
    /**
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: UpdateHashContext): void;
    /**
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
    /**
     * @param {ObjectDeserializerContext} context context
     */
    deserialize(context: ObjectDeserializerContext): void;
}
declare namespace ConsumeSharedModule {
    export { WebpackOptions, ChunkGraph, ChunkGroup, Compilation, UpdateHashContext, CodeGenerationContext, CodeGenerationResult, LibIdentOptions, NeedBuildContext, RequestShortener, ResolverWithOptions, WebpackError, ObjectDeserializerContext, ObjectSerializerContext, Hash, InputFileSystem, SemVerRange, ConsumeOptions };
}
import Module = require("webpack/lib/Module");
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
    requiredVersion: import("webpack/lib/util/semver").SemVerRange | false | undefined;
    /**
     * package name to determine required version automatically
     */
    packageName: string;
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
type NeedBuildContext = import("webpack/lib/Module").NeedBuildContext;
type WebpackError = import("webpack/lib/WebpackError");
type WebpackOptions = import("webpack/declarations/WebpackOptions").WebpackOptionsNormalized;
type Compilation = import("webpack/lib/Compilation");
type ResolverWithOptions = import("webpack/lib/ResolverFactory").ResolverWithOptions;
type InputFileSystem = import("webpack/lib/util/fs").InputFileSystem;
type Hash = import("webpack/lib/util/Hash");
type UpdateHashContext = import("webpack/lib/Dependency").UpdateHashContext;
type ObjectSerializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext;
type ObjectDeserializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext;
type ChunkGraph = import("webpack/lib/ChunkGraph");
type ChunkGroup = import("webpack/lib/ChunkGroup");
type CodeGenerationContext = import("webpack/lib/Module").CodeGenerationContext;
type CodeGenerationResult = import("webpack/lib/Module").CodeGenerationResult;
type LibIdentOptions = import("webpack/lib/Module").LibIdentOptions;
type RequestShortener = import("webpack/lib/RequestShortener");
type SemVerRange = import("webpack/lib/util/semver").SemVerRange;
