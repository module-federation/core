import path from 'node:path';
import enhancedResolve from 'enhanced-resolve';
import type { RuntimeFamily } from './family';
import { importRequest, plannedImports, type CompositionPlan } from './plan';

const resolveSync = enhancedResolve.create.sync({
  conditionNames: ['import', 'module', 'default'],
  exportsFields: ['exports'],
});

/** Maps each bootstrap request to an absolute posix path, in rendered order. */
export type CompositionImports = Record<string, string>;

export function resolveImports(
  plan: CompositionPlan,
  family: RuntimeFamily,
): CompositionImports {
  const imports: CompositionImports = {};
  for (const planned of plannedImports(plan)) {
    const member = family.members[planned.pkg];
    if (!member) throw new Error(`${planned.pkg} is not in the runtime family`);
    const request = importRequest(planned);
    // A self-reference from the member's real directory resolves through its
    // own exports map, whatever the bundler's resolver is configured to do.
    const resolved = resolveSync(member.root, request);
    if (typeof resolved !== 'string') {
      throw new Error(
        `${request} did not resolve to a file from ${member.root}`,
      );
    }
    imports[request] = resolved.split(path.sep).join('/');
  }
  return imports;
}
