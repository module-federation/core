export = CssIcssImportDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { ReferencedExports, DependencyKinds } from "../../graph/Dependency" */
/**
 * @import {
 * 	CssDependencyTemplateContext as DependencyTemplateContext
 * } from "../../template/DependencyTemplate"
 */
/** @import CssGenerator from "../../css/CssGenerator" */
/** @import CssModule from "../../css/CssModule" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { RuntimeSpec } from "../../util/runtime" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string]>} ObjectSerializerContext */
/**
 * @import {
 * 	CssGeneratorExportsConvention
 * } from "../../../declarations/WebpackOptions"
 */
declare class CssIcssImportDependency extends CssImportDependency {
    /**
     * Example of dependency:
     *
     * :import('./style.css') { value: name }
     * @param {string} request request request path which needs resolving
     * @param {Range} range the range of dependency
     * @param {"local" | "global"} mode mode of the parsed CSS
     * @param {string} importName import name (`name` from example)
     * @param {string} localName local name (`value` from example)
     */
    constructor(request: string, range: Range, mode: "local" | "global", importName: string, localName: string);
    /** @type {string} */
    importName: string;
    /** @type {string} */
    localName: string;
    /** @type {undefined | string[]} */
    _importNameConventionNames: undefined | string[];
    /**
     * Memoized `cssExportConvention(this.importName, convention)`. The target
     * module is fixed for a given dep, so its `exportsConvention` is fixed,
     * so the convention-derived aliases of `importName` can be cached on the dep.
     * @param {CssGeneratorExportsConvention} convention convention from the target module's generator
     * @returns {string[]} convention results
     */
    getImportNameConventionNames(convention: CssGeneratorExportsConvention): string[];
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
declare namespace CssIcssImportDependency {
    export { CssIcssImportDependencyTemplate as Template, KINDS, ObjectDeserializerContext, ObjectSerializerContext };
}
import CssImportDependency = require("./CssImportDependency");
import type { CssGeneratorExportsConvention } from "../../../declarations/WebpackOptions";
import type { Range } from "../../javascript/JavascriptParser";
declare const CssIcssImportDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class CssIcssImportDependencyTemplate extends CssIcssImportDependencyTemplate_base {
}
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { CssDependencyTemplateContext as DependencyTemplateContext } from "../../template/DependencyTemplate";
