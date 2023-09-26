export = RequireEnsureDependenciesBlockParserPlugin;
declare class RequireEnsureDependenciesBlockParserPlugin {
  apply(parser: any): void;
}
declare namespace RequireEnsureDependenciesBlockParserPlugin {
  export { ChunkGroupOptions, JavascriptParser };
}
type ChunkGroupOptions = import('../ChunkGroup').ChunkGroupOptions;
type JavascriptParser = import('../javascript/JavascriptParser');
