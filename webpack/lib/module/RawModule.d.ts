export = RawModule;
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
 * 	CodeGenerationContext,
 * 	CodeGenerationResult,
 * 	NeedBuildCallback,
 * 	NeedBuildContext,
 * 	ReadOnlyRuntimeRequirements,
 * 	Sources,
 * 	SourceTypes
 * } from "./Module"
 */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/** @import { ConnectionState } from "../graph/ModuleGraphConnection" */
/** @import RequestShortener from "../util/RequestShortener" */
/** @import { ResolverWithOptions } from "../resolve/ResolverFactory" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string, string, ReadOnlyRuntimeRequirements | null]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string, string, ReadOnlyRuntimeRequirements | null]>} ObjectSerializerContext */
/** @import Hash from "../util/Hash" */
/** @import { InputFileSystem } from "../fs/fs" */
declare class RawModule extends Module {
    /**
     * Creates an instance of RawModule.
     * @param {string} source source code
     * @param {string} identifier unique identifier
     * @param {string=} readableIdentifier readable identifier
     * @param {ReadOnlyRuntimeRequirements=} runtimeRequirements runtime requirements needed for the source code
     */
    constructor(source: string, identifier: string, readableIdentifier?: string | undefined, runtimeRequirements?: Module.ReadOnlyRuntimeRequirements | undefined);
    /** @type {string} */
    sourceStr: string;
    /** @type {string} */
    identifierStr: string;
    /** @type {string} */
    readableIdentifierStr: string;
    /** @type {ReadOnlyRuntimeRequirements | null} */
    runtimeRequirements: Module.ReadOnlyRuntimeRequirements | null;
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
declare namespace RawModule {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import Module = require("./Module");
import type Hash from "../util/Hash";
import type { UpdateHashContext } from "../graph/Dependency";
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string, string, Module.ReadOnlyRuntimeRequirements | null]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string, string, Module.ReadOnlyRuntimeRequirements | null]>;
