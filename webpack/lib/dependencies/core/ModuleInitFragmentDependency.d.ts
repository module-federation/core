export = ModuleInitFragmentDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string[], string | undefined, string | undefined]>} ObjectSerializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string[], string | undefined, string | undefined]>} ObjectDeserializerContext */
/**
 * A dependency that adds an init fragment to the module
 */
declare class ModuleInitFragmentDependency extends NullDependency {
    /**
     * Creates an instance of ModuleInitFragmentDependency.
     * @param {string} initCode the initialization code
     * @param {string[]} runtimeRequirements runtime requirements
     * @param {string=} key unique key to avoid emitting the same initialization code twice
     * @param {string=} buildTimeInitCode initialization code for build-time execution, when `initCode` is only valid in emitted output
     */
    constructor(initCode: string, runtimeRequirements: string[], key?: string | undefined, buildTimeInitCode?: string | undefined);
    /** @type {string} */
    initCode: string;
    /** @type {string[]} */
    runtimeRequirements: string[];
    /** @type {string | undefined} */
    key: string | undefined;
    /** @type {string | undefined} */
    buildTimeInitCode: string | undefined;
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
declare namespace ModuleInitFragmentDependency {
    export { ModuleInitFragmentDependencyTemplate as Template, ObjectSerializerContext, ObjectDeserializerContext };
}
import NullDependency = require("./NullDependency");
declare const ModuleInitFragmentDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class ModuleInitFragmentDependencyTemplate extends ModuleInitFragmentDependencyTemplate_base {
}
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string[], string | undefined, string | undefined]>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string[], string | undefined, string | undefined]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
