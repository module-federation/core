export = BuildTimeConstDependency;
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
 * A constant replacement whose source is only valid in emitted output (e.g.
 * native `import.meta`), with a separate expression for build-time execution.
 */
declare class BuildTimeConstDependency extends ConstDependency {
    /**
     * Creates an instance of BuildTimeConstDependency.
     * @param {string} expression the expression
     * @param {string} buildTimeExpression the expression for build-time execution
     * @param {Range} range the source range
     * @param {(string[] | null)=} runtimeRequirements runtime requirements
     */
    constructor(expression: string, buildTimeExpression: string, range: Range, runtimeRequirements?: (string[] | null) | undefined);
    /** @type {string} */
    buildTimeExpression: string;
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
declare namespace BuildTimeConstDependency {
    export { BuildTimeConstDependencyTemplate as Template };
}
import ConstDependency = require("../core/ConstDependency");
import type { ObjectSerializerContext } from "../../serialization/ObjectMiddleware";
import type { ObjectDeserializerContext } from "../../serialization/ObjectMiddleware";
import type { Range } from "../../javascript/JavascriptParser";
declare const BuildTimeConstDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class BuildTimeConstDependencyTemplate extends BuildTimeConstDependencyTemplate_base {
}
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
