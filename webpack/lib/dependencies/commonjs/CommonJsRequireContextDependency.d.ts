export = CommonJsRequireContextDependency;
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range | undefined, boolean | string | undefined]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range | undefined, boolean | string | undefined]>} ObjectSerializerContext */
/** @import { ContextDependencyOptions } from "../context/ContextDependency" */
/** @import { ReferencedExports } from "../../graph/Dependency" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { RuntimeSpec } from "../../util/runtime" */
declare class CommonJsRequireContextDependency extends ContextDependency {
    /**
     * Creates an instance of CommonJsRequireContextDependency.
     * @param {ContextDependencyOptions} options options for the context module
     * @param {Range} range location in source code
     * @param {Range=} valueRange location of the require call
     * @param {boolean | string=} inShorthand true or name
     * @param {string=} context context
     */
    constructor(options: ContextDependency.ContextDependencyOptions, range: Range, valueRange?: Range | undefined, inShorthand?: (boolean | string) | undefined, context?: string | undefined);
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
declare namespace CommonJsRequireContextDependency {
    export { ContextDependencyTemplateAsRequireCall as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import ContextDependency = require("../context/ContextDependency");
import type { Range } from "../../javascript/JavascriptParser";
import ContextDependencyTemplateAsRequireCall = require("../context/ContextDependencyTemplateAsRequireCall");
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range | undefined, boolean | string | undefined]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range | undefined, boolean | string | undefined]>;
