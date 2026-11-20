import { setCompilationBuildVersion } from './buildVersion';

// Structural hooks keep this build-time API usable by both webpack and Rspack.
type BuildVersionCompiler = {
  options: { mode?: string };
  hooks: {
    thisCompilation: {
      tap(
        options: { name: string; stage: number },
        callback: (compilation: object) => void,
      ): void;
    };
    invalid: {
      tap(options: { name: string; stage: number }, callback: () => void): void;
    };
  };
  watching?: { invalidate(): void };
};

/** One coordinator per application, shared by its development compilers. */
export function createBuildVersionCoordinator(
  options: { onInvalidate?: () => void } = {},
) {
  type State = { compiler: BuildVersionCompiler; compilation?: object };
  const states = new Map<BuildVersionCompiler, State>();
  const compilations = new WeakMap<object, { state: State; version: string }>();
  let sequence = Date.now();
  let buildVersion = String(sequence);
  let invalidating = false;

  return {
    apply(compiler: BuildVersionCompiler): void {
      if (compiler.options.mode !== 'development' || states.has(compiler))
        return;
      const state: State = { compiler };
      states.set(compiler, state);
      compiler.hooks.thisCompilation.tap(
        { name: 'FederationBuildVersionCoordinator', stage: -Infinity },
        (compilation) => {
          setCompilationBuildVersion(compilation, buildVersion);
          state.compilation = compilation;
          compilations.set(compilation, { state, version: buildVersion });
        },
      );
      compiler.hooks.invalid.tap(
        { name: 'FederationBuildVersionCoordinator', stage: -Infinity },
        () => {
          if (invalidating) return;
          // Invalidations before either target starts belong to one round.
          // A save after compilation starts supersedes that whole round.
          if (
            [...states.values()].some(
              (item) =>
                item.compilation &&
                compilations.get(item.compilation)?.version === buildVersion,
            )
          )
            buildVersion = String(
              (sequence = Math.max(Date.now(), sequence + 1)),
            );
          invalidating = true;
          try {
            options.onInvalidate?.();
            for (const peer of states.values())
              if (peer !== state) peer.compiler.watching?.invalidate();
          } finally {
            invalidating = false;
          }
        },
      );
    },
    /** True only for the latest complete set of this application's compilations. */
    isCurrent(stats: unknown): boolean {
      const children = (stats as { stats?: unknown })?.stats ?? [stats];
      if (
        !states.size ||
        !Array.isArray(children) ||
        children.length !== states.size
      )
        return false;
      const seen = new Set<State>();
      return children.every((child: { compilation?: object } | undefined) => {
        const compilation = child?.compilation;
        const captured = compilation && compilations.get(compilation);
        if (
          !captured ||
          captured.version !== buildVersion ||
          captured.state.compilation !== compilation ||
          seen.has(captured.state)
        )
          return false;
        seen.add(captured.state);
        return true;
      });
    },
  };
}
