import { setCompilationBuildVersion } from '@module-federation/enhanced/rspack';
import type { Rspack } from '@rsbuild/core';

/** Give the Browser and Node outputs of one development build the same identity. */
export function createSharedBuildVersionPlugin(): Rspack.RspackPluginInstance {
  const states: { compiler: Rspack.Compiler; version?: string }[] = [];
  let sequence = Date.now();
  let buildVersion = String(sequence);
  let invalidating = false;
  return {
    apply(compiler) {
      if (compiler.options.mode !== 'development') return;
      const state = { compiler, version: undefined as string | undefined };
      states.push(state);
      compiler.hooks.thisCompilation.tap(
        { name: 'FederationSharedBuildVersion', stage: -Infinity },
        (compilation) => {
          setCompilationBuildVersion(compilation, buildVersion);
          state.version = buildVersion;
        },
      );
      compiler.hooks.invalid.tap(
        { name: 'FederationSharedBuildVersion', stage: -Infinity },
        () => {
          if (invalidating) return;
          // Invalidations before either compiler starts belong to one build.
          // An edit during compilation supersedes that whole build instead.
          if (states.some((item) => item.version === buildVersion))
            buildVersion = String(
              (sequence = Math.max(Date.now(), sequence + 1)),
            );
          invalidating = true;
          try {
            for (const peer of states)
              if (peer !== state) peer.compiler.watching?.invalidate();
          } finally {
            invalidating = false;
          }
        },
      );
    },
  };
}
