export = DelegatedModule;
declare class DelegatedModule extends Module {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context\
     * @returns {DelegatedModule} DelegatedModule
     */
    static deserialize(context: ObjectDeserializerContext): DelegatedModule;
    /**
     * Creates an instance of DelegatedModule.
     * @param {DelegatedModuleSourceRequest} sourceRequest source request
     * @param {DelegatedModuleData} data data
     * @param {DelegatedModuleType} type type
     * @param {string} userRequest user request
     * @param {string | Module} originalRequest original request
     */
    constructor(sourceRequest: DelegatedModuleSourceRequest, data: DelegatedModuleData, type: DelegatedModuleType, userRequest: string, originalRequest: string | Module);
    /** @type {string} */
    sourceRequest: string;
    /** @type {ModuleId} */
    request: ModuleId;
    /** @type {DelegatedModuleType} */
    delegationType: DelegatedModuleType;
    /** @type {string} */
    userRequest: string;
    /** @type {string | Module} */
    originalRequest: string | Module;
    /** @type {DelegatedModuleData} */
    delegateData: DelegatedModuleData;
    /** @type {undefined | DelegatedSourceDependency} */
    delegatedSourceDependency: undefined | DelegatedSourceDependency;
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
}
declare namespace DelegatedModule {
    export { ObjectDeserializerContext, ObjectSerializerContext, DelegatedModuleSourceRequest, DelegatedModuleType, DelegatedModuleData };
}
import Module = require("../module/Module");
import type { ModuleId } from "../graph/ChunkGraph";
import DelegatedSourceDependency = require("./DelegatedSourceDependency");
import type Hash from "../util/Hash";
import type { UpdateHashContext } from "../graph/Dependency";
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[DelegatedModuleSourceRequest, DelegatedModuleData, DelegatedModuleType, string, string | Module]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[DelegatedModuleSourceRequest, DelegatedModuleData, DelegatedModuleType, string, string | Module]>;
type DelegatedModuleSourceRequest = string;
type DelegatedModuleType = NonNullable<DllReferencePluginOptions["type"]>;
/**
 * Defines the delegated module data type used by this module.
 */
type DelegatedModuleData = {
    /**
     * build meta
     */
    buildMeta?: Module.BuildMeta | undefined;
    /**
     * exports
     */
    exports?: StaticExportsDependency.Exports | undefined;
    /**
     * module id
     */
    id: ModuleId;
};
import type { DllReferencePluginOptions } from "./DllReferencePlugin";
import StaticExportsDependency = require("../dependencies/core/StaticExportsDependency");
