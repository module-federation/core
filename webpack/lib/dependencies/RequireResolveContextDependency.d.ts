export = RequireResolveContextDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./ContextDependency").ContextDependencyOptions} ContextDependencyOptions */
declare class RequireResolveContextDependency extends ContextDependency {
    /**
     * @param {ContextDependencyOptions} options options
     * @param {Range} range range
     * @param {Range} valueRange value range
     * @param {string=} context context
     */
    constructor(options: ContextDependencyOptions, range: Range, valueRange: Range, context?: string | undefined);
}
declare namespace RequireResolveContextDependency {
    export { ContextDependencyTemplateAsId as Template, Range, ObjectDeserializerContext, ObjectSerializerContext, ContextDependencyOptions };
}
import ContextDependency = require("./ContextDependency");
import ContextDependencyTemplateAsId = require("./ContextDependencyTemplateAsId");
type Range = import("../javascript/JavascriptParser").Range;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type ContextDependencyOptions = import("./ContextDependency").ContextDependencyOptions;
