export = ImportMetaContextDependencyParserPlugin;
declare class ImportMetaContextDependencyParserPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace ImportMetaContextDependencyParserPlugin {
    export { ImportMetaContextOptions };
}
import type JavascriptParser from "../../javascript/JavascriptParser";
type ImportMetaContextOptions = Pick<ContextModuleOptions, "mode" | "recursive" | "regExp" | "include" | "exclude" | "chunkName"> & {
    groupOptions: RawChunkGroupOptions;
    exports?: RawReferencedExports;
};
import type { ContextModuleOptions } from "../../context/ContextModule";
import type { RawChunkGroupOptions } from "../../graph/ChunkGroup";
import type { RawReferencedExports } from "../../graph/Dependency";
