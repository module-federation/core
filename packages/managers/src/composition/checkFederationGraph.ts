import {
  FAMILY_PACKAGES,
  type FamilyPackage,
  type RuntimeFamily,
} from './family';
import type { AdapterName } from './plan';

export interface GraphModule {
  /** The module type; the caller passes 'container-entry' for a ContainerEntryModule. */
  type: string;
  resource?: string;
  /** The module's description file: package name and directory. */
  package?: { name: string; root: string };
}

export interface FederationGraphSummary {
  modules: readonly GraphModule[];
  /** Requests of every ExternalModule in the compilation. */
  externalRequests: readonly string[];
  family?: RuntimeFamily;
  /** Present when the compilation uses the composed bootstrap. */
  composed?: { adapters: readonly AdapterName[]; bootstraps: number };
}

export interface GraphFindings {
  errors: string[];
  warnings: string[];
}

const ADAPTER_OF_MODULE: Record<string, AdapterName> = {
  'remote-module': 'remotes',
  'consume-shared-module': 'consumes',
  'provide-module': 'share-scope',
  'container-entry': 'container',
};

const familyPackageOf = (request: string) =>
  FAMILY_PACKAGES.find(
    (pkg) => request === pkg || request.startsWith(`${pkg}/`),
  );

export function checkFederationGraph(
  summary: FederationGraphSummary,
): GraphFindings {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { composed } = summary;

  if (composed) {
    const missing = new Map<AdapterName, string>();
    for (const { type } of summary.modules) {
      const adapter = ADAPTER_OF_MODULE[type];
      if (adapter && !composed.adapters.includes(adapter))
        missing.set(adapter, type);
    }
    for (const [adapter, type] of [...missing].sort(([a], [b]) =>
      a < b ? -1 : 1,
    )) {
      errors.push(
        `A ${type} is in the graph but the federation bootstrap has no "${adapter}" adapter. Register the plugin that creates it with the federation plan.`,
      );
    }
    for (const request of [...new Set(summary.externalRequests)].sort()) {
      if (familyPackageOf(request)) {
        errors.push(
          `"${request}" is external, but the composed federation bootstrap imports the runtime. Remove it from externals or disable experiments.composedRuntime.`,
        );
      }
    }
    if (composed.bootstraps > 1) {
      (missing.size ? errors : warnings).push(
        `The compilation has ${composed.bootstraps} federation bootstraps. Use one ModuleFederationPlugin per compilation.`,
      );
    }
  }

  const byRoot = new Map<string, { pkg: FamilyPackage; kinds: Set<string> }>();
  for (const { resource, package: owner } of summary.modules) {
    const pkg = FAMILY_PACKAGES.find((name) => name === owner?.name);
    if (!pkg || !owner) continue;
    const entry = byRoot.get(owner.root) ?? { pkg, kinds: new Set<string>() };
    if (resource?.endsWith('.cjs')) entry.kinds.add('.cjs');
    else if (resource && /\.m?js$/.test(resource)) entry.kinds.add('.js');
    byRoot.set(owner.root, entry);
  }
  for (const [root, { pkg, kinds }] of [...byRoot].sort(([a], [b]) =>
    a < b ? -1 : 1,
  )) {
    const member = summary.family?.members[pkg];
    if (member && member.root !== root) {
      warnings.push(
        `${pkg} resolved to ${root}, outside the runtime family at ${member.root}. Deduplicate the federation runtime packages.`,
      );
    }
    if (kinds.size > 1) {
      warnings.push(
        `${pkg} at ${root} is in the graph as both .cjs and .js, so it runs twice. Import it through one module format.`,
      );
    }
  }
  return { errors, warnings };
}
