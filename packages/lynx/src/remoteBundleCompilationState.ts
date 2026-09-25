import type { Compilation } from '@rspack/core';

export interface RemoteBundleCompilationState {
  discardedTemplateAssets: Set<string>;
  lazyBundleAssets: Set<string>;
  lazyBundleAssetByExpose: Map<string, string>;
  pairedBundleChunks: Set<string>;
  sourceAssets: Array<{ content: string; name: string }>;
}

export interface RemoteBundleCompilationStateStore {
  for(compilation: Compilation): RemoteBundleCompilationState;
}

export const createRemoteBundleCompilationStateStore =
  (): RemoteBundleCompilationStateStore => {
    const states = new WeakMap<Compilation, RemoteBundleCompilationState>();

    return {
      for(compilation) {
        let state = states.get(compilation);
        if (!state) {
          state = {
            discardedTemplateAssets: new Set(),
            lazyBundleAssets: new Set(),
            lazyBundleAssetByExpose: new Map(),
            pairedBundleChunks: new Set(),
            sourceAssets: [],
          };
          states.set(compilation, state);
        }
        return state;
      },
    };
  };
