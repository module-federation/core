export = AMDRequireContextDependency;
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range]>} ObjectSerializerContext */
/** @import { ContextDependencyOptions } from "../context/ContextDependency" */
declare class AMDRequireContextDependency extends ContextDependency {
    /**
     * Creates an instance of AMDRequireContextDependency.
     * @param {ContextDependencyOptions} options options
     * @param {Range} range range
     * @param {Range} valueRange value range
     */
    constructor(options: ContextDependency.ContextDependencyOptions, range: Range, valueRange: Range);
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
declare namespace AMDRequireContextDependency {
    export { Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import ContextDependency = require("../context/ContextDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare var Template: typeof import("../context/ContextDependencyTemplateAsRequireCall");
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range]>;
