export = ConsumeSharedModule;
declare class ConsumeSharedModule {
    /**
     * @param {string} context context
     * @param {ConsumeOptions} options consume options
     */
    constructor(context: string, options: ConsumeOptions);
    options: ConsumeOptions;
    /**
     * @returns {string} a unique identifier of the module
     */
    identifier(): string;
    /**
     * @param {RequestShortener} requestShortener the request shortener
     * @returns {string} a user readable identifier of the module
     */
    readableIdentifier(requestShortener: any): string;
    /**
     * @param {LibIdentOptions} options options
     * @returns {string | null} an identifier for library inclusion
     */
    libIdent(options: any): string | null;
    /**
     * @param {NeedBuildContext} context context info
     * @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
     * @returns {void}
     */
    needBuild(context: any, callback: (arg0: (WebpackError | null) | undefined, arg1: boolean | undefined) => void): void;
    /**
     * @param {WebpackOptions} options webpack options
     * @param {Compilation} compilation the compilation
     * @param {ResolverWithOptions} resolver the resolver
     * @param {InputFileSystem} fs the file system
     * @param {function(WebpackError=): void} callback callback function
     * @returns {void}
     */
    build(options: any, compilation: any, resolver: any, fs: InputFileSystem, callback: (arg0: WebpackError | undefined) => void): void;
    buildMeta: {};
    buildInfo: {};
    /**
     * @returns {Set<string>} types available (do not mutate)
     */
    getSourceTypes(): Set<string>;
    /**
     * @param {string=} type the source type for which the size should be estimated
     * @returns {number} the estimated size of the module (must be non-zero)
     */
    size(type?: string | undefined): number;
    /**
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: any): void;
    /**
     * @param {CodeGenerationContext} context context for code generation
     * @returns {CodeGenerationResult} result
     */
    codeGeneration({ chunkGraph, moduleGraph, runtimeTemplate }: any): any;
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
type WebpackError = any;
type InputFileSystem = import("webpack/lib/util/fs").InputFileSystem;
type Hash = import("webpack/lib/util/Hash");
type ObjectSerializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext;
type ObjectDeserializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext;
type WebpackOptions = any;
type ChunkGraph = any;
type ChunkGroup = any;
type Compilation = any;
type UpdateHashContext = any;
type CodeGenerationContext = any;
type CodeGenerationResult = any;
type LibIdentOptions = any;
type NeedBuildContext = any;
type RequestShortener = any;
type ResolverWithOptions = any;
type SemVerRange = import("webpack/lib/util/semver").SemVerRange;
