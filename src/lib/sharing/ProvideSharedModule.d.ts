export = ProvideSharedModule;
declare class ProvideSharedModule extends Module {
    /**
     * @param {ObjectDeserializerContext} context context
     * @returns {ProvideSharedModule} deserialize fallback dependency
     */
    static deserialize(context: ObjectDeserializerContext): ProvideSharedModule;
    /**
     * @param {string} shareScope shared scope name
     * @param {string} name shared key
     * @param {string | false} version version
     * @param {string} request request to the provided module
     * @param {boolean} eager include the module in sync way
     */
    constructor(shareScope: string, name: string, version: string | false, request: string, eager: boolean);
    _shareScope: string;
    _name: string;
    _version: string | false;
    _request: string;
    _eager: boolean;
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
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace ProvideSharedModule {
    export { WebpackOptions, Chunk, ChunkGraph, ChunkGroup, Compilation, CodeGenerationContext, CodeGenerationResult, LibIdentOptions, NeedBuildContext, RequestShortener, ResolverWithOptions, WebpackError, ObjectDeserializerContext, ObjectSerializerContext, Hash, InputFileSystem };
}
import Module = require("webpack/lib/Module");
type NeedBuildContext = import("webpack/lib/Module").NeedBuildContext;
type WebpackError = import("webpack/lib/WebpackError");
type WebpackOptions = import("webpack/declarations/WebpackOptions").WebpackOptionsNormalized;
type Compilation = import("webpack/lib/Compilation");
type ResolverWithOptions = import("webpack/lib/ResolverFactory").ResolverWithOptions;
type InputFileSystem = import("webpack/lib/util/fs").InputFileSystem;
type ObjectSerializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext;
type ObjectDeserializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext;
type Chunk = import("webpack/lib/Chunk");
type ChunkGraph = import("webpack/lib/ChunkGraph");
type ChunkGroup = import("webpack/lib/ChunkGroup");
type CodeGenerationContext = import("webpack/lib/Module").CodeGenerationContext;
type CodeGenerationResult = import("webpack/lib/Module").CodeGenerationResult;
type LibIdentOptions = import("webpack/lib/Module").LibIdentOptions;
type RequestShortener = import("webpack/lib/RequestShortener");
type Hash = import("webpack/lib/util/Hash");
