import fs from 'node:fs';
import path from 'node:path';
import enhancedResolve from 'enhanced-resolve';
import { findPackageJson } from '../findPackageJson';

export const RUNTIME_FAMILY = {
  '@module-federation/runtime-tools': [],
  '@module-federation/webpack-bundler-runtime': [
    './compose',
    './adapters/remotes',
    './adapters/consumes',
    './adapters/share-scope',
    './adapters/container',
  ],
  '@module-federation/runtime': ['./compose'],
  '@module-federation/runtime-core': [
    './kernel',
    './shared',
    './remote',
    './snapshot',
    './platform/web',
    './platform/node',
    './platform/universal',
  ],
  '@module-federation/sdk': ['./core', './node'],
} as const satisfies Record<string, readonly string[]>;

const resolveAnyEntry = enhancedResolve.create.sync({
  conditionNames: ['node', 'require', 'import', 'default'],
  exportsFields: ['exports'],
  mainFields: ['main', 'module'],
});

export type FamilyPackage = keyof typeof RUNTIME_FAMILY;
export const FAMILY_PACKAGES = Object.keys(RUNTIME_FAMILY) as FamilyPackage[];

export interface FamilyMember {
  name: unknown;
  root: string;
  exports: unknown;
}

export interface RuntimeFamily {
  anchor: string;
  members: Partial<Record<FamilyPackage, FamilyMember>>;
}

export function resolveRuntimeFamily(anchor: string): RuntimeFamily {
  const members: RuntimeFamily['members'] = {};
  let from = anchor;
  for (const pkg of FAMILY_PACKAGES) {
    const member = readMember(pkg, from);
    if (!member) break;
    members[pkg] = member;
    from = member.root;
  }
  return { anchor, members };
}

function readMember(
  request: FamilyPackage,
  from: string,
): FamilyMember | undefined {
  let entry: string | false;
  try {
    entry = resolveAnyEntry(from, request);
  } catch {
    return undefined;
  }
  if (!entry) return undefined;
  // Older packages do not export ./package.json, so walk up from the entry.
  return findNamedPackage(path.dirname(entry));
}

function findNamedPackage(dir: string): FamilyMember | undefined {
  let file = findPackageJson(dir);
  while (file) {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const root = path.dirname(file);
    if (data.name !== undefined) {
      return { name: data.name, root, exports: data.exports };
    }
    const parent = path.dirname(root);
    file = parent === root ? undefined : findPackageJson(parent);
  }
  return undefined;
}
