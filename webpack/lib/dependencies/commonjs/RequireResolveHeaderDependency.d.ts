export = RequireResolveHeaderDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range]>} ObjectSerializerContext */
declare class RequireResolveHeaderDependency extends NullDependency {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {RequireResolveHeaderDependency} RequireResolveHeaderDependency
     */
    static deserialize(context: ObjectDeserializerContext): RequireResolveHeaderDependency;
    /**
     * Creates an instance of RequireResolveHeaderDependency.
     * @param {Range} range range
     */
    constructor(range: Range);
    range: Range;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace RequireResolveHeaderDependency {
    export { RequireResolveHeaderDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const RequireResolveHeaderDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class RequireResolveHeaderDependencyTemplate extends RequireResolveHeaderDependencyTemplate_base {
    /**
     * Apply as template argument.
     * @param {string} name name
     * @param {RequireResolveHeaderDependency} dep dependency
     * @param {ReplaceSource} source source
     */
    applyAsTemplateArgument(name: string, dep: RequireResolveHeaderDependency, source: ReplaceSource): void;
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
