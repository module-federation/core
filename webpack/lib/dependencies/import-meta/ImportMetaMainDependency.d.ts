export = ImportMetaMainDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { UpdateHashContext } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../../serialization/ObjectMiddleware"
 */
/** @import Hash from "../../util/Hash" */
/**
 * `import.meta.main` asks whether the module is the entry, which needs the
 * module argument scope hoisting removes. An inner concatenated module is
 * never an entry module, so it answers with a separate constant expression.
 */
declare class ImportMetaMainDependency extends ConstDependency {
    /**
     * Creates an instance of ImportMetaMainDependency.
     * @param {string} expression the expression a module outside a concatenation evaluates
     * @param {string} concatenatedExpression the expression an inner concatenated module evaluates
     * @param {Range} range the source range
     * @param {(string[] | null)=} runtimeRequirements runtime requirements of `expression`
     */
    constructor(expression: string, concatenatedExpression: string, range: Range, runtimeRequirements?: (string[] | null) | undefined);
    /** @type {string} */
    concatenatedExpression: string;
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
declare namespace ImportMetaMainDependency {
    export { ImportMetaMainDependencyTemplate as Template };
}
import ConstDependency = require("../core/ConstDependency");
import type { ObjectSerializerContext } from "../../serialization/ObjectMiddleware";
import type { ObjectDeserializerContext } from "../../serialization/ObjectMiddleware";
import type { Range } from "../../javascript/JavascriptParser";
declare const ImportMetaMainDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class ImportMetaMainDependencyTemplate extends ImportMetaMainDependencyTemplate_base {
}
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
