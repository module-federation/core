export = ModuleTemplate;
declare class ModuleTemplate {
  /**
   * @param {RuntimeTemplate} runtimeTemplate the runtime template
   * @param {Compilation} compilation the compilation
   */
  constructor(runtimeTemplate: RuntimeTemplate, compilation: Compilation);
  _runtimeTemplate: import('./RuntimeTemplate');
  type: string;
  hooks: Readonly<{
    content: {
      tap: (options: any, fn: any) => void;
    };
    module: {
      tap: (options: any, fn: any) => void;
    };
    render: {
      tap: (options: any, fn: any) => void;
    };
    package: {
      tap: (options: any, fn: any) => void;
    };
    hash: {
      tap: (options: any, fn: any) => void;
    };
  }>;
  get runtimeTemplate(): TODO;
}
declare namespace ModuleTemplate {
  export {
    Source,
    Chunk,
    ChunkGraph,
    Compilation,
    DependencyTemplates,
    Module,
    ModuleGraph,
    RuntimeTemplate,
    Hash,
  };
}
type RuntimeTemplate = import('./RuntimeTemplate');
type Compilation = import('./Compilation');
type Source = any;
type Chunk = import('./Chunk');
type ChunkGraph = import('./ChunkGraph');
type DependencyTemplates = import('./DependencyTemplates');
type Module = import('./Module');
type ModuleGraph = import('./ModuleGraph');
type Hash = import('./util/Hash');
