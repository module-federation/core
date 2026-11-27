export = ExportsInfoDependency;
declare class ExportsInfoDependency extends NullDependency {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {ExportsInfoDependency} ExportsInfoDependency
     */
    static deserialize(context: ObjectDeserializerContext): ExportsInfoDependency;
    /**
     * Creates an instance of ExportsInfoDependency.
     * @param {Range} range range
     * @param {ExportInfoName[] | null} exportName export name
     * @param {string | null} property property
     */
    constructor(range: Range, exportName: Dependency.ExportInfoName[] | null, property: string | null);
    range: Range;
    /** @type {string[] | null} */
    exportName: string[] | null;
    /** @type {string | null} */
    property: string | null;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace ExportsInfoDependency {
    export { ExportsInfoDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext, SortableSet };
}
import NullDependency = require("../dependencies/core/NullDependency");
import type { Range } from "../javascript/JavascriptParser";
import type Dependency from "../graph/Dependency";
declare const ExportsInfoDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class ExportsInfoDependencyTemplate extends ExportsInfoDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Dependency.ExportInfoName[] | null, string | null]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Dependency.ExportInfoName[] | null, string | null]>;
/**
 * Defines the sortable set type used by this module.
 */
type SortableSet<T> = import("../util/SortableSet")<T>;
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../template/DependencyTemplate";
