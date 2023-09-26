export = Entrypoint;
/** @typedef {import("../declarations/WebpackOptions").EntryDescriptionNormalized} EntryDescription */
/** @typedef {import("./Chunk")} Chunk */
/** @typedef {{ name?: string } & Omit<EntryDescription, "import">} EntryOptions */
/**
 * Entrypoint serves as an encapsulation primitive for chunks that are
 * a part of a single ChunkGroup. They represent all bundles that need to be loaded for a
 * single instance of a page. Multi-page application architectures will typically yield multiple Entrypoint objects
 * inside of the compilation, whereas a Single Page App may only contain one with many lazy-loaded chunks.
 */
declare class Entrypoint extends ChunkGroup {
  /**
   * Creates an instance of Entrypoint.
   * @param {EntryOptions | string} entryOptions the options for the entrypoint (or name)
   * @param {boolean=} initial false, when the entrypoint is not initial loaded
   */
  constructor(
    entryOptions: EntryOptions | string,
    initial?: boolean | undefined,
  );
  options: EntryOptions;
  /** @type {Chunk=} */
  _runtimeChunk: Chunk | undefined;
  /** @type {Chunk=} */
  _entrypointChunk: Chunk | undefined;
  /** @type {boolean} */
  _initial: boolean;
  /**
   * Sets the runtimeChunk for an entrypoint.
   * @param {Chunk} chunk the chunk being set as the runtime chunk.
   * @returns {void}
   */
  setRuntimeChunk(chunk: Chunk): void;
  /**
   * Fetches the chunk reference containing the webpack bootstrap code
   * @returns {Chunk | null} returns the runtime chunk or null if there is none
   */
  getRuntimeChunk(): Chunk | null;
  /**
   * Sets the chunk with the entrypoint modules for an entrypoint.
   * @param {Chunk} chunk the chunk being set as the entrypoint chunk.
   * @returns {void}
   */
  setEntrypointChunk(chunk: Chunk): void;
  /**
   * Returns the chunk which contains the entrypoint modules
   * (or at least the execution of them)
   * @returns {Chunk} chunk
   */
  getEntrypointChunk(): Chunk;
}
declare namespace Entrypoint {
  export { EntryDescription, Chunk, EntryOptions };
}
import ChunkGroup = require('./ChunkGroup');
type EntryOptions = {
  name?: string;
} & Omit<EntryDescription, 'import'>;
type Chunk = import('./Chunk');
type EntryDescription =
  import('../declarations/WebpackOptions').EntryDescriptionNormalized;
