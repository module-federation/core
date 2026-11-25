export = ConsumeSharedModule;
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
 * 	LibIdentOptions,
 * 	LibIdent,
 * 	NeedBuildCallback,
 * 	NeedBuildContext,
 * 	Sources,
 * 	SourceTypes,
 * 	ExportsType,
 * 	BasicSourceTypes,
 * 	ModuleKinds
 * } from "../module/Module"
 */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/** @import RequestShortener from "../util/RequestShortener" */
/** @import { ResolverWithOptions } from "../resolve/ResolverFactory" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[ConsumeOptions]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[ConsumeOptions]>} ObjectSerializerContext */
/** @import Hash from "../util/Hash" */
/** @import { InputFileSystem } from "../fs/fs" */
/** @import { SemVerRange } from "./semver" */
/**
 * Represents the consume shared module runtime component.
 * @typedef {object} ConsumeOptions
 * @property {string=} import fallback request
 * @property {string=} importResolved resolved fallback request
 * @property {string} shareKey global share key
 * @property {string} shareScope share scope
 * @property {SemVerRange | false | undefined} requiredVersion version requirement
 * @property {string=} packageName package name to determine required version automatically
 * @property {boolean} strictVersion don't use shared version even if version isn't valid
 * @property {boolean} singleton use single global version
 * @property {boolean} eager include the fallback module in a sync way
 */
declare class ConsumeSharedModule extends Module {
    /**
     * Creates an instance of ConsumeSharedModule.
     * @param {string} context context
     * @param {ConsumeOptions} options consume options
     */
    constructor(context: string, options: ConsumeOptions);
    /** @type {ConsumeOptions} */
    options: ConsumeOptions;
    /**
     * Get fallback module.
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {Module | null} fallback module
     */
    _getFallbackModule(moduleGraph: ModuleGraph): Module | null;
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
declare namespace ConsumeSharedModule {
    export { KINDS, ObjectDeserializerContext, ObjectSerializerContext, ConsumeOptions };
}
import Module = require("../module/Module");
import type ModuleGraph from "../graph/ModuleGraph";
import type Hash from "../util/Hash";
import type { UpdateHashContext } from "../graph/Dependency";
declare var KINDS: Set<keyof Module.ModuleKinds>;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[ConsumeOptions]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[ConsumeOptions]>;
/**
 * Represents the consume shared module runtime component.
 */
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
    requiredVersion: SemVerRange | false | undefined;
    /**
     * package name to determine required version automatically
     */
    packageName?: string | undefined;
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
import type { SemVerRange } from "./semver";
