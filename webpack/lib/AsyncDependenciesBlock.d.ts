export = AsyncDependenciesBlock;
/** @typedef {import("./ChunkGraph")} ChunkGraph */
/** @typedef {import("./ChunkGroup")} ChunkGroup */
/** @typedef {import("./ChunkGroup").ChunkGroupOptions} ChunkGroupOptions */
/** @typedef {import("./Dependency").DependencyLocation} DependencyLocation */
/** @typedef {import("./Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("./Entrypoint").EntryOptions} EntryOptions */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./util/Hash")} Hash */
declare class AsyncDependenciesBlock extends DependenciesBlock {
  /**
   * @param {(ChunkGroupOptions & { entryOptions?: EntryOptions }) | null} groupOptions options for the group
   * @param {(DependencyLocation | null)=} loc the line of code
   * @param {(string | null)=} request the request
   */
  constructor(
    groupOptions:
      | (ChunkGroupOptions & {
          entryOptions?: EntryOptions;
        })
      | null,
    loc?: (DependencyLocation | null) | undefined,
    request?: (string | null) | undefined,
  );
  groupOptions: import('./ChunkGroup').RawChunkGroupOptions & {
    name?: string;
  } & {
    entryOptions?: EntryOptions;
  };
  loc: import('./Dependency').DependencyLocation;
  request: string;
  _stringifiedGroupOptions: string;
  /**
   * @param {string | undefined} value The new chunk name
   * @returns {void}
   */
  set chunkName(arg: string);
  /**
   * @returns {string | undefined} The name of the chunk
   */
  get chunkName(): string;
  set module(arg: any);
  get module(): any;
}
declare namespace AsyncDependenciesBlock {
  export {
    ChunkGraph,
    ChunkGroup,
    ChunkGroupOptions,
    DependencyLocation,
    UpdateHashContext,
    EntryOptions,
    Module,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
  };
}
import DependenciesBlock = require('./DependenciesBlock');
type EntryOptions = import('./Entrypoint').EntryOptions;
type ChunkGroupOptions = import('./ChunkGroup').ChunkGroupOptions;
type DependencyLocation = import('./Dependency').DependencyLocation;
type ChunkGraph = import('./ChunkGraph');
type ChunkGroup = import('./ChunkGroup');
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type Module = import('./Module');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('./util/Hash');
