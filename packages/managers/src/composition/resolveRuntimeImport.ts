import fs from 'node:fs';
import path from 'node:path';
import enhancedResolve from 'enhanced-resolve';
import type { FamilyPackage, RuntimeFamily } from './family';

const resolveSelfReference = enhancedResolve.create.sync({
  conditionNames: ['import', 'module', 'default'],
  exportsFields: ['exports'],
  fileSystem: fs,
});

type ImportResolution =
  | { type: 'resolved'; path: string }
  | { type: 'unavailable'; reason: string };

// A family is one build's package snapshot. Reuse its selected paths while
// rendering, without retaining them when another build resolves a new family.
const familyImports = new WeakMap<
  RuntimeFamily,
  Map<string, ImportResolution>
>();

export function resolveRuntimeImport(
  family: RuntimeFamily,
  pkg: FamilyPackage,
  subpath: string,
): ImportResolution {
  const request = `${pkg}/${subpath.slice(2)}`;
  let imports = familyImports.get(family);
  if (!imports) {
    imports = new Map();
    familyImports.set(family, imports);
  }
  const cached = imports.get(request);
  if (cached) return cached;

  const member = family.members[pkg];
  if (!member) {
    return {
      type: 'unavailable',
      reason: `${pkg} is not in the runtime family`,
    };
  }
  const unavailable = (detail: string): ImportResolution => ({
    type: 'unavailable',
    reason: `${request} cannot be imported for composition from ${member.root}: ${detail}`,
  });
  const target = (member.exports as Record<string, unknown> | null)?.[subpath];
  let result: ImportResolution;
  if (target === false || target === null) {
    result = unavailable('the export is disabled');
  } else {
    try {
      const resolved = resolveSelfReference(member.root, request);
      result =
        typeof resolved === 'string'
          ? { type: 'resolved', path: resolved.split(path.sep).join('/') }
          : unavailable('the export did not resolve to a file');
    } catch (error) {
      // enhanced-resolve 5 has no error code for these two compatibility cases.
      // Do not turn invalid package metadata or other resolver failures into a
      // successful legacy build.
      if (
        !(error instanceof Error) ||
        !(
          error.message.startsWith(`"${subpath}" is not exported under `) ||
          error.message.startsWith(
            `Package path ${subpath} is not exported from package `,
          ) ||
          (error.message === `Can't resolve '${request}' in '${member.root}'` &&
            typeof (error as Error & { details?: unknown }).details ===
              'string')
        )
      ) {
        throw error;
      }
      result = unavailable(error.message);
    }
  }
  imports.set(request, result);
  return result;
}
