export = ExternalModuleInitFragment;
/** @import { Source } from "webpack-sources" */
/** @import { ChunkRenderContext as GenerateContext } from "../javascript/JavascriptModulesPlugin" */
/** @typedef {{ name: string, value?: string }[]} ArrayImportSpecifiers */
/** @typedef {Set<string>} ImportSpecifier */
/** @typedef {Map<string, ImportSpecifier>} ImportSpecifiers */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<(string | ArrayImportSpecifiers | ImportSpecifiers | undefined)[]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<(string | ArrayImportSpecifiers | ImportSpecifiers | undefined)[]>} ObjectSerializerContext */
/**
 * @extends {InitFragment<GenerateContext>}
 */
declare class ExternalModuleInitFragment extends InitFragment<GenerateContext> {
    /**
     * @param {string} importedModule imported module
     * @param {ArrayImportSpecifiers | ImportSpecifiers} specifiers import specifiers
     * @param {string=} defaultImport default import
     */
    constructor(importedModule: string, specifiers: ArrayImportSpecifiers | ImportSpecifiers, defaultImport?: string | undefined);
    /** @type {string} */
    importedModule: string;
    /** @type {ImportSpecifiers} */
    specifiers: ImportSpecifiers;
    /** @type {string | undefined} */
    defaultImport: string | undefined;
    /**
     * @param {ExternalModuleInitFragment} other other
     * @returns {ExternalModuleInitFragment} ExternalModuleInitFragment
     */
    merge(other: ExternalModuleInitFragment): ExternalModuleInitFragment;
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
declare namespace ExternalModuleInitFragment {
    export { ArrayImportSpecifiers, ImportSpecifier, ImportSpecifiers, ObjectDeserializerContext, ObjectSerializerContext };
}
import type { ChunkRenderContext as GenerateContext } from "../javascript/JavascriptModulesPlugin";
import InitFragment = require("../template/InitFragment");
type ArrayImportSpecifiers = {
    name: string;
    value?: string;
}[];
type ImportSpecifier = Set<string>;
type ImportSpecifiers = Map<string, ImportSpecifier>;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<(string | ArrayImportSpecifiers | ImportSpecifiers | undefined)[]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<(string | ArrayImportSpecifiers | ImportSpecifiers | undefined)[]>;
