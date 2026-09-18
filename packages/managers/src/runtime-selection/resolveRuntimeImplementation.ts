import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { findPackageJson } from '../findPackageJson';
import {
  LEGACY_ALLOWED_REQUESTS,
  LEGACY_DEPENDENCIES,
  LEGACY_PACKAGE_NAMES,
} from './legacyFamily';
import {
  MEMBER_ROLES,
  RUNTIME_SELECTION_CONTRACT_VERSION,
  type AllowedRequest,
  type ContractMode,
  type ExternalMode,
  type FamilyMember,
  type FamilyMemberTopology,
  type MemberRole,
  type ResolvedRuntimeImplementation,
  type SelectorLeaf,
  type SelectorManifestEntry,
  RuntimeSelectionError,
} from './types';

interface RawMember {
  role?: unknown;
  package?: unknown;
  dependsOn?: unknown;
}

interface RawAllowedRequest {
  role?: unknown;
  export?: unknown;
}

interface RawSelector {
  ownerRole?: unknown;
  disabledCondition?: unknown;
  leaves?: Record<string, unknown>;
}

interface RawContract {
  contract?: unknown;
  compatibilityId?: unknown;
  mode?: unknown;
  role?: unknown;
  externalMode?: unknown;
  facade?: { import?: unknown; require?: unknown };
  entryLoadingIdentity?: unknown;
  members?: unknown;
  allowedRequests?: unknown;
  selectors?: unknown;
}

interface PackageRecord {
  name?: string;
  version?: string;
  main?: string;
  federationRuntime?: RawContract;
}

const SELECTOR_LEAVES: readonly SelectorLeaf[] = [
  'enabled',
  'disabled',
  'legacy',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && !Array.isArray(value) && typeof value === 'object';
}

function readPackage(packageJsonPath: string): PackageRecord {
  try {
    return JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf8'),
    ) as PackageRecord;
  } catch (error) {
    throw new RuntimeSelectionError(
      'invalid-package',
      `Could not read ${packageJsonPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function issuerFile(packageJsonPath: string, pkg: PackageRecord): string {
  const relative = typeof pkg.main === 'string' ? pkg.main : 'index.js';
  return path.resolve(path.dirname(packageJsonPath), relative);
}

function resolvePackageRoot(
  issuer: string,
  packageName: string,
): { entry: string; packageJsonPath: string } {
  let resolved: string;
  try {
    resolved = createRequire(issuer).resolve(packageName);
  } catch (error) {
    throw new RuntimeSelectionError(
      'missing-member',
      `Could not resolve ${packageName} from ${issuer}. ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  const packageJsonPath = findPackageJson(resolved);
  if (!packageJsonPath) {
    throw new RuntimeSelectionError(
      'missing-member',
      `Resolved ${packageName} has no package.json.`,
    );
  }
  return { entry: resolved, packageJsonPath };
}

function memberRole(value: unknown, label: string): MemberRole {
  if (
    typeof value === 'string' &&
    MEMBER_ROLES.some((role) => role === value)
  ) {
    return value as MemberRole;
  }
  throw new RuntimeSelectionError(
    'malformed-contract',
    `${label} is not a runtime family role.`,
  );
}

function readTopology(
  raw: unknown,
): readonly FamilyMemberTopology[] | undefined {
  if (raw === undefined) {
    return undefined;
  }
  if (!Array.isArray(raw)) {
    throw new RuntimeSelectionError(
      'malformed-contract',
      'federationRuntime.members must be an array.',
    );
  }
  return raw.map((item, index) => {
    const member = isRecord(item) ? (item as RawMember) : undefined;
    if (!member || typeof member.package !== 'string') {
      throw new RuntimeSelectionError(
        'malformed-contract',
        `federationRuntime.members[${index}] is malformed.`,
      );
    }
    const dependsOn = Array.isArray(member.dependsOn) ? member.dependsOn : [];
    return {
      role: memberRole(member.role, `members[${index}].role`),
      packageName: member.package,
      dependsOn: dependsOn.map((role, roleIndex) =>
        memberRole(role, `members[${index}].dependsOn[${roleIndex}]`),
      ),
    };
  });
}

function readAllowedRequests(
  raw: unknown,
): Readonly<Record<string, AllowedRequest>> | undefined {
  if (raw === undefined) {
    return undefined;
  }
  if (!isRecord(raw)) {
    throw new RuntimeSelectionError(
      'malformed-contract',
      'federationRuntime.allowedRequests must be an object.',
    );
  }
  const requests: Record<string, AllowedRequest> = {};
  for (const [request, value] of Object.entries(raw)) {
    const allowed = isRecord(value) ? (value as RawAllowedRequest) : undefined;
    if (!allowed || typeof allowed.export !== 'string') {
      throw new RuntimeSelectionError(
        'malformed-contract',
        `allowedRequests["${request}"] is malformed.`,
      );
    }
    requests[request] = {
      role: memberRole(allowed.role, `allowedRequests["${request}"].role`),
      exportName: allowed.export,
    };
  }
  return requests;
}

function readSelectors(
  raw: unknown,
): Readonly<Record<string, SelectorManifestEntry>> | undefined {
  if (raw === undefined) {
    return undefined;
  }
  if (!isRecord(raw)) {
    throw new RuntimeSelectionError(
      'malformed-contract',
      'federationRuntime.selectors must be an object.',
    );
  }
  const selectors: Record<string, SelectorManifestEntry> = {};
  for (const [id, value] of Object.entries(raw)) {
    const selector = isRecord(value) ? (value as RawSelector) : undefined;
    if (!selector || !isRecord(selector.leaves)) {
      throw new RuntimeSelectionError(
        'malformed-contract',
        `selectors["${id}"] is malformed.`,
      );
    }
    const leaves = {} as Record<SelectorLeaf, string>;
    for (const leaf of SELECTOR_LEAVES) {
      const target = selector.leaves[leaf];
      if (typeof target !== 'string') {
        throw new RuntimeSelectionError(
          'malformed-contract',
          `selectors["${id}"].leaves.${leaf} must be a relative file.`,
        );
      }
      leaves[leaf] = target;
    }
    selectors[id] = {
      ownerRole: memberRole(selector.ownerRole, `selectors["${id}"].ownerRole`),
      disabledCondition:
        typeof selector.disabledCondition === 'string'
          ? selector.disabledCondition
          : undefined,
      leaves,
    };
  }
  return selectors;
}

function modeOf(raw: RawContract | undefined): ContractMode {
  if (raw === undefined) {
    return 'legacy-defines';
  }
  if (raw.contract !== RUNTIME_SELECTION_CONTRACT_VERSION) {
    throw new RuntimeSelectionError(
      'malformed-contract',
      'federationRuntime.contract must be 1.',
    );
  }
  if (typeof raw.compatibilityId !== 'string' || !raw.compatibilityId) {
    throw new RuntimeSelectionError(
      'malformed-contract',
      'federationRuntime.compatibilityId is required.',
    );
  }
  if (raw.mode !== 'conditions' && raw.mode !== 'legacy-defines') {
    throw new RuntimeSelectionError(
      'malformed-contract',
      'federationRuntime.mode must be "conditions" or "legacy-defines".',
    );
  }
  return raw.mode;
}

function instanceId(
  members: Readonly<Record<MemberRole, FamilyMember>>,
): string {
  const material = MEMBER_ROLES.map(
    (role) => `${role}\0${members[role].canonicalRoot}`,
  ).join('\n');
  return createHash('sha256').update(material).digest('hex').slice(0, 16);
}

function resolveLeaf(member: FamilyMember, relative: string): string {
  const root = member.resolverVisibleRoots[0];
  const absolute = path.resolve(root, relative);
  const relativeToRoot = path.relative(root, absolute);
  if (
    relativeToRoot.startsWith(`..${path.sep}`) ||
    relativeToRoot === '..' ||
    path.isAbsolute(relativeToRoot)
  ) {
    throw new RuntimeSelectionError(
      'malformed-contract',
      `Runtime selector ${relative} escapes ${member.packageName}.`,
    );
  }
  if (!fs.existsSync(absolute)) {
    throw new RuntimeSelectionError(
      'missing-entry',
      `Runtime selector ${relative} does not exist in ${member.packageName}.`,
    );
  }
  return fs.realpathSync(absolute);
}

export function resolveRuntimeImplementation(
  anchor: string,
): ResolvedRuntimeImplementation {
  const packageJsonPath = findPackageJson(anchor);
  if (!packageJsonPath) {
    throw new RuntimeSelectionError(
      'missing-anchor',
      `No package.json found from runtime implementation ${anchor}.`,
    );
  }
  const pkg = readPackage(packageJsonPath);
  const raw = pkg.federationRuntime;
  const mode = modeOf(raw);
  if (
    mode === 'conditions' &&
    (raw?.members === undefined ||
      raw.allowedRequests === undefined ||
      raw.selectors === undefined ||
      typeof raw.entryLoadingIdentity !== 'string' ||
      !raw.facade ||
      (typeof raw.facade.require !== 'string' &&
        typeof raw.facade.import !== 'string'))
  ) {
    throw new RuntimeSelectionError(
      'malformed-contract',
      'A condition-aware family must declare members, allowedRequests, selectors, a facade, and entryLoadingIdentity.',
    );
  }
  const topology =
    readTopology(raw?.members) ??
    MEMBER_ROLES.map((role) => ({
      role,
      packageName: LEGACY_PACKAGE_NAMES[role],
      dependsOn: LEGACY_DEPENDENCIES[role],
    }));
  const byRole = new Map(topology.map((member) => [member.role, member]));
  if (
    topology.length !== MEMBER_ROLES.length ||
    byRole.size !== MEMBER_ROLES.length
  ) {
    throw new RuntimeSelectionError(
      'malformed-contract',
      'A runtime family must declare exactly one member per role.',
    );
  }

  const tools = byRole.get('runtime-tools');
  if (!tools) {
    throw new RuntimeSelectionError(
      'malformed-contract',
      'A runtime family is missing runtime-tools.',
    );
  }
  if (pkg.name && pkg.name !== tools.packageName && mode === 'conditions') {
    throw new RuntimeSelectionError(
      'malformed-contract',
      `Anchor package ${pkg.name} does not match declared runtime-tools package ${tools.packageName}.`,
    );
  }

  const members = {} as Record<MemberRole, FamilyMember>;
  const root = path.dirname(packageJsonPath);
  members['runtime-tools'] = {
    role: 'runtime-tools',
    packageName: tools.packageName,
    version: pkg.version ?? '0.0.0',
    canonicalRoot: fs.realpathSync(root),
    resolverVisibleRoots: [root],
    entry:
      fs.existsSync(anchor) && fs.statSync(anchor).isFile()
        ? path.resolve(anchor)
        : issuerFile(packageJsonPath, pkg),
    packageJsonPath,
  };

  const queue: MemberRole[] = ['runtime-tools'];
  const seen = new Set<MemberRole>(['runtime-tools']);
  while (queue.length > 0) {
    const role = queue.shift();
    if (!role) {
      break;
    }
    const source = members[role];
    const node = byRole.get(role);
    if (!node) {
      continue;
    }
    for (const dependency of node.dependsOn) {
      const declared = byRole.get(dependency);
      if (!declared) {
        throw new RuntimeSelectionError(
          'malformed-contract',
          `${role} depends on undeclared role ${dependency}.`,
        );
      }
      const resolvedDependency = resolvePackageRoot(
        source.entry,
        declared.packageName,
      );
      const { entry, packageJsonPath: dependencyPackageJson } =
        resolvedDependency;
      const dependencyPackage = readPackage(dependencyPackageJson);
      if (dependencyPackage.name !== declared.packageName) {
        throw new RuntimeSelectionError(
          'wrong-member',
          `Expected ${declared.packageName} but resolved ${dependencyPackage.name ?? 'an unnamed package'} from ${source.packageName}.`,
        );
      }
      const dependencyRoot = path.dirname(dependencyPackageJson);
      const next: FamilyMember = {
        role: dependency,
        packageName: declared.packageName,
        version: dependencyPackage.version ?? '0.0.0',
        canonicalRoot: fs.realpathSync(dependencyRoot),
        resolverVisibleRoots: [dependencyRoot],
        entry,
        packageJsonPath: dependencyPackageJson,
      };
      const previous = members[dependency];
      if (previous && previous.canonicalRoot !== next.canonicalRoot) {
        throw new RuntimeSelectionError(
          'split-family',
          `${declared.packageName} resolved to two roots: ${previous.canonicalRoot} and ${next.canonicalRoot}.`,
        );
      }
      if (mode === 'conditions') {
        const memberContract = dependencyPackage.federationRuntime;
        if (
          !memberContract ||
          memberContract.compatibilityId !== raw?.compatibilityId ||
          memberContract.contract !== RUNTIME_SELECTION_CONTRACT_VERSION ||
          memberContract.role !== dependency
        ) {
          throw new RuntimeSelectionError(
            'incompatible-member',
            `${declared.packageName} is not part of runtime family ${String(raw?.compatibilityId)}.`,
          );
        }
      }
      members[dependency] = previous ?? next;
      if (!seen.has(dependency)) {
        seen.add(dependency);
        queue.push(dependency);
      }
    }
  }

  for (const role of MEMBER_ROLES) {
    if (!members[role]) {
      throw new RuntimeSelectionError(
        'missing-member',
        `Runtime family is missing ${role}. No member is replaced from another installation.`,
      );
    }
  }

  const allowedRequests =
    readAllowedRequests(raw?.allowedRequests) ?? LEGACY_ALLOWED_REQUESTS;
  if (mode === 'conditions' && Object.keys(allowedRequests).length === 0) {
    throw new RuntimeSelectionError(
      'malformed-contract',
      'A condition-aware family must declare at least one allowed request.',
    );
  }
  const allowedEntries: Record<string, string> = {};
  for (const [alias, allowed] of Object.entries(allowedRequests)) {
    const member = members[allowed.role];
    const request =
      allowed.exportName === '.'
        ? member.packageName
        : `${member.packageName}/${allowed.exportName.replace(/^\.\//, '')}`;
    let resolved: string;
    try {
      resolved = createRequire(member.entry).resolve(request);
    } catch (error) {
      if (mode === 'legacy-defines' && allowed.exportName === './bundler') {
        resolved = member.entry;
      } else {
        throw new RuntimeSelectionError(
          'missing-entry',
          `Could not resolve ${request} from ${member.packageName}. ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    const resolvedPackageJson = findPackageJson(resolved);
    if (
      !resolvedPackageJson ||
      fs.realpathSync(path.dirname(resolvedPackageJson)) !==
        member.canonicalRoot
    ) {
      throw new RuntimeSelectionError(
        'wrong-entry',
        `${request} resolved outside the selected ${member.packageName} family member.`,
      );
    }
    allowedEntries[alias] = fs.realpathSync(resolved);
  }
  const selectors = { ...(readSelectors(raw?.selectors) ?? {}) };
  if (mode === 'conditions' && Object.keys(selectors).length === 0) {
    throw new RuntimeSelectionError(
      'malformed-contract',
      'A condition-aware family must declare at least one selector.',
    );
  }
  for (const selector of Object.values(selectors)) {
    const owner = members[selector.ownerRole];
    for (const leaf of SELECTOR_LEAVES) {
      selector.leaves[leaf] = resolveLeaf(owner, selector.leaves[leaf]);
    }
  }

  const core = members['runtime-core'];
  const compatibilityId =
    typeof raw?.compatibilityId === 'string'
      ? raw.compatibilityId
      : `legacy:${core.packageName}@${core.version}`;
  const externalMode: ExternalMode =
    raw?.externalMode === 'external-core' ? 'external-core' : 'bundled';
  const facadeRelative =
    typeof raw?.facade?.import === 'string'
      ? raw.facade.import
      : typeof raw?.facade?.require === 'string'
        ? raw.facade.require
        : undefined;
  const facadeEntry = facadeRelative
    ? resolveLeaf(members['runtime-tools'], facadeRelative)
    : members['bundler-runtime'].entry;

  return {
    anchor: members['runtime-tools'].canonicalRoot,
    mode,
    externalMode,
    family: {
      compatibilityId,
      instanceId: instanceId(members),
      members,
    },
    facadeEntry,
    entryLoadingIdentity:
      typeof raw?.entryLoadingIdentity === 'string'
        ? raw.entryLoadingIdentity
        : `legacy:${core.packageName}@${core.version}`,
    allowedRequests,
    allowedEntries,
    selectors,
  };
}

export function expectedEntry(
  implementation: ResolvedRuntimeImplementation,
  request: string,
): string | undefined {
  return implementation.allowedEntries[request];
}
