export = ESMAcceptDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import ESMAcceptImportDependency from "./ESMAcceptImportDependency" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, ESMAcceptImportDependency[], boolean]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, ESMAcceptImportDependency[], boolean]>} ObjectSerializerContext */
declare class ESMAcceptDependency extends NullDependency {
    /**
     * Creates an instance of ESMAcceptDependency.
     * @param {Range} range expression range
     * @param {ESMAcceptImportDependency[]} dependencies import dependencies
     * @param {boolean} hasCallback true, if the range wraps an existing callback
     */
    constructor(range: Range, dependencies: ESMAcceptImportDependency[], hasCallback: boolean);
    range: Range;
    /** @type {ESMAcceptImportDependency[]} */
    dependencies: ESMAcceptImportDependency[];
    /** @type {boolean} */
    hasCallback: boolean;
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
declare namespace ESMAcceptDependency {
    export { ESMAcceptDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
import type ESMAcceptImportDependency from "./ESMAcceptImportDependency";
declare const ESMAcceptDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class ESMAcceptDependencyTemplate extends ESMAcceptDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, ESMAcceptImportDependency[], boolean]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, ESMAcceptImportDependency[], boolean]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
