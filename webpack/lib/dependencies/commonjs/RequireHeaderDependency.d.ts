export = RequireHeaderDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import CommonJsRequireDependency from "./CommonJsRequireDependency" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, CommonJsRequireDependency | undefined]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, CommonJsRequireDependency | undefined]>} ObjectSerializerContext */
declare class RequireHeaderDependency extends NullDependency {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {RequireHeaderDependency} RequireHeaderDependency
     */
    static deserialize(context: ObjectDeserializerContext): RequireHeaderDependency;
    /**
     * Creates an instance of RequireHeaderDependency.
     * @param {Range} range range of the `require` callee
     * @param {CommonJsRequireDependency=} requireDependency paired require dep (unset for conditional `require(a ? b : c)`)
     */
    constructor(range: Range, requireDependency?: CommonJsRequireDependency | undefined);
    range: Range;
    /** @type {CommonJsRequireDependency | undefined} */
    requireDependency: CommonJsRequireDependency | undefined;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace RequireHeaderDependency {
    export { RequireHeaderDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
import type CommonJsRequireDependency from "./CommonJsRequireDependency";
declare const RequireHeaderDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class RequireHeaderDependencyTemplate extends RequireHeaderDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, CommonJsRequireDependency | undefined]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, CommonJsRequireDependency | undefined]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
