export default RemoteRuntimeModule;
/** @typedef {import("webpack/lib/Chunk")} Chunk */
/** @typedef {import("./RemoteModule")} RemoteModule */
declare class RemoteRuntimeModule extends RuntimeModule {
  constructor();
}
declare namespace RemoteRuntimeModule {
  export { Chunk, RemoteModule };
}
import RuntimeModule = require('webpack/lib/RuntimeModule');
type Chunk = import('webpack/lib/Chunk');
type RemoteModule = import('./RemoteModule');
