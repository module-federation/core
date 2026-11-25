export = CommonJsExportRequireDependency;
/** @typedef {Set<string>} Exports */
/** @typedef {Set<string>} Checked */
declare class CommonJsExportRequireDependency extends ModuleDependency {
    /**
     * Creates an instance of CommonJsExportRequireDependency.
     * @param {Range} range range
     * @param {Range | null} valueRange value range
     * @param {CommonJSDependencyBaseKeywords} base base
     * @param {ExportInfoName[]} names names
     * @param {string} request request
     * @param {ExportInfoName[]} ids ids
     * @param {boolean} resultUsed true, when the result is used
     */
    constructor(range: Range, valueRange: Range | null, base: CommonJSDependencyBaseKeywords, names: Dependency.ExportInfoName[], request: string, ids: Dependency.ExportInfoName[], resultUsed: boolean);
    valueRange: Range;
    /** @type {CommonJSDependencyBaseKeywords} */
    base: CommonJSDependencyBaseKeywords;
    /** @type {string[]} */
    names: string[];
    /** @type {string[]} */
    ids: string[];
    /** @type {boolean} */
    resultUsed: boolean;
    /** @type {undefined | boolean} */
    asiSafe: undefined | boolean;
    /** @type {boolean} */
    getter: boolean;
    /** @type {number | null} */
    descriptorStart: number | null;
    /** @type {Range | null} */
    bindingRange: Range | null;
    /** @type {CommonJsRequireDependency | null} */
    bindingDependency: CommonJsRequireDependency | null;
    /**
     * Returns the imported id.
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {ExportInfoName[]} the imported id
     */
    getIds(moduleGraph: ModuleGraph): Dependency.ExportInfoName[];
    /**
     * Updates ids using the provided module graph.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ExportInfoName[]} ids the imported ids
     * @returns {void}
     */
    setIds(moduleGraph: ModuleGraph, ids: Dependency.ExportInfoName[]): void;
    /**
     * Gets star reexports.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {RuntimeSpec} runtime the runtime
     * @param {Module} importedModule the imported module (optional)
     * @returns {{ exports?: Exports, checked?: Checked } | undefined} information
     */
    getStarReexports(moduleGraph: ModuleGraph, runtime: RuntimeSpec, importedModule?: Module): {
        exports?: Exports;
        checked?: Checked;
    } | undefined;
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
declare namespace CommonJsExportRequireDependency {
    export { CommonJsExportRequireDependencyTemplate as Template, idsSymbol, KINDS, ObjectDeserializerContext, ObjectSerializerContext, Exports, Checked };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
import type { CommonJSDependencyBaseKeywords } from "./CommonJsDependencyHelpers";
import type CommonJsRequireDependency from "./CommonJsRequireDependency";
import type ModuleGraph from "../../graph/ModuleGraph";
import Dependency = require("../../graph/Dependency");
import type { RuntimeSpec } from "../../util/runtime";
import type Module from "../../module/Module";
declare const CommonJsExportRequireDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class CommonJsExportRequireDependencyTemplate extends CommonJsExportRequireDependencyTemplate_base {
}
/** @import { ReplaceSource } from "webpack-sources" */
/**
 * @import {
 * 	ExportsSpec,
 * 	GetConditionFn,
 * 	RawReferencedExports,
 * 	ReferencedExports,
 * 	TRANSITIVE,
 * 	ExportInfoName,
 * 	DependencyKinds
 * } from "../../graph/Dependency"
 */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import ExportsInfo, { ExportInfo } from "../../graph/ExportsInfo" */
/** @import Module from "../../module/Module" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import { RuntimeSpec } from "../../util/runtime" */
/** @import CommonJsRequireDependency from "./CommonJsRequireDependency" */
/**
 * @import {
 * 	CommonJSDependencyBaseKeywords
 * } from "./CommonJsDependencyHelpers"
 */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[undefined | boolean, Range, Range | null, CommonJSDependencyBaseKeywords, ExportInfoName[], ExportInfoName[], boolean, boolean, number | null, Range | null, CommonJsRequireDependency | null]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[undefined | boolean, Range, Range | null, CommonJSDependencyBaseKeywords, ExportInfoName[], ExportInfoName[], boolean, boolean, number | null, Range | null, CommonJsRequireDependency | null]>} ObjectSerializerContext */
declare const idsSymbol: symbol;
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[undefined | boolean, Range, Range | null, CommonJSDependencyBaseKeywords, Dependency.ExportInfoName[], Dependency.ExportInfoName[], boolean, boolean, number | null, Range | null, CommonJsRequireDependency | null]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[undefined | boolean, Range, Range | null, CommonJSDependencyBaseKeywords, Dependency.ExportInfoName[], Dependency.ExportInfoName[], boolean, boolean, number | null, Range | null, CommonJsRequireDependency | null]>;
type Exports = Set<string>;
type Checked = Set<string>;
