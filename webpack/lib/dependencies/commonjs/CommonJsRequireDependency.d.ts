export = CommonJsRequireDependency;
declare class CommonJsRequireDependency extends ModuleDependency {
    /**
     * Creates an instance of CommonJsRequireDependency.
     * @param {string} request request
     * @param {Range=} range location in source code of the string-literal argument (gets replaced by the module id)
     * @param {string=} context request context
     * @param {RawReferencedExports | null=} referencedExports list of referenced exports
     * @param {Range=} valueRange location in source code of the whole `require(...)` call (for `require(esm)` interop)
     */
    constructor(request: string, range?: Range | undefined, context?: string | undefined, referencedExports?: (Dependency.RawReferencedExports | null) | undefined, valueRange?: Range | undefined);
    /** @type {RawReferencedExports | null} */
    referencedExports: Dependency.RawReferencedExports | null;
    valueRange: Range;
    /** @type {DependencyGuard[] | undefined} */
    branchGuards: ESMImportGuard.DependencyGuard[] | undefined;
    /** @type {UsedByExports | undefined} */
    usedByExports: UsedByExports | undefined;
    /** @type {boolean} */
    _canConcatenate: boolean;
    /** @type {boolean} */
    callNew: boolean;
    /** @type {boolean | undefined} */
    asiSafe: boolean | undefined;
    /**
     * Whether this require only evaluates the module (no exports read).
     * @returns {boolean} true when referencedExports is an empty list
     */
    isEvaluationOnly(): boolean;
    /**
     * @param {ModuleGraphConnection} connection the active connection of this dependency
     * @param {ConcatenationScope} concatenationScope the concatenation scope
     * @returns {boolean} true when the call becomes a module reference
     */
    rendersAsConcatenatedReference(connection: ModuleGraphConnection, concatenationScope: ConcatenationScope): boolean;
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
declare namespace CommonJsRequireDependency {
    export { CommonJsRequireDependencyTemplate as Template, KINDS, ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("../core/ModuleDependency");
import Dependency = require("../../graph/Dependency");
import type { Range } from "../../javascript/JavascriptParser";
import ESMImportGuard = require("../esm/ESMImportGuard");
import type { UsedByExports } from "../../optimize/InnerGraph";
import type ModuleGraphConnection from "../../graph/ModuleGraphConnection";
import type ConcatenationScope from "../../optimize/ConcatenationScope";
declare const CommonJsRequireDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class CommonJsRequireDependencyTemplate extends CommonJsRequireDependencyTemplate_base {
}
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Dependency.RawReferencedExports | null, Range | undefined, ESMImportGuard.DependencyGuard[] | undefined, boolean, boolean, UsedByExports | undefined, boolean | undefined]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Dependency.RawReferencedExports | null, Range | undefined, ESMImportGuard.DependencyGuard[] | undefined, boolean, boolean, UsedByExports | undefined, boolean | undefined]>;
