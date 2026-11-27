export = LocalModuleDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { DependencyKinds } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[LocalModule, Range | undefined, boolean]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[LocalModule, Range | undefined, boolean]>} ObjectSerializerContext */
/** @import LocalModule from "./LocalModule" */
declare class LocalModuleDependency extends NullDependency {
    /**
     * Creates an instance of LocalModuleDependency.
     * @param {LocalModule} localModule local module
     * @param {Range | undefined} range range
     * @param {boolean} callNew true, when the local module should be called with new
     */
    constructor(localModule: LocalModule, range: Range | undefined, callNew: boolean);
    /** @type {LocalModule} */
    localModule: LocalModule;
    range: Range;
    /** @type {boolean} */
    callNew: boolean;
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
declare namespace LocalModuleDependency {
    export { LocalModuleDependencyTemplate as Template, KINDS, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type LocalModule from "./LocalModule";
import type { Range } from "../../javascript/JavascriptParser";
declare const LocalModuleDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class LocalModuleDependencyTemplate extends LocalModuleDependencyTemplate_base {
}
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[LocalModule, Range | undefined, boolean]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[LocalModule, Range | undefined, boolean]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
