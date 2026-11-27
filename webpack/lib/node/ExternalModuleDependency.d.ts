export = ExternalModuleDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency from "../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../template/DependencyTemplate" */
/** @import { Range } from "../javascript/JavascriptParser" */
/**
 * @import {
 * 	ArrayImportSpecifiers
 * } from "./ExternalModuleInitFragment"
 */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<(string | ArrayImportSpecifiers | undefined)[]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<(string | ArrayImportSpecifiers | undefined)[]>} ObjectSerializerContext */
declare class ExternalModuleDependency extends CachedConstDependency {
    /**
     * Creates an instance of ExternalModuleDependency.
     * @param {string} module module
     * @param {ArrayImportSpecifiers} importSpecifiers import specifiers
     * @param {string | undefined} defaultImport default import
     * @param {string} expression expression
     * @param {Range | null} range range
     * @param {string} identifier identifier
     * @param {number=} place place where we inject the expression
     */
    constructor(module: string, importSpecifiers: ExternalModuleInitFragment.ArrayImportSpecifiers, defaultImport: string | undefined, expression: string, range: Range | null, identifier: string, place?: number | undefined);
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
declare namespace ExternalModuleDependency {
    export { ExternalModuleDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import CachedConstDependency = require("../dependencies/core/CachedConstDependency");
import ExternalModuleInitFragment = require("./ExternalModuleInitFragment");
import type { Range } from "../javascript/JavascriptParser";
declare const ExternalModuleDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, { initFragments, chunkInitFragments }: DependencyTemplateContext): void;
    };
};
declare class ExternalModuleDependencyTemplate extends ExternalModuleDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<(string | ExternalModuleInitFragment.ArrayImportSpecifiers | undefined)[]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<(string | ExternalModuleInitFragment.ArrayImportSpecifiers | undefined)[]>;
import type Dependency from "../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../template/DependencyTemplate";
