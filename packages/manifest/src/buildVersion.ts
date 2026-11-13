import type { Compilation } from 'webpack';

let revision = 0;

/** Watch builds need a change marker independent of their release version. */
export function getCompilationDevRevision(
  compilation: Compilation,
): string | undefined {
  if (compilation.options.mode !== 'development') return undefined;
  revision = Math.max(Date.now(), revision + 1);
  return String(revision);
}
