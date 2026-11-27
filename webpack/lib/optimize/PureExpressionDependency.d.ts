export = PureExpressionDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { UpdateHashContext } from "../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../template/DependencyTemplate" */
/** @import Module from "../module/Module" */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/** @import { ConnectionState } from "../graph/ModuleGraphConnection" */
/** @import { Range } from "../javascript/JavascriptParser" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Set<string> | false]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Set<string> | false]>} ObjectSerializerContext */
/** @import Hash from "../util/Hash" */
/** @import { RuntimeSpec } from "../util/runtime" */
declare class PureExpressionDependency extends NullDependency {
    /**
     * Creates an instance of PureExpressionDependency.
     * @param {Range} range the source range
     */
    constructor(range: Range);
    range: Range;
    /** @type {Set<string> | false} */
    usedByExports: Set<string> | false;
    /**
     * Get runtime condition.
     * @param {ModuleGraph} moduleGraph module graph
     * @param {RuntimeSpec} runtime current runtimes
     * @returns {boolean | RuntimeSpec} runtime condition
     */
    _getRuntimeCondition(moduleGraph: ModuleGraph, runtime: RuntimeSpec): boolean | RuntimeSpec;
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
declare namespace PureExpressionDependency {
    export { PureExpressionDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../dependencies/core/NullDependency");
import type { Range } from "../javascript/JavascriptParser";
import type ModuleGraph from "../graph/ModuleGraph";
import type { RuntimeSpec } from "../util/runtime";
declare const PureExpressionDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class PureExpressionDependencyTemplate extends PureExpressionDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Set<string> | false]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Set<string> | false]>;
import type Dependency from "../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../template/DependencyTemplate";
