export = CommonJsFullRequireDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/**
 * @import Dependency, {
 * 	GetConditionFn,
 * 	ReferencedExports,
 * 	ExportInfoName,
 * 	DependencyKinds
 * } from "../../graph/Dependency"
 */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import { UsedByExports } from "../../optimize/InnerGraph" */
/** @import { RuntimeSpec } from "../../util/runtime" */
/** @import { IdRanges } from "../helpers/chainedImports" */
/** @import { DependencyGuard } from "../esm/ESMImportGuard" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[ExportInfoName[], IdRanges | undefined, boolean, undefined | boolean, DependencyGuard[] | undefined, boolean, boolean, UsedByExports | undefined]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[ExportInfoName[], IdRanges | undefined, boolean, undefined | boolean, DependencyGuard[] | undefined, boolean, boolean, UsedByExports | undefined]>} ObjectSerializerContext */
declare class CommonJsFullRequireDependency extends ModuleDependency {
    /**
     * Creates an instance of CommonJsFullRequireDependency.
     * @param {string} request the request string
     * @param {Range} range location in source code
     * @param {ExportInfoName[]} names accessed properties on module
     * @param {IdRanges=} idRanges ranges for members of ids; the two arrays are right-aligned
     */
    constructor(request: string, range: Range, names: Dependency.ExportInfoName[], idRanges?: IdRanges | undefined);
    /** @type {string[]} */
    names: string[];
    /** @type {IdRanges | undefined} */
    idRanges: IdRanges | undefined;
    /** @type {boolean} */
    call: boolean;
    /** @type {boolean} */
    namespaceObjectAsContext: boolean;
    /** @type {undefined | boolean} */
    asiSafe: undefined | boolean;
    /** @type {DependencyGuard[] | undefined} */
    branchGuards: ESMImportGuard.DependencyGuard[] | undefined;
    /** @type {UsedByExports | undefined} */
    usedByExports: UsedByExports | undefined;
    /** @type {boolean} */
    _canConcatenate: boolean;
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
declare namespace CommonJsFullRequireDependency {
    export { CommonJsFullRequireDependencyTemplate as Template, KINDS, ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { IdRanges } from "../helpers/chainedImports";
import ESMImportGuard = require("../esm/ESMImportGuard");
import type { UsedByExports } from "../../optimize/InnerGraph";
import type { Range } from "../../javascript/JavascriptParser";
import type Dependency from "../../graph/Dependency";
declare const CommonJsFullRequireDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class CommonJsFullRequireDependencyTemplate extends CommonJsFullRequireDependencyTemplate_base {
}
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Dependency.ExportInfoName[], IdRanges | undefined, boolean, undefined | boolean, ESMImportGuard.DependencyGuard[] | undefined, boolean, boolean, UsedByExports | undefined]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Dependency.ExportInfoName[], IdRanges | undefined, boolean, undefined | boolean, ESMImportGuard.DependencyGuard[] | undefined, boolean, boolean, UsedByExports | undefined]>;
