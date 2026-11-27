export = AsyncDependenciesBlock;
/** @import { ChunkGroupOptions } from "./ChunkGroup" */
/** @import { DependencyLocation, UpdateHashContext } from "./Dependency" */
/** @import { EntryOptions } from "./Entrypoint" */
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../serialization/ObjectMiddleware"
 */
/** @import Hash from "../util/Hash" */
/** @typedef {(ChunkGroupOptions & { entryOptions?: EntryOptions } & { circular?: boolean })} GroupOptions */
declare class AsyncDependenciesBlock extends DependenciesBlock {
    /**
     * @param {GroupOptions | string | null} groupOptions options for the group
     * @param {(DependencyLocation | null)=} loc the line of code
     * @param {(string | null)=} request the request
     */
    constructor(groupOptions: GroupOptions | string | null, loc?: (DependencyLocation | null) | undefined, request?: (string | null) | undefined);
    /** @type {GroupOptions} */
    groupOptions: GroupOptions;
    /** @type {DependencyLocation | null | undefined} */
    loc: DependencyLocation | null | undefined;
    /** @type {string | null | undefined} */
    request: string | null | undefined;
    /** @type {undefined | string} */
    _stringifiedGroupOptions: undefined | string;
    /**
     * @param {string | undefined} value The new chunk name
     * @returns {void}
     */
    set chunkName(value: string | undefined);
    /**
     * @returns {ChunkGroupOptions["name"]} The name of the chunk
     */
    get chunkName(): ChunkGroupOptions["name"];
    /**
     * @returns {boolean} Whether circular references are allowed
     */
    get circular(): boolean;
    set module(value: void);
    get module(): void;
}
declare namespace AsyncDependenciesBlock {
    export { GroupOptions };
}
import DependenciesBlock = require("./DependenciesBlock");
import type { DependencyLocation } from "./Dependency";
import type { ChunkGroupOptions } from "./ChunkGroup";
type GroupOptions = (ChunkGroupOptions & {
    entryOptions?: EntryOptions;
} & {
    circular?: boolean;
});
import type { EntryOptions } from "./Entrypoint";
