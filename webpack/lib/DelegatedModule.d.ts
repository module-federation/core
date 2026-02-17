export = DelegatedModule;
declare class DelegatedModule extends Module {
    /**
     * @param {ObjectDeserializerContext} context context\
     * @returns {DelegatedModule} DelegatedModule
     */
    static deserialize(context: ObjectDeserializerContext): DelegatedModule;
    /**
     * @param {DelegatedModuleSourceRequest} sourceRequest source request
     * @param {DelegatedModuleData} data data
     * @param {DelegatedModuleType} type type
     * @param {string} userRequest user request
     * @param {string | Module} originalRequest original request
     */
    constructor(sourceRequest: DelegatedModuleSourceRequest, data: DelegatedModuleData, type: DelegatedModuleType, userRequest: string, originalRequest: string | Module);
    sourceRequest: string;
    request: import("./ChunkGraph").ModuleId;
    delegationType: DelegatedModuleType;
    userRequest: string;
    originalRequest: string | Module;
    delegateData: DelegatedModuleData;
    delegatedSourceDependency: DelegatedSourceDependency;
    /**
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace DelegatedModule {
    export { DllReferencePluginOptions, WebpackOptions, Compilation, UpdateHashContext, SourceTypes, ManifestModuleData, ModuleId, BuildCallback, BuildMeta, CodeGenerationContext, CodeGenerationResult, LibIdentOptions, LibIdent, NeedBuildCallback, NeedBuildContext, RequestShortener, ResolverWithOptions, ObjectDeserializerContext, ObjectSerializerContext, Exports, Hash, InputFileSystem, DelegatedModuleSourceRequest, DelegatedModuleType, DelegatedModuleData };
}
import Module = require("./Module");
import DelegatedSourceDependency = require("./dependencies/DelegatedSourceDependency");
type DllReferencePluginOptions = import("../declarations/plugins/DllReferencePlugin").DllReferencePluginOptions;
type WebpackOptions = import("./config/defaults").WebpackOptionsNormalizedWithDefaults;
type Compilation = import("./Compilation");
type UpdateHashContext = import("./Dependency").UpdateHashContext;
type SourceTypes = import("./Generator").SourceTypes;
type ManifestModuleData = import("./LibManifestPlugin").ManifestModuleData;
type ModuleId = import("./Module").ModuleId;
type BuildCallback = import("./Module").BuildCallback;
type BuildMeta = import("./Module").BuildMeta;
type CodeGenerationContext = import("./Module").CodeGenerationContext;
type CodeGenerationResult = import("./Module").CodeGenerationResult;
type LibIdentOptions = import("./Module").LibIdentOptions;
type LibIdent = import("./Module").LibIdent;
type NeedBuildCallback = import("./Module").NeedBuildCallback;
type NeedBuildContext = import("./Module").NeedBuildContext;
type RequestShortener = import("./RequestShortener");
type ResolverWithOptions = import("./ResolverFactory").ResolverWithOptions;
type ObjectDeserializerContext = import("./serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("./serialization/ObjectMiddleware").ObjectSerializerContext;
type Exports = import("./dependencies/StaticExportsDependency").Exports;
type Hash = import("./util/Hash");
type InputFileSystem = import("./util/fs").InputFileSystem;
type DelegatedModuleSourceRequest = string;
type DelegatedModuleType = NonNullable<DllReferencePluginOptions["type"]>;
type DelegatedModuleData = {
    /**
     * build meta
     */
    buildMeta?: BuildMeta | undefined;
    /**
     * exports
     */
    exports?: Exports | undefined;
    /**
     * module id
     */
    id: ModuleId;
};
