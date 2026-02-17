export = AsyncDependenciesBlock;
/** @typedef {import("./ChunkGroup").ChunkGroupOptions} ChunkGroupOptions */
/** @typedef {import("./Dependency").DependencyLocation} DependencyLocation */
/** @typedef {import("./Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("./Entrypoint").EntryOptions} EntryOptions */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./util/Hash")} Hash */
/** @typedef {(ChunkGroupOptions & { entryOptions?: EntryOptions }) | string} GroupOptions */
declare class AsyncDependenciesBlock extends DependenciesBlock {
    /**
     * @param {GroupOptions | null} groupOptions options for the group
     * @param {(DependencyLocation | null)=} loc the line of code
     * @param {(string | null)=} request the request
     */
    constructor(groupOptions: GroupOptions | null, loc?: (DependencyLocation | null) | undefined, request?: (string | null) | undefined);
    groupOptions: import("./ChunkGroup").RawChunkGroupOptions & {
        name?: string | null;
    } & {
        entryOptions?: EntryOptions;
    };
    loc: import("./Dependency").DependencyLocation;
    request: string;
    _stringifiedGroupOptions: string;
    /**
     * @param {string | undefined} value The new chunk name
     * @returns {void}
     */
    set chunkName(value: string | undefined);
    /**
     * @returns {ChunkGroupOptions["name"]} The name of the chunk
     */
    get chunkName(): ChunkGroupOptions["name"];
    set module(value: any);
    get module(): any;
}
declare namespace AsyncDependenciesBlock {
    export { ChunkGroupOptions, DependencyLocation, UpdateHashContext, EntryOptions, ObjectDeserializerContext, ObjectSerializerContext, Hash, GroupOptions };
}
import DependenciesBlock = require("./DependenciesBlock");
type ChunkGroupOptions = import("./ChunkGroup").ChunkGroupOptions;
type DependencyLocation = import("./Dependency").DependencyLocation;
type UpdateHashContext = import("./Dependency").UpdateHashContext;
type EntryOptions = import("./Entrypoint").EntryOptions;
type ObjectDeserializerContext = import("./serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("./serialization/ObjectMiddleware").ObjectSerializerContext;
type Hash = import("./util/Hash");
type GroupOptions = (ChunkGroupOptions & {
    entryOptions?: EntryOptions;
}) | string;
