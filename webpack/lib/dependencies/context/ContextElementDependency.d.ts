export = ContextElementDependency;
/** @import ContextModule from "../../context/ContextModule" */
/** @import { RawReferencedExports, ReferencedExports, DependencyKinds } from "../../graph/Dependency" */
/** @import Module from "../../module/Module" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { ImportAttributes } from "../../javascript/JavascriptParser" */
/** @import { RuntimeSpec } from "../../util/runtime" */
/** @import { ImportPhaseType } from "../core/ImportPhase" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string | undefined, string, RawReferencedExports | null | undefined, ImportAttributes | undefined, string | undefined, ImportPhaseType]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string | undefined, string, RawReferencedExports | null | undefined, ImportAttributes | undefined, string | undefined, ImportPhaseType]>} ObjectSerializerContext */
declare class ContextElementDependency extends ModuleDependency {
    /**
     * Creates an instance of ContextElementDependency.
     * @param {string} request request
     * @param {string | undefined} userRequest user request
     * @param {string | undefined} typePrefix type prefix
     * @param {string} category category
     * @param {RawReferencedExports | null=} referencedExports referenced exports
     * @param {string=} context context
     * @param {ImportAttributes=} attributes import assertions
     * @param {string=} contextRequest the request of the context as written by the user, without query and fragment
     * @param {ImportPhaseType=} phase import phase
     */
    constructor(request: string, userRequest: string | undefined, typePrefix: string | undefined, category: string, referencedExports?: (Dependency.RawReferencedExports | null) | undefined, context?: string | undefined, attributes?: ImportAttributes | undefined, contextRequest?: string | undefined, phase?: ImportPhaseType | undefined);
    /** @type {string | undefined} */
    _typePrefix: string | undefined;
    /** @type {string} */
    _category: string;
    /** @type {RawReferencedExports | null | undefined} */
    referencedExports: Dependency.RawReferencedExports | null | undefined;
    /** @type {ImportAttributes | undefined} */
    attributes: ImportAttributes | undefined;
    /** @type {string | undefined} */
    _contextRequest: string | undefined;
    /** @type {ImportPhaseType} */
    phase: ImportPhaseType;
    /**
     * The request as the user wrote it, e.g. `#configs/file.mjs` where `request`
     * is the `./file.mjs` relative to the resolved `#configs` directory.
     * @returns {string} the original request
     */
    get originalRequest(): string;
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
declare namespace ContextElementDependency {
    export { KINDS, ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("../core/ModuleDependency");
import Dependency = require("../../graph/Dependency");
import type { ImportAttributes } from "../../javascript/JavascriptParser";
import type { ImportPhaseType } from "../core/ImportPhase";
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string | undefined, string, Dependency.RawReferencedExports | null | undefined, ImportAttributes | undefined, string | undefined, ImportPhaseType]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string | undefined, string, Dependency.RawReferencedExports | null | undefined, ImportAttributes | undefined, string | undefined, ImportPhaseType]>;
