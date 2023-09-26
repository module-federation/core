export = ChunkTemplate;
declare class ChunkTemplate {
  /**
   * @param {OutputOptions} outputOptions output options
   * @param {Compilation} compilation the compilation
   */
  constructor(outputOptions: OutputOptions, compilation: Compilation);
  _outputOptions: import('../declarations/WebpackOptions').Output;
  hooks: Readonly<{
    renderManifest: {
      tap: (options: any, fn: any) => void;
    };
    modules: {
      tap: (options: any, fn: any) => void;
    };
    render: {
      tap: (options: any, fn: any) => void;
    };
    renderWithEntry: {
      tap: (options: any, fn: any) => void;
    };
    hash: {
      tap: (options: any, fn: any) => void;
    };
    hashForChunk: {
      tap: (options: any, fn: any) => void;
    };
  }>;
  get outputOptions(): import('../declarations/WebpackOptions').Output;
}
declare namespace ChunkTemplate {
  export { OutputOptions, Compilation };
}
type OutputOptions = import('../declarations/WebpackOptions').Output;
type Compilation = import('./Compilation');
