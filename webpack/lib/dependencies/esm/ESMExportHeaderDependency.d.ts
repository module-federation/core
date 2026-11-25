export = ESMExportHeaderDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range | undefined | null, Range]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range | undefined | null, Range]>} ObjectSerializerContext */
declare class ESMExportHeaderDependency extends NullDependency {
    /**
     * Creates an instance of ESMExportHeaderDependency.
     * @param {Range | undefined | null} range range
     * @param {Range} rangeStatement range statement
     */
    constructor(range: Range | undefined | null, rangeStatement: Range);
    range: Range;
    rangeStatement: Range;
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
declare namespace ESMExportHeaderDependency {
    export { ESMExportDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const ESMExportDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class ESMExportDependencyTemplate extends ESMExportDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range | undefined | null, Range]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range | undefined | null, Range]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
