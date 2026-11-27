export = URLContextDependency;
/** @import { ContextOptions } from "../../context/ContextModule" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range]>} ObjectSerializerContext */
/** @typedef {ContextOptions & { request: string }} ContextDependencyOptions */
declare class URLContextDependency extends ContextDependency {
    /**
     * Creates an instance of URLContextDependency.
     * @param {ContextDependencyOptions} options options
     * @param {Range} range range
     * @param {Range} valueRange value range
     */
    constructor(options: ContextDependencyOptions, range: Range, valueRange: Range);
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
declare namespace URLContextDependency {
    export { ContextDependencyTemplateAsRequireCall as Template, ObjectDeserializerContext, ObjectSerializerContext, ContextDependencyOptions };
}
import ContextDependency = require("../context/ContextDependency");
import type { Range } from "../../javascript/JavascriptParser";
import ContextDependencyTemplateAsRequireCall = require("../context/ContextDependencyTemplateAsRequireCall");
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range]>;
type ContextDependencyOptions = ContextOptions & {
    request: string;
};
import type { ContextOptions } from "../../context/ContextModule";
