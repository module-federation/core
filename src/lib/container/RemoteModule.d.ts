export = RemoteModule;
declare class RemoteModule {
    /**
     * @param {ObjectDeserializerContext} context context
     * @returns {RemoteModule} deserialized module
     */
    static deserialize(context: ObjectDeserializerContext): RemoteModule;
    /**
     * @param {string} request request string
     * @param {string[]} externalRequests list of external requests to containers
     * @param {string} internalRequest name of exposed module in container
     * @param {string} shareScope the used share scope name
     */
    constructor(request: string, externalRequests: string[], internalRequest: string, shareScope: string);
    request: string;
    externalRequests: string[];
    internalRequest: string;
    shareScope: string;
    _identifier: string;
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
    buildInfo: {
        strict: boolean;
    };
    /**
     * @param {string=} type the source type for which the size should be estimated
     * @returns {number} the estimated size of the module (must be non-zero)
     */
    size(type?: string | undefined): number;
    /**
     * @returns {Set<string>} types available (do not mutate)
     */
    getSourceTypes(): Set<string>;
    /**
     * @returns {string | null} absolute path which should be used for condition matching (usually the resource path)
     */
    nameForCondition(): string | null;
    /**
     * @param {CodeGenerationContext} context context for code generation
     * @returns {CodeGenerationResult} result
     */
    codeGeneration({ runtimeTemplate, moduleGraph, chunkGraph }: any): any;
    /**
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace RemoteModule {
    export { WebpackOptions, ChunkGraph, ChunkGroup, Compilation, CodeGenerationContext, CodeGenerationResult, LibIdentOptions, NeedBuildContext, RequestShortener, ResolverWithOptions, WebpackError, ObjectDeserializerContext, ObjectSerializerContext, Hash, InputFileSystem };
}
type WebpackError = any;
type InputFileSystem = import("webpack/lib/util/fs").InputFileSystem;
type ObjectSerializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext;
type ObjectDeserializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext;
type WebpackOptions = any;
type ChunkGraph = any;
type ChunkGroup = any;
type Compilation = any;
type CodeGenerationContext = any;
type CodeGenerationResult = any;
type LibIdentOptions = any;
type NeedBuildContext = any;
type RequestShortener = any;
type ResolverWithOptions = any;
type Hash = import("webpack/lib/util/Hash");
