export class AsyncDependenciesBlock extends DependenciesBlock {
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
    name?: string | undefined;
  } & {
    entryOptions?: import('./Entrypoint').EntryOptions | undefined;
  };
  loc: import('./Dependency').DependencyLocation | null | undefined;
  request: string | null | undefined;
  _stringifiedGroupOptions: string | undefined;
  /**
   * @param {string | undefined} value The new chunk name
   * @returns {void}
   */
  set chunkName(arg: string | undefined);
  /**
   * @returns {string | undefined} The name of the chunk
   */
  get chunkName(): string | undefined;
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
type ChunkGroupOptions = import('./ChunkGroup').ChunkGroupOptions;
type EntryOptions = import('./Entrypoint').EntryOptions;
type DependencyLocation = import('./Dependency').DependencyLocation;
type ChunkGraph = import('./ChunkGraph');
type ChunkGroup = import('./ChunkGroup');
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type Hash = import('./util/Hash');
