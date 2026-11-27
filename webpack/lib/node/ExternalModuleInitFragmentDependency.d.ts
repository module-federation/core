export = ExternalModuleInitFragmentDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency from "../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../template/DependencyTemplate" */
/**
 * @import {
 * 	ArrayImportSpecifiers
 * } from "./ExternalModuleInitFragment"
 */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, ArrayImportSpecifiers, string | undefined]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, ArrayImportSpecifiers, string | undefined]>} ObjectSerializerContext */
declare class ExternalModuleInitFragmentDependency extends NullDependency {
    /**
     * Creates an instance of ExternalModuleInitFragmentDependency.
     * @param {string} module module
     * @param {ArrayImportSpecifiers} importSpecifiers import specifiers
     * @param {string | undefined} defaultImport default import
     */
    constructor(module: string, importSpecifiers: ExternalModuleInitFragment.ArrayImportSpecifiers, defaultImport: string | undefined);
    /** @type {string} */
    importedModule: string;
    /** @type {ArrayImportSpecifiers} */
    specifiers: ExternalModuleInitFragment.ArrayImportSpecifiers;
    /** @type {string | undefined} */
    default: string | undefined;
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
declare namespace ExternalModuleInitFragmentDependency {
    export { ExternalModuleInitFragmentDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../dependencies/core/NullDependency");
import ExternalModuleInitFragment = require("./ExternalModuleInitFragment");
declare class ExternalModuleInitFragmentDependencyTemplate extends DependencyTemplate {
}
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, ExternalModuleInitFragment.ArrayImportSpecifiers, string | undefined]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, ExternalModuleInitFragment.ArrayImportSpecifiers, string | undefined]>;
import DependencyTemplate = require("../template/DependencyTemplate");
