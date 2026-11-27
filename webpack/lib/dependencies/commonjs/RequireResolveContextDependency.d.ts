export = RequireResolveContextDependency;
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range]>} ObjectSerializerContext */
/** @import { ContextDependencyOptions } from "../context/ContextDependency" */
declare class RequireResolveContextDependency extends ContextDependency {
    /**
     * Creates an instance of RequireResolveContextDependency.
     * @param {ContextDependencyOptions} options options
     * @param {Range} range range
     * @param {Range} valueRange value range
     * @param {string=} context context
     */
    constructor(options: ContextDependency.ContextDependencyOptions, range: Range, valueRange: Range, context?: string | undefined);
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
declare namespace RequireResolveContextDependency {
    export { ContextDependencyTemplateAsId as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import ContextDependency = require("../context/ContextDependency");
import type { Range } from "../../javascript/JavascriptParser";
import ContextDependencyTemplateAsId = require("../context/ContextDependencyTemplateAsId");
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range]>;
