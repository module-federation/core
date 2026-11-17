export = ESMEvaluatedImportSpecifierDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { GetConditionFn, DependencyKinds } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { BuildMeta } from "../../module/Module" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import ModuleGraphConnection from "../../graph/ModuleGraphConnection" */
/** @import { ImportAttributes, Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<string[]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<string[]>} ObjectSerializerContext */
/** @import { Ids } from "./ESMImportDependency" */
/**
 * Dependency for static evaluating import specifier. e.g.
 * @example
 * import a from "a";
 * "x" in a;
 * a.x !== undefined; // if x value statically analyzable
 */
declare class ESMEvaluatedImportSpecifierDependency extends ESMImportSpecifierDependency {
    /**
     * Creates an instance of ESMEvaluatedImportSpecifierDependency.
     * @param {string} request the request string
     * @param {number} sourceOrder source order
     * @param {Ids} ids ids
     * @param {string} name name
     * @param {Range} range location in source code
     * @param {ImportAttributes | undefined} attributes import assertions
     * @param {string} operator operator
     */
    constructor(request: string, sourceOrder: number, ids: Ids, name: string, range: Range, attributes: ImportAttributes | undefined, operator: string);
    /** @type {string} */
    operator: string;
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
declare namespace ESMEvaluatedImportSpecifierDependency {
    export { ESMEvaluatedImportSpecifierDependencyTemplate as Template, KINDS, ObjectDeserializerContext, ObjectSerializerContext };
}
import ESMImportSpecifierDependency = require("./ESMImportSpecifierDependency");
import type { Ids } from "./ESMImportDependency";
import type { Range } from "../../javascript/JavascriptParser";
import type { ImportAttributes } from "../../javascript/JavascriptParser";
declare const ESMEvaluatedImportSpecifierDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
        _getCodeForIds(dep: ESMImportSpecifierDependency, source: ReplaceSource, templateContext: DependencyTemplateContext, ids: ESMImportSpecifierDependency.Ids, connection: ModuleGraphConnection | undefined): string;
        _recordImportBinding(templateContext: DependencyTemplateContext, name: string, value: string): void;
    };
    getImportEmittedRuntime(module: import("../../module/Module"), referencedModule: import("../../module/Module")): import("../../util/runtime").RuntimeSpec | boolean;
};
declare class ESMEvaluatedImportSpecifierDependencyTemplate extends ESMEvaluatedImportSpecifierDependencyTemplate_base {
}
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<string[]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<string[]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
import type ModuleGraphConnection from "../../graph/ModuleGraphConnection";
