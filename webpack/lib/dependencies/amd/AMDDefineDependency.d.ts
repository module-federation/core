export = AMDDefineDependency;
declare class AMDDefineDependency extends NullDependency {
    /**
     * Creates an instance of AMDDefineDependency.
     * @param {Range} range range
     * @param {Range | null} arrayRange array range
     * @param {Range | null} functionRange function range
     * @param {Range | null} objectRange object range
     * @param {string | null} namedModule true, when define is called with a name
     */
    constructor(range: Range, arrayRange: Range | null, functionRange: Range | null, objectRange: Range | null, namedModule: string | null);
    range: Range;
    arrayRange: Range;
    functionRange: Range;
    objectRange: Range;
    /** @type {string | null} */
    namedModule: string | null;
    /** @type {LocalModule | null} */
    localModule: LocalModule | null;
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
declare namespace AMDDefineDependency {
    export { AMDDefineDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext, Definition };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
import type LocalModule from "./LocalModule";
declare const AMDDefineDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class AMDDefineDependencyTemplate extends AMDDefineDependencyTemplate_base {
    /**
     * Returns variable name.
     * @param {AMDDefineDependency} dependency dependency
     * @returns {string | false | null} variable name
     */
    localModuleVar(dependency: AMDDefineDependency): string | false | null;
    /**
     * Returns branch.
     * @param {AMDDefineDependency} dependency dependency
     * @returns {string} branch
     */
    branch(dependency: AMDDefineDependency): string;
    /**
     * Processes the provided dependency.
     * @param {AMDDefineDependency} dependency dependency
     * @param {ReplaceSource} source source
     * @param {string} definition definition
     * @param {string} text text
     */
    replace(dependency: AMDDefineDependency, source: ReplaceSource, definition: string, text: string): void;
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range | null, Range | null, Range | null, string | null, LocalModule | null]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range | null, Range | null, Range | null, string | null, LocalModule | null]>;
type Definition = {
    /**
     * variable declarations
     */
    definition: string;
    /**
     * replacement text
     */
    content: string;
    /**
     * runtime requirements
     */
    requests: string[];
};
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
