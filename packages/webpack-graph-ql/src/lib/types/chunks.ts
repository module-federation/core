import { Module, Origin } from "./index";

export type ChunkData = {
  entry: boolean;
  files: string[];
  filteredModules: number;
  id: number;
  initial: boolean;
  modules: string[];
  names: string[];
  origins: 
  [];
  parents: number[];
  rendered: boolean;
  size: number;
};

/**
 * The `Chunk` class represents a chunk in a webpack build. It has the
 * following properties:
 * 
 * - `id`: a string representing the ID of the chunk
 * - `names`: an array of strings representing the names of the chunk
 * - `modules`: an array of `Module` objects representing the modules included
 *   in the chunk
 * - `origins`: an array of `Origin` objects representing the origins of the
 *   chunk
 */
export class Chunk extends AutoSchema {

  @returns(String)
  id: string;

  @returns([String])
  names: string[];

  @returns([Module])
  modules: Module[];

  @returns([Origin])
  origins: Origin[];

  constructor(chunkData: ChunkData) {
    Object.assign(this, chunkData);
  }

};
