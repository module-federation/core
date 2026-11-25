export = AMDRequireDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import AsyncDependenciesBlock from "../../graph/AsyncDependenciesBlock" */
/** @import Dependency from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range, Range | null, Range | null, boolean, boolean]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range, Range | null, Range | null, boolean, boolean]>} ObjectSerializerContext */
declare class AMDRequireDependency extends NullDependency {
    /**
     * Creates an instance of AMDRequireDependency.
     * @param {Range} outerRange outer range
     * @param {Range} arrayRange array range
     * @param {Range | null} functionRange function range
     * @param {Range | null} errorCallbackRange error callback range
     */
    constructor(outerRange: Range, arrayRange: Range, functionRange: Range | null, errorCallbackRange: Range | null);
    outerRange: Range;
    arrayRange: Range;
    functionRange: Range;
    errorCallbackRange: Range;
    /** @type {boolean} */
    functionBindThis: boolean;
    /** @type {boolean} */
    errorCallbackBindThis: boolean;
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
declare namespace AMDRequireDependency {
    export { AMDRequireDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const AMDRequireDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class AMDRequireDependencyTemplate extends AMDRequireDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range, Range | null, Range | null, boolean, boolean]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range, Range | null, Range | null, boolean, boolean]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
