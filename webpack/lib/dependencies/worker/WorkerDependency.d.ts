export = WorkerDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import AsyncDependenciesBlock from "../../graph/AsyncDependenciesBlock" */
/** @import { ReferencedExports, UpdateHashContext, DependencyKinds } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import Entrypoint from "../../graph/Entrypoint" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[WorkerDependencyOptions]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[WorkerDependencyOptions]>} ObjectSerializerContext */
/** @import Hash from "../../util/Hash" */
/** @import { RuntimeSpec } from "../../util/runtime" */
/**
 * @typedef {object} ResourceHint
 * @property {true=} prefetch emit `<link rel="prefetch">`
 * @property {true=} preload emit `<link rel="preload">` (wins over prefetch when both are set)
 * @property {("high" | "low" | "auto")=} fetchPriority value for the `fetchpriority` attribute
 * @property {string=} as override for the `as` attribute (defaults to `"script"`)
 * @property {string=} type value for the `type` attribute
 * @property {string=} media value for the `media` attribute
 */
/**
 * Represents the worker dependency runtime component.
 * @typedef {object} WorkerDependencyOptions
 * @property {string=} publicPath public path for the worker
 * @property {boolean=} needNewUrl true when need generate `new URL(...)`, otherwise false
 * @property {Range=} workerConstructorRange range of the global `Worker` constructor, set only for the `new Worker()` global syntax that needs a node-target rewrite
 * @property {ResourceHint=} resourceHint resource hint to inject for the worker chunk
 */
declare class WorkerDependency extends ModuleDependency {
    /**
     * Creates an instance of WorkerDependency.
     * @param {string} request request
     * @param {Range} range range
     * @param {WorkerDependencyOptions} workerDependencyOptions options
     */
    constructor(request: string, range: Range, workerDependencyOptions: WorkerDependencyOptions);
    /** @type {WorkerDependencyOptions} */
    options: WorkerDependencyOptions;
    /** Cache the hash */
    /** @type {undefined | string} */
    _hashUpdate: undefined | string;
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
declare namespace WorkerDependency {
    export { WorkerDependencyTemplate as Template, KINDS, ObjectDeserializerContext, ObjectSerializerContext, ResourceHint, WorkerDependencyOptions };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const WorkerDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class WorkerDependencyTemplate extends WorkerDependencyTemplate_base {
}
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[WorkerDependencyOptions]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[WorkerDependencyOptions]>;
type ResourceHint = {
    /**
     * emit `<link rel="prefetch">`
     */
    prefetch?: true | undefined;
    /**
     * emit `<link rel="preload">` (wins over prefetch when both are set)
     */
    preload?: true | undefined;
    /**
     * value for the `fetchpriority` attribute
     */
    fetchPriority?: ("high" | "low" | "auto") | undefined;
    /**
     * override for the `as` attribute (defaults to `"script"`)
     */
    as?: string | undefined;
    /**
     * value for the `type` attribute
     */
    type?: string | undefined;
    /**
     * value for the `media` attribute
     */
    media?: string | undefined;
};
/**
 * Represents the worker dependency runtime component.
 */
type WorkerDependencyOptions = {
    /**
     * public path for the worker
     */
    publicPath?: string | undefined;
    /**
     * true when need generate `new URL(...)`, otherwise false
     */
    needNewUrl?: boolean | undefined;
    /**
     * range of the global `Worker` constructor, set only for the `new Worker()` global syntax that needs a node-target rewrite
     */
    workerConstructorRange?: Range | undefined;
    /**
     * resource hint to inject for the worker chunk
     */
    resourceHint?: ResourceHint | undefined;
};
import Dependency = require("../../graph/Dependency");
