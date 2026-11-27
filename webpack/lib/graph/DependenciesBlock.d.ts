export = DependenciesBlock;
/** @import AsyncDependenciesBlock from "./AsyncDependenciesBlock" */
/** @import Dependency, { UpdateHashContext } from "./Dependency" */
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../serialization/ObjectMiddleware"
 */
/** @import Hash from "../util/Hash" */
/** @typedef {(d: Dependency) => boolean} DependencyFilterFunction */
/**
 * DependenciesBlock is the base class for all Module classes in webpack. It describes a
 * "block" of dependencies which are pointers to other DependenciesBlock instances. For example
 * when a Module has a CommonJs require statement, the DependencyBlock for the CommonJs module
 * would be added as a dependency to the Module. DependenciesBlock is inherited by two types of classes:
 * Module subclasses and AsyncDependenciesBlock subclasses. The only difference between the two is that
 * AsyncDependenciesBlock subclasses are used for code-splitting (async boundary) and Module subclasses are not.
 */
declare class DependenciesBlock {
    /** @type {Dependency[]} */
    dependencies: Dependency[];
    /** @type {AsyncDependenciesBlock[]} */
    blocks: AsyncDependenciesBlock[];
    /** @type {DependenciesBlock | undefined} */
    parent: DependenciesBlock | undefined;
    /**
     * Returns whether this block is an async block, loaded on demand in its own chunk group.
     * @returns {this is AsyncDependenciesBlock} true for an AsyncDependenciesBlock
     */
    isAsyncBlock(): this is AsyncDependenciesBlock;
    getRootBlock(): DependenciesBlock;
    /**
     * Adds a DependencyBlock to DependencyBlock relationship.
     * This is used for when a Module has a AsyncDependencyBlock tie (for code-splitting)
     * @param {AsyncDependenciesBlock} block block being added
     * @returns {void}
     */
    addBlock(block: AsyncDependenciesBlock): void;
    /**
     * Adds the provided dependency to the dependencies block.
     * @param {Dependency} dependency dependency being tied to block.
     * This is an "edge" pointing to another "node" on module graph.
     * @returns {void}
     */
    addDependency(dependency: Dependency): void;
    /**
     * Removes dependency.
     * @param {Dependency} dependency dependency being removed
     * @returns {void}
     */
    removeDependency(dependency: Dependency): void;
    /**
     * Clear dependencies and blocks.
     * @returns {void}
     */
    clearDependenciesAndBlocks(): void;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: Dependency.UpdateHashContext): void;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize({ write }: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize({ read }: ObjectDeserializerContext): void;
}
declare namespace DependenciesBlock {
    export { DependencyFilterFunction };
}
import type Dependency from "./Dependency";
import type AsyncDependenciesBlock from "./AsyncDependenciesBlock";
import type Hash from "../util/Hash";
import type { ObjectSerializerContext } from "../serialization/ObjectMiddleware";
import type { ObjectDeserializerContext } from "../serialization/ObjectMiddleware";
type DependencyFilterFunction = (d: Dependency) => boolean;
