export = CommonJsExportsDependency;
declare class CommonJsExportsDependency extends NullDependency {
    /**
     * Creates an instance of CommonJsExportsDependency.
     * @param {Range} range range
     * @param {Range | null} valueRange value range
     * @param {CommonJSDependencyBaseKeywords} base base
     * @param {ExportInfoName[]} names names
     */
    constructor(range: Range, valueRange: Range | null, base: CommonJSDependencyBaseKeywords, names: Dependency.ExportInfoName[]);
    range: Range;
    valueRange: Range;
    /** @type {CommonJSDependencyBaseKeywords} */
    base: CommonJSDependencyBaseKeywords;
    /** @type {string[]} */
    names: string[];
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
declare namespace CommonJsExportsDependency {
    export { CommonJsExportsDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
import type { CommonJSDependencyBaseKeywords } from "./CommonJsDependencyHelpers";
import type Dependency from "../../graph/Dependency";
declare const CommonJsExportsDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class CommonJsExportsDependencyTemplate extends CommonJsExportsDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range | null, CommonJSDependencyBaseKeywords, Dependency.ExportInfoName[]]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range | null, CommonJSDependencyBaseKeywords, Dependency.ExportInfoName[]]>;
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
