export = WebAssemblyImportDependency;
/** @import { ModuleImportDescription } from "@webassemblyjs/ast" */
/** @import { ReferencedExports, DependencyKinds } from "../../graph/Dependency" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import WebpackError from "../../errors/WebpackError" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, ModuleImportDescription, false | string]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, ModuleImportDescription, false | string]>} ObjectSerializerContext */
/** @import { RuntimeSpec } from "../../util/runtime" */
declare class WebAssemblyImportDependency extends ModuleDependency {
    /**
     * Creates an instance of WebAssemblyImportDependency.
     * @param {string} request the request
     * @param {string} name the imported name
     * @param {ModuleImportDescription} description the WASM ast node
     * @param {false | string} onlyDirectImport if only direct imports are allowed
     */
    constructor(request: string, name: string, description: ModuleImportDescription, onlyDirectImport: false | string);
    /** @type {string} */
    name: string;
    /** @type {ModuleImportDescription} */
    description: ModuleImportDescription;
    /** @type {false | string} */
    onlyDirectImport: false | string;
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
declare namespace WebAssemblyImportDependency {
    export { KINDS, ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("../core/ModuleDependency");
declare var KINDS: Set<keyof DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, ModuleImportDescription, false | string]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, ModuleImportDescription, false | string]>;
import type { DependencyKinds } from "../../graph/Dependency";
