export = ImportMetaContextDependencyParserPlugin;
declare class ImportMetaContextDependencyParserPlugin {
    /**
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace ImportMetaContextDependencyParserPlugin {
    export { Expression, ObjectExpression, Property, Identifier, JavascriptParser, Range, ContextModuleOptions, ContextMode, ChunkName, RawChunkGroupOptions, RawReferencedExports, DependencyLocation, BasicEvaluatedExpression, ImportMetaContextOptions };
}
type Expression = import("estree").Expression;
type ObjectExpression = import("estree").ObjectExpression;
type Property = import("estree").Property;
type Identifier = import("estree").Identifier;
type JavascriptParser = import("../javascript/JavascriptParser");
type Range = import("../javascript/JavascriptParser").Range;
type ContextModuleOptions = import("../ContextModule").ContextModuleOptions;
type ContextMode = import("../ContextModule").ContextMode;
type ChunkName = import("../Chunk").ChunkName;
type RawChunkGroupOptions = import("../ChunkGroup").RawChunkGroupOptions;
type RawReferencedExports = import("../Dependency").RawReferencedExports;
type DependencyLocation = import("../Dependency").DependencyLocation;
type BasicEvaluatedExpression = import("../javascript/BasicEvaluatedExpression");
type ImportMetaContextOptions = Pick<ContextModuleOptions, "mode" | "recursive" | "regExp" | "include" | "exclude" | "chunkName"> & {
    groupOptions: RawChunkGroupOptions;
    exports?: RawReferencedExports;
};
