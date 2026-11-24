import type { Chunk, ChunkGraph, CodeGenerationResults } from 'webpack';

const scopesByChunk = new WeakMap<Chunk, string[] | undefined>();

// Read the same generated data as the sharing runtime modules, not the input config.
export function getDeclaredShareScopes(
  chunk: Chunk,
  chunkGraph: ChunkGraph,
  results: CodeGenerationResults,
): string[] | undefined {
  if (scopesByChunk.has(chunk)) return scopesByChunk.get(chunk);

  const providerScopes = new Set<string>();
  let layered = false;
  for (const referenced of chunk.getAllReferencedChunks()) {
    for (const module of chunkGraph.getChunkModulesIterableBySourceType(
      referenced,
      'share-init',
    ) || []) {
      const provider = results.getData(
        module,
        referenced.runtime,
        'share-init-option',
      );
      if (!provider) continue;
      layered = layered || typeof provider.shareConfig?.layer === 'string';
      for (const scope of [provider.shareScope].flat(2))
        providerScopes.add(scope);
    }
    for (const module of chunkGraph.getChunkModulesIterableBySourceType(
      referenced,
      'consume-shared',
    ) || []) {
      if (chunkGraph.getModuleId(module) == null) continue;
      const consume = results.getData(
        module,
        referenced.runtime,
        'consume-shared',
      );
      layered = layered || typeof consume?.shareConfig?.layer === 'string';
    }
  }
  const scopes = layered ? [...providerScopes].sort() : undefined;
  scopesByChunk.set(chunk, scopes);
  return scopes;
}
