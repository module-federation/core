export = WorkerDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../AsyncDependenciesBlock")} AsyncDependenciesBlock */
/** @typedef {import("../Dependency").ReferencedExports} ReferencedExports */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Entrypoint")} Entrypoint */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class WorkerDependency extends ModuleDependency {
    /**
     * @param {string} request request
     * @param {Range} range range
     * @param {object} workerDependencyOptions options
     * @param {string=} workerDependencyOptions.publicPath public path for the worker
     * @param {boolean=} workerDependencyOptions.needNewUrl need generate `new URL(...)`
     */
    constructor(request: string, range: Range, workerDependencyOptions: {
        publicPath?: string | undefined;
        needNewUrl?: boolean | undefined;
    });
    options: {
        publicPath?: string | undefined;
        needNewUrl?: boolean | undefined;
    };
    /** Cache the hash */
    _hashUpdate: string;
}
declare namespace WorkerDependency {
    export { WorkerDependencyTemplate as Template, ReplaceSource, AsyncDependenciesBlock, ReferencedExports, UpdateHashContext, DependencyTemplateContext, Entrypoint, ModuleGraph, Range, ObjectDeserializerContext, ObjectSerializerContext, Hash, RuntimeSpec };
}
import ModuleDependency = require("./ModuleDependency");
declare const WorkerDependencyTemplate_base: typeof import("../DependencyTemplate");
declare class WorkerDependencyTemplate extends WorkerDependencyTemplate_base {
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type AsyncDependenciesBlock = import("../AsyncDependenciesBlock");
type ReferencedExports = import("../Dependency").ReferencedExports;
type UpdateHashContext = import("../Dependency").UpdateHashContext;
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type Entrypoint = import("../Entrypoint");
type ModuleGraph = import("../ModuleGraph");
type Range = import("../javascript/JavascriptParser").Range;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type Hash = import("../util/Hash");
type RuntimeSpec = import("../util/runtime").RuntimeSpec;
