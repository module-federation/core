export = ArrayPushCallbackChunkFormatPlugin;
/** @typedef {import("../Compiler")} Compiler */
declare class ArrayPushCallbackChunkFormatPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ArrayPushCallbackChunkFormatPlugin {
  export { Compiler };
}
type Compiler = import('../Compiler');
