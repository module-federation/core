export = DllModule;
declare class DllModule extends Module {
    /**
     * @param {string} context context path
     * @param {Dependency[]} dependencies dependencies
     * @param {string} name name
     */
    constructor(context: string, dependencies: Dependency[], name: string);
    name: string;
    /**
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace DllModule {
    export { WebpackOptions, Compilation, Dependency, UpdateHashContext, SourceTypes, BuildCallback, CodeGenerationContext, CodeGenerationResult, NeedBuildCallback, NeedBuildContext, RequestShortener, ResolverWithOptions, ObjectDeserializerContext, ObjectSerializerContext, Hash, InputFileSystem };
}
import Module = require("./Module");
type WebpackOptions = import("./config/defaults").WebpackOptionsNormalizedWithDefaults;
type Compilation = import("./Compilation");
type Dependency = import("./Dependency");
type UpdateHashContext = import("./Dependency").UpdateHashContext;
type SourceTypes = import("./Generator").SourceTypes;
type BuildCallback = import("./Module").BuildCallback;
type CodeGenerationContext = import("./Module").CodeGenerationContext;
type CodeGenerationResult = import("./Module").CodeGenerationResult;
type NeedBuildCallback = import("./Module").NeedBuildCallback;
type NeedBuildContext = import("./Module").NeedBuildContext;
type RequestShortener = import("./RequestShortener");
type ResolverWithOptions = import("./ResolverFactory").ResolverWithOptions;
type ObjectDeserializerContext = import("./serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("./serialization/ObjectMiddleware").ObjectSerializerContext;
type Hash = import("./util/Hash");
type InputFileSystem = import("./util/fs").InputFileSystem;
