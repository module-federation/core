export = RawDataUrlModule;
/** @typedef {import("../config/defaults").WebpackOptionsNormalizedWithDefaults} WebpackOptions */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../Module").BuildCallback} BuildCallback */
/** @typedef {import("../Module").RuntimeRequirements} RuntimeRequirements */
/** @typedef {import("../Module").CodeGenerationContext} CodeGenerationContext */
/** @typedef {import("../Module").CodeGenerationResult} CodeGenerationResult */
/** @typedef {import("../Module").NeedBuildCallback} NeedBuildCallback */
/** @typedef {import("../Module").NeedBuildContext} NeedBuildContext */
/** @typedef {import("../Module").SourceTypes} SourceTypes */
/** @typedef {import("../RequestShortener")} RequestShortener */
/** @typedef {import("../ResolverFactory").ResolverWithOptions} ResolverWithOptions */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
/** @typedef {import("../util/fs").InputFileSystem} InputFileSystem */
declare class RawDataUrlModule extends Module {
    /**
     * @param {string} url raw url
     * @param {string} identifier unique identifier
     * @param {string=} readableIdentifier readable identifier
     */
    constructor(url: string, identifier: string, readableIdentifier?: string | undefined);
    url: string;
    urlBuffer: Buffer<ArrayBuffer>;
    identifierStr: string;
    readableIdentifierStr: string;
    /**
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace RawDataUrlModule {
    export { WebpackOptions, Compilation, UpdateHashContext, BuildCallback, RuntimeRequirements, CodeGenerationContext, CodeGenerationResult, NeedBuildCallback, NeedBuildContext, SourceTypes, RequestShortener, ResolverWithOptions, ObjectDeserializerContext, ObjectSerializerContext, Hash, InputFileSystem };
}
import Module = require("../Module");
type WebpackOptions = import("../config/defaults").WebpackOptionsNormalizedWithDefaults;
type Compilation = import("../Compilation");
type UpdateHashContext = import("../Dependency").UpdateHashContext;
type BuildCallback = import("../Module").BuildCallback;
type RuntimeRequirements = import("../Module").RuntimeRequirements;
type CodeGenerationContext = import("../Module").CodeGenerationContext;
type CodeGenerationResult = import("../Module").CodeGenerationResult;
type NeedBuildCallback = import("../Module").NeedBuildCallback;
type NeedBuildContext = import("../Module").NeedBuildContext;
type SourceTypes = import("../Module").SourceTypes;
type RequestShortener = import("../RequestShortener");
type ResolverWithOptions = import("../ResolverFactory").ResolverWithOptions;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type Hash = import("../util/Hash");
type InputFileSystem = import("../util/fs").InputFileSystem;
