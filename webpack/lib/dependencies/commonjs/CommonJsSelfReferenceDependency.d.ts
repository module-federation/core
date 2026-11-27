export = CommonJsSelfReferenceDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/**
 * @import Dependency, {
 * 	ReferencedExports,
 * 	UpdateHashContext,
 * 	ExportInfoName
 * } from "../../graph/Dependency"
 */
/** @import Hash from "../../util/Hash" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import { RuntimeSpec } from "../../util/runtime" */
/**
 * @import {
 * 	CommonJSDependencyBaseKeywords
 * } from "./CommonJsDependencyHelpers"
 */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, CommonJSDependencyBaseKeywords, ExportInfoName[], boolean]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, CommonJSDependencyBaseKeywords, ExportInfoName[], boolean]>} ObjectSerializerContext */
declare class CommonJsSelfReferenceDependency extends NullDependency {
    /**
     * Creates an instance of CommonJsSelfReferenceDependency.
     * @param {Range} range range
     * @param {CommonJSDependencyBaseKeywords} base base
     * @param {ExportInfoName[]} names names
     * @param {boolean} call is a call
     */
    constructor(range: Range, base: CommonJSDependencyBaseKeywords, names: Dependency.ExportInfoName[], call: boolean);
    range: Range;
    /** @type {CommonJSDependencyBaseKeywords} */
    base: CommonJSDependencyBaseKeywords;
    /** @type {string[]} */
    names: string[];
    /** @type {boolean} */
    call: boolean;
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
declare namespace CommonJsSelfReferenceDependency {
    export { CommonJsSelfReferenceDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
import type { CommonJSDependencyBaseKeywords } from "./CommonJsDependencyHelpers";
import type Dependency from "../../graph/Dependency";
declare const CommonJsSelfReferenceDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class CommonJsSelfReferenceDependencyTemplate extends CommonJsSelfReferenceDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, CommonJSDependencyBaseKeywords, Dependency.ExportInfoName[], boolean]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, CommonJSDependencyBaseKeywords, Dependency.ExportInfoName[], boolean]>;
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
