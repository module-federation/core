export = RemoteRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("./RemoteModule")} RemoteModule */
declare class RemoteRuntimeModule extends RuntimeModule {
  constructor();
}
declare namespace RemoteRuntimeModule {
  export { Chunk, RemoteModule };
}
import RuntimeModule = require('../RuntimeModule');
type Chunk = import('../Chunk');
type RemoteModule = import('./RemoteModule');
