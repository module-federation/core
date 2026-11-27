export = RequireEnsureDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import AsyncDependenciesBlock from "../../graph/AsyncDependenciesBlock" */
/** @import Dependency from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range, Range | false]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range, Range | false]>} ObjectSerializerContext */
declare class RequireEnsureDependency extends NullDependency {
    /**
     * Creates an instance of RequireEnsureDependency.
     * @param {Range} range range
     * @param {Range} contentRange content range
     * @param {Range | false} errorHandlerRange error handler range
     */
    constructor(range: Range, contentRange: Range, errorHandlerRange: Range | false);
    range: Range;
    contentRange: Range;
    errorHandlerRange: false | Range;
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
declare namespace RequireEnsureDependency {
    export { RequireEnsureDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const RequireEnsureDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class RequireEnsureDependencyTemplate extends RequireEnsureDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range, Range | false]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range, Range | false]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
