export = ProvideSharedModule;
/**
 * @import {
 * 	WebpackOptionsNormalizedWithDefaults as WebpackOptions
 * } from "../config/defaults"
 */
/** @import Compilation from "../Compilation" */
/**
 * @import {
 * 	BuildCallback,
 * 	CodeGenerationContext,
 * 	CodeGenerationResult,
 * 	LibIdentOptions,
 * 	LibIdent,
 * 	NeedBuildCallback,
 * 	NeedBuildContext,
 * 	Sources,
 * 	SourceTypes,
 * 	CodeGenerationResultData
 * } from "../module/Module"
 */
/** @import RequestShortener from "../util/RequestShortener" */
/** @import { ResolverWithOptions } from "../resolve/ResolverFactory" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string, string | false, string, boolean]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string, string | false, string, boolean]>} ObjectSerializerContext */
/** @import { InputFileSystem } from "../fs/fs" */
declare class ProvideSharedModule extends Module {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {ProvideSharedModule} deserialize fallback dependency
     */
    static deserialize(context: ObjectDeserializerContext): ProvideSharedModule;
    /**
     * Creates an instance of ProvideSharedModule.
     * @param {string} shareScope shared scope name
     * @param {string} name shared key
     * @param {string | false} version version
     * @param {string} request request to the provided module
     * @param {boolean} eager include the module in sync way
     */
    constructor(shareScope: string, name: string, version: string | false, request: string, eager: boolean);
    /** @type {string} */
    _shareScope: string;
    /** @type {string} */
    _name: string;
    /** @type {string | false} */
    _version: string | false;
    /** @type {string} */
    _request: string;
    /** @type {boolean} */
    _eager: boolean;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace ProvideSharedModule {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import Module = require("../module/Module");
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string, string | false, string, boolean]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string, string | false, string, boolean]>;
