export = ContextElementDependency;
/** @typedef {import("../ContextModule")} ContextModule */
/** @typedef {import("../Dependency").RawReferencedExports} RawReferencedExports */
/** @typedef {import("../Dependency").ReferencedExports} ReferencedExports */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").ImportAttributes} ImportAttributes */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class ContextElementDependency extends ModuleDependency {
    /**
     * @param {string} request request
     * @param {string | undefined} userRequest user request
     * @param {string | undefined} typePrefix type prefix
     * @param {string} category category
     * @param {RawReferencedExports | null=} referencedExports referenced exports
     * @param {string=} context context
     * @param {ImportAttributes=} attributes import assertions
     */
    constructor(request: string, userRequest: string | undefined, typePrefix: string | undefined, category: string, referencedExports?: (RawReferencedExports | null) | undefined, context?: string | undefined, attributes?: ImportAttributes | undefined);
    _typePrefix: string;
    _category: string;
    referencedExports: Dependency.RawReferencedExports;
    _context: string;
    attributes: import("../javascript/JavascriptParser").ImportAttributes;
}
declare namespace ContextElementDependency {
    export { ContextModule, RawReferencedExports, ReferencedExports, Module, ModuleGraph, ImportAttributes, ObjectDeserializerContext, ObjectSerializerContext, RuntimeSpec };
}
import ModuleDependency = require("./ModuleDependency");
import Dependency = require("../Dependency");
type ContextModule = import("../ContextModule");
type RawReferencedExports = import("../Dependency").RawReferencedExports;
type ReferencedExports = import("../Dependency").ReferencedExports;
type Module = import("../Module");
type ModuleGraph = import("../ModuleGraph");
type ImportAttributes = import("../javascript/JavascriptParser").ImportAttributes;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type RuntimeSpec = import("../util/runtime").RuntimeSpec;
