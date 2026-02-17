export = URLContextDependency;
/** @typedef {import("../ContextModule").ContextOptions} ContextOptions */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {ContextOptions & { request: string }} ContextDependencyOptions */
declare class URLContextDependency extends ContextDependency {
    /**
     * @param {ContextDependencyOptions} options options
     * @param {Range} range range
     * @param {Range} valueRange value range
     */
    constructor(options: ContextDependencyOptions, range: Range, valueRange: Range);
}
declare namespace URLContextDependency {
    export { ContextDependencyTemplateAsRequireCall as Template, ContextOptions, Range, ObjectDeserializerContext, ObjectSerializerContext, ContextDependencyOptions };
}
import ContextDependency = require("./ContextDependency");
import ContextDependencyTemplateAsRequireCall = require("./ContextDependencyTemplateAsRequireCall");
type ContextOptions = import("../ContextModule").ContextOptions;
type Range = import("../javascript/JavascriptParser").Range;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type ContextDependencyOptions = ContextOptions & {
    request: string;
};
