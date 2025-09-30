import type { Compilation, Chunk, ChunkGroup, Module, ModuleGraph, Compiler } from 'webpack';
import type { ModuleGraphConnection } from 'webpack';
import type { Span } from '../../trace';
export declare function traverseModules(compilation: Compilation, callback: (mod: any, chunk: Chunk, chunkGroup: (typeof compilation.chunkGroups)[0], modId: string | null) => any, filterChunkGroup?: (chunkGroup: ChunkGroup) => boolean): void;
export declare function forEachEntryModule(compilation: any, callback: ({ name, entryModule }: {
    name: string;
    entryModule: any;
}) => void): void;
export declare function formatBarrelOptimizedResource(resource: string, matchResource: string): string;
export declare function getModuleReferencesInOrder(module: Module, moduleGraph: ModuleGraph): ModuleGraphConnection[];
export declare function getCompilationSpan(compilation: Compiler | Compilation): Span | undefined;
