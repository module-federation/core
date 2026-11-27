export = RuntimeRequirementsDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import { RawRuntimeRequirements } from "./NullDependency" */
/** @import Dependency, { UpdateHashContext } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Set<string>]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Set<string>]>} ObjectSerializerContext */
/** @import Hash from "../../util/Hash" */
declare class RuntimeRequirementsDependency extends NullDependency {
    /**
     * Creates an instance of RuntimeRequirementsDependency.
     * @param {RawRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: NullDependency.RawRuntimeRequirements);
    /** @type {Set<string>} */
    runtimeRequirements: Set<string>;
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
declare namespace RuntimeRequirementsDependency {
    export { RuntimeRequirementsDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("./NullDependency");
declare const RuntimeRequirementsDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class RuntimeRequirementsDependencyTemplate extends RuntimeRequirementsDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Set<string>]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Set<string>]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
