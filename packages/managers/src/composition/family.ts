import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { findPackageJson } from '../findPackageJson';

// Walk order: each package is resolved from the real directory of the one before it.
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

export type FamilyPackage = keyof typeof RUNTIME_FAMILY;
export const FAMILY_PACKAGES = Object.keys(RUNTIME_FAMILY) as FamilyPackage[];

export interface FamilyMember {
  name: unknown;
  root: string;
  exports: unknown;
  resolvedFrom: string;
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
  let entry: string;
  try {
    entry = createRequire(path.join(from, 'index.js')).resolve(request);
  } catch {
    return undefined;
  }
  // Older packages do not export ./package.json, so walk up from the entry.
  // A nameless package.json (dist/package.json with only "type") is skipped.
  let file = findPackageJson(path.dirname(entry));
  while (file) {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const root = path.dirname(file);
    if (data.name !== undefined) {
      return {
        name: data.name,
        root,
        exports: data.exports,
        resolvedFrom: from,
      };
    }
    const parent = path.dirname(root);
    file = parent === root ? undefined : findPackageJson(parent);
  }
  return undefined;
}
