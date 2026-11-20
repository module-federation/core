export = ImportContextDependency;
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import { ObjectDeserializerContext, ObjectSerializerContext } from "../../serialization/ObjectMiddleware" */
/** @import { ContextDependencyOptions } from "../context/ContextDependency" */
/** @import { ReplaceSource } from "webpack-sources" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
declare class ImportContextDependency extends ContextDependency {
    /**
     * Creates an instance of ImportContextDependency.
     * @param {ContextDependencyOptions} options options
     * @param {Range} range range
     * @param {Range} valueRange value range
     */
    constructor(options: ContextDependency.ContextDependencyOptions, range: Range, valueRange: Range);
    /** @type {Range | undefined} */
    optionsRange: Range | undefined;
}
declare namespace ImportContextDependency {
    export { ImportContextDependencyTemplate as Template };
}
import ContextDependency = require("../context/ContextDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare class ImportContextDependencyTemplate extends ContextDependencyTemplateAsRequireCall {
}
import ContextDependencyTemplateAsRequireCall = require("../context/ContextDependencyTemplateAsRequireCall");
