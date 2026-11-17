export = WorkletDependency;
declare class WorkletDependency extends ModuleDependency {
    /**
     * Creates an instance of WorkletDependency.
     * @param {string} request request
     * @param {Range} range range of the zero-width insertion point (before the call)
     * @param {Range} callRange range of the call argument list `(<url>)`
     * @param {WorkletDependencyOptions} workletDependencyOptions options
     */
    constructor(request: string, range: Range, callRange: Range, workletDependencyOptions: WorkletDependencyOptions);
    /** @type {Range} */
    callRange: Range;
    /** @type {WorkletDependencyOptions} */
    options: WorkletDependencyOptions;
    /** Cache the hash */
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
declare namespace WorkletDependency {
    export { WorkletDependencyTemplate as Template, WORKLET_MODULE, ObjectDeserializerContext, ObjectSerializerContext, WorkletDependencyOptions };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const WorkletDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class WorkletDependencyTemplate extends WorkletDependencyTemplate_base {
}
/** @import { ReplaceSource } from "webpack-sources" */
/** @import AsyncDependenciesBlock from "../../graph/AsyncDependenciesBlock" */
/** @import { ReferencedExports, UpdateHashContext } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import Entrypoint from "../../graph/Entrypoint" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[WorkletDependencyOptions, Range]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[WorkletDependencyOptions, Range]>} ObjectSerializerContext */
/** @import Hash from "../../util/Hash" */
/** @import { RuntimeSpec } from "../../util/runtime" */
/**
 * @typedef {object} WorkletDependencyOptions
 * @property {string=} publicPath public path for the worklet
 */
declare const WORKLET_MODULE: "__webpack_worklet_module__";
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[WorkletDependencyOptions, Range]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[WorkletDependencyOptions, Range]>;
type WorkletDependencyOptions = {
    /**
     * public path for the worklet
     */
    publicPath?: string | undefined;
};
