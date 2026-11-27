export = ModuleDecoratorDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import { ReferencedExports, UpdateHashContext } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, boolean]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, boolean]>} ObjectSerializerContext */
/** @import Hash from "../../util/Hash" */
/** @import { RuntimeSpec } from "../../util/runtime" */
declare class ModuleDecoratorDependency extends NullDependency {
    /**
     * Creates an instance of ModuleDecoratorDependency.
     * @param {string} decorator the decorator requirement
     * @param {boolean} allowExportsAccess allow to access exports from module
     */
    constructor(decorator: string, allowExportsAccess: boolean);
    /** @type {string} */
    decorator: string;
    /** @type {boolean} */
    allowExportsAccess: boolean;
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
declare namespace ModuleDecoratorDependency {
    export { ModuleDecoratorDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
declare const ModuleDecoratorDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class ModuleDecoratorDependencyTemplate extends ModuleDecoratorDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, boolean]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, boolean]>;
import Dependency = require("../../graph/Dependency");
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
