export = ImportContextDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./ContextDependency").ContextDependencyOptions} ContextDependencyOptions */
declare class ImportContextDependency extends ContextDependency {
    /**
     * @param {ContextDependencyOptions} options options
     * @param {Range} range range
     * @param {Range} valueRange value range
     */
    constructor(options: ContextDependencyOptions, range: Range, valueRange: Range);
}
declare namespace ImportContextDependency {
    export { ContextDependencyTemplateAsRequireCall as Template, Range, ObjectDeserializerContext, ObjectSerializerContext, ContextDependencyOptions };
}
import ContextDependency = require("./ContextDependency");
import ContextDependencyTemplateAsRequireCall = require("./ContextDependencyTemplateAsRequireCall");
type Range = import("../javascript/JavascriptParser").Range;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type ContextDependencyOptions = import("./ContextDependency").ContextDependencyOptions;
