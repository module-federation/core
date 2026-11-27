export = ESMLiveExportDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { DependencyKinds, UpdateHashContext } from "../../graph/Dependency" */
/** @import ModuleGraph, { LiveBinding } from "../../graph/ModuleGraph" */
/** @import Module from "../../module/Module" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import Hash from "../../util/Hash" */
/** @import { RuntimeSpec } from "../../util/runtime" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string[], number[], number[], boolean, boolean, boolean]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string[], number[], number[], boolean, boolean, boolean]>} ObjectSerializerContext */
/**
 * The names the chunk's scope declares for a declaration, and how the module keeps them.
 * @typedef {object} HoistedNames
 * @property {string[]} names the declared name of each name
 * @property {boolean} mirrored whether the module keeps its declaration and mirrors each write
 * @property {boolean} registered whether it mirrors them through the setters a module library registers
 */
/**
 * A module-level binding a module library may declare in the chunk's scope under a
 * reserved name, so the library exports the binding itself; it holds every reference,
 * and every write a module keeping its declaration mirrors there instead.
 */
declare class ESMLiveExportDependency extends NullDependency {
    /**
     * Creates an instance of ESMLiveExportDependency.
     * @param {string[]} names every name the declaration declares
     * @param {number[]} occurrences flat triples of start, end and `name index * KINDS_PER_NAME + kind` renaming takes, a kind from {@link ESMLiveExportDependency.REFERENCE}
     * @param {number[]} mirrors the same triples for where a module keeping its declaration mirrors a write, a kind from {@link ESMLiveExportDependency.SYNC}
     * @param {boolean} readByEval whether the module calls `eval`, which reads the names as written
     * @param {boolean} hot whether a hot update replaces the module, which then only mirrors, as renaming cannot reach it
     * @param {boolean} earlyUse whether the module uses a `let` or class above its declaration, where only its own declaration throws
     */
    constructor(names: string[], occurrences: number[], mirrors: number[], readByEval: boolean, hot: boolean, earlyUse: boolean);
    names: string[];
    occurrences: number[];
    mirrors: number[];
    readByEval: boolean;
    hot: boolean;
    earlyUse: boolean;
    /**
     * Returns the names the chunk's scope declares for this runtime, if it does.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {RuntimeSpec} runtime the runtime the module is generated for
     * @returns {HoistedNames | undefined} the names and how the module keeps them
     */
    getHoistedNames(moduleGraph: ModuleGraph, runtime: RuntimeSpec): HoistedNames | undefined;
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
declare namespace ESMLiveExportDependency {
    export { ESMLiveExportDependencyTemplate as Template, REFERENCE, SHORTHAND, NAMED, KEYWORD, PARENTHESIZED, INITIALIZE, SYNC, VALUE, NAMED_VALUE, UNDEFINED, STATEMENT, BODY, DECLARATOR, KINDS_PER_NAME, KINDS, ObjectDeserializerContext, ObjectSerializerContext, HoistedNames };
}
import NullDependency = require("../core/NullDependency");
import type ModuleGraph from "../../graph/ModuleGraph";
import type { RuntimeSpec } from "../../util/runtime";
declare const ESMLiveExportDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class ESMLiveExportDependencyTemplate extends ESMLiveExportDependencyTemplate_base {
}
declare var REFERENCE: number;
declare var SHORTHAND: number;
declare var NAMED: number;
declare var KEYWORD: number;
declare var PARENTHESIZED: number;
declare var INITIALIZE: number;
declare var SYNC: number;
declare var VALUE: number;
declare var NAMED_VALUE: number;
declare var UNDEFINED: number;
declare var STATEMENT: number;
declare var BODY: number;
declare var DECLARATOR: number;
declare var KINDS_PER_NAME: number;
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string[], number[], number[], boolean, boolean, boolean]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string[], number[], number[], boolean, boolean, boolean]>;
/**
 * The names the chunk's scope declares for a declaration, and how the module keeps them.
 */
type HoistedNames = {
    /**
     * the declared name of each name
     */
    names: string[];
    /**
     * whether the module keeps its declaration and mirrors each write
     */
    mirrored: boolean;
    /**
     * whether it mirrors them through the setters a module library registers
     */
    registered: boolean;
};
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
