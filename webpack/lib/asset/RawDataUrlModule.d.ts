export = RawDataUrlModule;
/**
 * @import {
 * 	WebpackOptionsNormalizedWithDefaults as WebpackOptions
 * } from "../config/defaults"
 */
/** @import Compilation from "../Compilation" */
/** @import { UpdateHashContext } from "../graph/Dependency" */
/**
 * @import {
 * 	BuildCallback,
 * 	RuntimeRequirements,
 * 	CodeGenerationContext,
 * 	CodeGenerationResult,
 * 	CodeGenerationResultData,
 * 	NeedBuildCallback,
 * 	NeedBuildContext,
 * 	Sources,
 * 	SourceTypes
 * } from "../module/Module"
 */
/** @import RequestShortener from "../util/RequestShortener" */
/** @import { ResolverWithOptions } from "../resolve/ResolverFactory" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Buffer | undefined, string, string]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Buffer | undefined, string, string]>} ObjectSerializerContext */
/** @import Hash from "../util/Hash" */
/** @import { InputFileSystem } from "../fs/fs" */
declare class RawDataUrlModule extends Module {
    /**
     * Creates an instance of RawDataUrlModule.
     * @param {string} url raw url
     * @param {string} identifier unique identifier
     * @param {string=} readableIdentifier readable identifier
     */
    constructor(url: string, identifier: string, readableIdentifier?: string | undefined);
    /** @type {string} */
    url: string;
    /** @type {Buffer | undefined} */
    urlBuffer: Buffer | undefined;
    /** @type {string} */
    identifierStr: string;
    /** @type {string} */
    readableIdentifierStr: string;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: UpdateHashContext): void;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize(context: ObjectDeserializerContext): void;
}
declare namespace RawDataUrlModule {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import Module = require("../module/Module");
import type Hash from "../util/Hash";
import type { UpdateHashContext } from "../graph/Dependency";
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Buffer | undefined, string, string]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Buffer | undefined, string, string]>;
