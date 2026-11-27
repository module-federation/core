export = ContainerEntryModule;
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
 * 	SourceTypes
 * } from "../module/Module"
 */
/** @import RequestShortener from "../util/RequestShortener" */
/** @import { ResolverWithOptions } from "../resolve/ResolverFactory" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, ExposesList, string]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, ExposesList, string]>} ObjectSerializerContext */
/** @import { InputFileSystem } from "../fs/fs" */
/**
 * Defines the expose options type used by this module.
 * @typedef {object} ExposeOptions
 * @property {string[]} import requests to exposed modules (last one is exported)
 * @property {string} name custom chunk name for the exposed module
 */
/** @typedef {[string, ExposeOptions][]} ExposesList */
declare class ContainerEntryModule extends Module {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {ContainerEntryModule} deserialized container entry module
     */
    static deserialize(context: ObjectDeserializerContext): ContainerEntryModule;
    /**
     * Creates an instance of ContainerEntryModule.
     * @param {string} name container entry name
     * @param {ExposesList} exposes list of exposed modules
     * @param {string} shareScope name of the share scope
     */
    constructor(name: string, exposes: ExposesList, shareScope: string);
    /** @type {string} */
    _name: string;
    /** @type {ExposesList} */
    _exposes: ExposesList;
    /** @type {string} */
    _shareScope: string;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace ContainerEntryModule {
    export { ObjectDeserializerContext, ObjectSerializerContext, ExposeOptions, ExposesList };
}
import Module = require("../module/Module");
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, ExposesList, string]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, ExposesList, string]>;
/**
 * Defines the expose options type used by this module.
 */
type ExposeOptions = {
    /**
     * requests to exposed modules (last one is exported)
     */
    import: string[];
    /**
     * custom chunk name for the exposed module
     */
    name: string;
};
type ExposesList = [string, ExposeOptions][];
