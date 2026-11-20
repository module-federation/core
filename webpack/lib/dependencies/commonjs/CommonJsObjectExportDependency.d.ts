export = CommonJsObjectExportDependency;
declare class CommonJsObjectExportDependency extends NullDependency {
    /**
     * @param {Range} range property range
     * @param {Range} keyRange key range
     * @param {Range} valueRange value / function range
     * @param {ExportInfoName} name export name
     * @param {CommonJsObjectExportKind} kind property kind
     * @param {boolean} pure value is known to be side-effect free
     */
    constructor(range: Range, keyRange: Range, valueRange: Range, name: Dependency.ExportInfoName, kind: CommonJsObjectExportKind, pure: boolean);
    range: Range;
    keyRange: Range;
    valueRange: Range;
    /** @type {ExportInfoName} */
    name: Dependency.ExportInfoName;
    /** @type {CommonJsObjectExportKind} */
    kind: CommonJsObjectExportKind;
    /** @type {boolean} */
    pure: boolean;
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
declare namespace CommonJsObjectExportDependency {
    export { CommonJsObjectExportDependencyTemplate as Template, FUNCTION_PROPERTY_DROP_HEAD, CommonJsObjectExportKind, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
import type Dependency from "../../graph/Dependency";
declare const CommonJsObjectExportDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class CommonJsObjectExportDependencyTemplate extends CommonJsObjectExportDependencyTemplate_base {
}
/** @type {ReadonlyMap<CommonJsObjectExportKind, string>} */
declare const FUNCTION_PROPERTY_DROP_HEAD: ReadonlyMap<CommonJsObjectExportKind, string>;
type CommonJsObjectExportKind = "keyValue" | "shorthand" | "get" | "set" | "method" | "asyncMethod" | "generatorMethod" | "asyncGeneratorMethod";
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range, Range, Dependency.ExportInfoName, CommonJsObjectExportKind, boolean]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range, Range, Dependency.ExportInfoName, CommonJsObjectExportKind, boolean]>;
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
