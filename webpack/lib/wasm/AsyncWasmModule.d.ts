export = AsyncWasmModule;
/** @import Module, { BuildMeta } from "../module/Module" */
/**
 * @import {
 * 	NormalModuleBuildInfo,
 * 	NormalModuleCreateData
 * } from "../module/NormalModule"
 */
/** @import { ImportPhaseName } from "../dependencies/core/ImportPhase" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[ImportPhaseName | undefined]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[ImportPhaseName | undefined]>} ObjectSerializerContext */
/**
 * A built async wasm module, typed with its build info and build meta.
 * @typedef {NormalModule & { buildInfo: NormalModuleBuildInfo, buildMeta: BuildMeta }} BuiltAsyncWasmModule
 */
/**
 * Module class for `webassembly/async` modules. Wasm-specific properties should live here instead of `NormalModule`.
 */
declare class AsyncWasmModule extends NormalModule {
    /**
     * @param {NormalModuleCreateData & { phase: ImportPhaseName | undefined }} options options object
     */
    constructor(options: NormalModule.NormalModuleCreateData & {
        phase: ImportPhaseName | undefined;
    });
    /** @type {ImportPhaseName | undefined} */
    phase: ImportPhaseName | undefined;
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
declare namespace AsyncWasmModule {
    export { ObjectDeserializerContext, ObjectSerializerContext, BuiltAsyncWasmModule };
}
import NormalModule = require("../module/NormalModule");
import type { ImportPhaseName } from "../dependencies/core/ImportPhase";
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[ImportPhaseName | undefined]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[ImportPhaseName | undefined]>;
/**
 * A built async wasm module, typed with its build info and build meta.
 */
type BuiltAsyncWasmModule = NormalModule & {
    buildInfo: NormalModule.NormalModuleBuildInfo;
    buildMeta: Module.BuildMeta;
};
import type Module from "../module/Module";
