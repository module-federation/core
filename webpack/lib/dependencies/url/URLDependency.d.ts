export = URLDependency;
declare class URLDependency extends ModuleDependency {
    /**
     * Creates an instance of URLDependency.
     * @param {string} request request
     * @param {Range} range range of the arguments of new URL( |> ... <| )
     * @param {Range} outerRange range of the full |> new URL(...) <|
     * @param {boolean=} relative use relative urls instead of absolute with base uri
     */
    constructor(request: string, range: Range, outerRange: Range, relative?: boolean | undefined);
    outerRange: Range;
    /** @type {boolean} */
    relative: boolean;
    /** @type {UsedByExports | undefined} */
    usedByExports: UsedByExports | undefined;
    /** @type {true | undefined} */
    prefetch: true | undefined;
    /** @type {true | undefined} */
    preload: true | undefined;
    /** @type {"high" | "low" | "auto" | undefined} */
    fetchPriority: "high" | "low" | "auto" | undefined;
    /** @type {string | undefined} */
    asAttribute: string | undefined;
    /** @type {string | undefined} */
    typeAttribute: string | undefined;
    /** @type {string | undefined} */
    mediaAttribute: string | undefined;
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
declare namespace URLDependency {
    export { URLDependencyTemplate as Template, KINDS, ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
import type { UsedByExports } from "../../optimize/InnerGraph";
declare const URLDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class URLDependencyTemplate extends URLDependencyTemplate_base {
}
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Range, boolean, UsedByExports | undefined, true | undefined, true | undefined, ("high" | "low" | "auto" | undefined), string | undefined, string | undefined, string | undefined]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Range, boolean, UsedByExports | undefined, true | undefined, true | undefined, ("high" | "low" | "auto" | undefined), string | undefined, string | undefined, string | undefined]>;
import type Dependency from "../../graph/Dependency";
