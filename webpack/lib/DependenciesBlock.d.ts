export = DependenciesBlock;
/** @typedef {import("./AsyncDependenciesBlock")} AsyncDependenciesBlock */
/** @typedef {import("./ChunkGraph")} ChunkGraph */
/** @typedef {import("./ChunkGroup")} ChunkGroup */
/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("./Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./util/Hash")} Hash */
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
  getRootBlock(): DependenciesBlock;
  /**
   * Adds a DependencyBlock to DependencyBlock relationship.
   * This is used for when a Module has a AsyncDependencyBlock tie (for code-splitting)
   *
   * @param {AsyncDependenciesBlock} block block being added
   * @returns {void}
   */
  addBlock(block: AsyncDependenciesBlock): void;
  /**
   * @param {Dependency} dependency dependency being tied to block.
   * This is an "edge" pointing to another "node" on module graph.
   * @returns {void}
   */
  addDependency(dependency: Dependency): void;
  /**
   * @param {Dependency} dependency dependency being removed
   * @returns {void}
   */
  removeDependency(dependency: Dependency): void;
  /**
   * Removes all dependencies and blocks
   * @returns {void}
   */
  clearDependenciesAndBlocks(): void;
  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context: UpdateHashContext): void;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize({ write }: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   */
  deserialize({ read }: ObjectDeserializerContext): void;
}
declare namespace DependenciesBlock {
  export {
    AsyncDependenciesBlock,
    ChunkGraph,
    ChunkGroup,
    Dependency,
    UpdateHashContext,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    DependencyFilterFunction,
  };
}
type Dependency = import('./Dependency');
type AsyncDependenciesBlock = import('./AsyncDependenciesBlock');
type Hash = import('./util/Hash');
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ChunkGraph = import('./ChunkGraph');
type ChunkGroup = import('./ChunkGroup');
type DependencyFilterFunction = (d: Dependency) => boolean;
