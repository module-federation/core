export = ESMExportExpressionDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import { ExportsSpec, LazyRole, UpdateHashContext } from "../../graph/Dependency" */
/** @import Module, { BuildInfo } from "../../module/Module" */
/** @import Hash from "../../util/Hash" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { ConnectionState } from "../../graph/ModuleGraphConnection" */
/** @import { InlinedValue } from "../../optimize/InlineExports" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {string | { id?: string | undefined, range: Range, prefix: string, suffix: string }} DeclarationId */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range, string, DeclarationId | undefined, boolean, boolean, InlinedValue | undefined]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range, string, DeclarationId | undefined, boolean, boolean, InlinedValue | undefined]>} ObjectSerializerContext */
/** @import { ExportMap } from "./ESMExportInitFragment" */
/**
 * @import {
 * 	JavascriptModuleBuildInfo
 * } from "../../javascript/JavascriptModule"
 */
declare class ESMExportExpressionDependency extends NullDependency {
    /**
     * Creates an instance of ESMExportExpressionDependency.
     * @param {Range} range range
     * @param {Range} rangeStatement range statement
     * @param {string} prefix prefix
     * @param {string | { id?: string | undefined, range: Range, prefix: string, suffix: string }=} declarationId declaration id
     * @param {InlinedValue=} constValue inlined primitive when `export default <const>` is inline-eligible
     */
    constructor(range: Range, rangeStatement: Range, prefix: string, declarationId?: (string | {
        id?: string | undefined;
        range: Range;
        prefix: string;
        suffix: string;
    }) | undefined, constValue?: InlinedValue | undefined);
    range: Range;
    rangeStatement: Range;
    /** @type {string} */
    prefix: string;
    declarationId: string | {
        id?: string | undefined;
        range: Range;
        prefix: string;
        suffix: string;
    };
    constValue: InlinedValue;
    /** @type {boolean} */
    isAnonymousDefault: boolean;
    /** @type {boolean} */
    isAnonymousDefaultClass: boolean;
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
declare namespace ESMExportExpressionDependency {
    export { ESMExportDependencyTemplate as Template, DeclarationId, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
import type { InlinedValue } from "../../optimize/InlineExports";
declare const ESMExportDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class ESMExportDependencyTemplate extends ESMExportDependencyTemplate_base {
}
type DeclarationId = string | {
    id?: string | undefined;
    range: Range;
    prefix: string;
    suffix: string;
};
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, Range, string, DeclarationId | undefined, boolean, boolean, InlinedValue | undefined]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, Range, string, DeclarationId | undefined, boolean, boolean, InlinedValue | undefined]>;
import Dependency = require("../../graph/Dependency");
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
