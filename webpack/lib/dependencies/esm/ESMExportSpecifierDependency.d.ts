export = ESMExportSpecifierDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import { DependencyKinds, ExportsSpec, LazyRole, UpdateHashContext } from "../../graph/Dependency" */
/** @import Module, { BuildInfo } from "../../module/Module" */
/** @import Hash from "../../util/Hash" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { ConnectionState } from "../../graph/ModuleGraphConnection" */
/** @import { InlinedValue } from "../../optimize/InlineExports" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string, InlinedValue | null | undefined]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string, InlinedValue | null | undefined]>} ObjectSerializerContext */
/** @import { UnusedExports, ExportMap } from "./ESMExportInitFragment" */
/**
 * @import {
 * 	JavascriptModuleBuildInfo
 * } from "../../javascript/JavascriptModule"
 */
declare class ESMExportSpecifierDependency extends NullDependency {
    /**
     * Creates an instance of ESMExportSpecifierDependency.
     * @param {string} id the id
     * @param {string} name the name
     * @param {InlinedValue | null=} constValue undefined = not const, null = const but not inline-eligible, InlinedValue = const and inline-eligible
     */
    constructor(id: string, name: string, constValue?: (InlinedValue | null) | undefined);
    /** @type {string} */
    id: string;
    /** @type {string} */
    name: string;
    /** @type {InlinedValue | null | undefined} */
    constValue: InlinedValue | null | undefined;
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
declare namespace ESMExportSpecifierDependency {
    export { ESMExportSpecifierDependencyTemplate as Template, KINDS, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type { InlinedValue } from "../../optimize/InlineExports";
declare const ESMExportSpecifierDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class ESMExportSpecifierDependencyTemplate extends ESMExportSpecifierDependencyTemplate_base {
}
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string, InlinedValue | null | undefined]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string, InlinedValue | null | undefined]>;
import Dependency = require("../../graph/Dependency");
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
