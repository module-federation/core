import type { RuntimeFamily } from './family';
import { importRequest, plannedImports, type CompositionPlan } from './plan';
import { resolveRuntimeImport } from './resolveRuntimeImport';

/** Maps each bootstrap request to an absolute posix path, in rendered order. */
export type CompositionImports = Record<string, string>;

export function resolveImports(
  plan: CompositionPlan,
  family: RuntimeFamily,
): CompositionImports {
  const imports: CompositionImports = {};
  for (const planned of plannedImports(plan)) {
    const request = importRequest(planned);
    const resolved = resolveRuntimeImport(family, planned.pkg, planned.subpath);
    if (resolved.type === 'unavailable') throw new Error(resolved.reason);
    imports[request] = resolved.path;
  }
  return imports;
}
