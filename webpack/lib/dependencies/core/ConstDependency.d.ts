export = ConstDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import { RawRuntimeRequirements } from "./NullDependency" */
/** @import Dependency, { UpdateHashContext } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { ConnectionState } from "../../graph/ModuleGraphConnection" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, number | Range, Set<string> | null]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, number | Range, Set<string> | null]>} ObjectSerializerContext */
/** @import Hash from "../../util/Hash" */
declare class ConstDependency extends NullDependency {
    /**
     * Creates an instance of ConstDependency.
     * @param {string} expression the expression
     * @param {number | Range} range the source range
     * @param {RawRuntimeRequirements | null=} runtimeRequirements runtime requirements
     */
    constructor(expression: string, range: number | Range, runtimeRequirements?: (NullDependency.RawRuntimeRequirements | null) | undefined);
    /** @type {string} */
    expression: string;
    range: number | Range;
    /** @type {Set<string> | null} */
    runtimeRequirements: Set<string> | null;
    /** @type {undefined | string} */
    _hashUpdate: undefined | string;
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
declare namespace ConstDependency {
    export { ConstDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("./NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const ConstDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class ConstDependencyTemplate extends ConstDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, number | Range, Set<string> | null]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, number | Range, Set<string> | null]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
