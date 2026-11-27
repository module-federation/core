import { generateSnapshotFromManifest } from '../generateSnapshotFromManifest';
import type { GlobalModuleInfo, Manifest, ProviderModuleInfo } from '../types';
import type {
  ComputeDeploymentSnapshotOptions,
  DeploymentChildSource,
  DeploymentConfig,
  DeploymentRemoteRoute,
  DeploymentSnapshot,
  ResolvedProducer,
  ResolveManifestOptions,
} from './types';

function normalizeExpose(expose: string): string {
  const trimmed = expose.trim();
  if (!trimmed || trimmed === '.') return '.';
  return trimmed.startsWith('./')
    ? trimmed
    : `./${trimmed.replace(/^\/+/, '')}`;
}

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith('/');
}

function isManifestUrl(value: string): boolean {
  return /\.json(?:[?#]|$)/i.test(value);
}

async function defaultLoadManifest(
  url: string,
  signal?: AbortSignal,
): Promise<Manifest> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch manifest from "${url}": HTTP ${response.status}`,
    );
  }
  return (await response.json()) as Manifest;
}

function validateManifest(manifest: unknown, manifestUrl: string): Manifest {
  if (
    !manifest ||
    typeof manifest !== 'object' ||
    typeof (manifest as Manifest).name !== 'string' ||
    !(manifest as Manifest).name ||
    !(manifest as Manifest).metaData ||
    typeof (manifest as Manifest).metaData !== 'object'
  ) {
    throw new Error(
      `Invalid Module Federation manifest at "${manifestUrl}": missing name or metaData.`,
    );
  }
  return manifest as Manifest;
}

export function childSourceKey(
  moduleName: string,
  expose: string,
  versionOrUrl: string,
): string {
  return `${moduleName}::${normalizeExpose(expose)}::${versionOrUrl}`;
}

/**
 * Fetch and parse a remote manifest into a ResolvedProducer while preserving
 * the resolved manifestUrl as the asset base for `publicPath: 'auto'`.
 */
export async function resolveManifest(
  manifestUrl: string,
  options: ResolveManifestOptions = {},
): Promise<ResolvedProducer> {
  if (typeof manifestUrl !== 'string' || !manifestUrl.trim()) {
    throw new Error('resolveManifest requires a non-empty manifestUrl.');
  }
  options.signal?.throwIfAborted();
  const loader = options.loadManifest ?? defaultLoadManifest;
  const raw = await loader(manifestUrl, options.signal);
  options.signal?.throwIfAborted();
  const manifest = validateManifest(raw, manifestUrl);
  const snapshot = generateSnapshotFromManifest(manifest, {
    version: manifestUrl,
  });
  return {
    manifestUrl,
    moduleName: manifest.name,
    manifest,
    snapshot,
  };
}

function mergeManifestRemotes(
  manifest: Manifest,
  explicitRemotes: Record<string, string>,
  overrides: Record<string, string>,
): Record<string, string> {
  // Preserve ordinary code dependencies from manifest.remotes BEFORE applying
  // explicit remotes and overrides (Manifest < config.remotes < config.overrides).
  const merged: Record<string, string> = {};
  for (const remote of manifest.remotes || []) {
    const name = remote.federationContainerName;
    if (!name || name === manifest.name) continue;
    const ref = 'version' in remote ? remote.version : remote.entry;
    if (ref) merged[name] = ref;
  }
  for (const [name, ref] of Object.entries(explicitRemotes)) {
    if (name !== manifest.name) merged[name] = ref;
  }
  for (const [name, ref] of Object.entries(overrides)) {
    if (name in merged && name !== manifest.name) {
      merged[name] = ref;
    }
  }
  return merged;
}

function assertExposeExists(
  manifest: Manifest,
  expose: string,
  manifestUrl: string,
): void {
  const normalized = normalizeExpose(expose);
  const bareName = normalized.startsWith('./')
    ? normalized.slice(2)
    : normalized;
  const exposes = manifest.exposes || [];
  const found = exposes.some(
    (item) =>
      item.path === normalized ||
      item.name === bareName ||
      item.name === normalized,
  );
  if (!found) {
    throw new Error(
      `Expose "${expose}" does not exist in manifest "${manifest.name}" (${manifestUrl}).`,
    );
  }
}

/**
 * Compile a consumer's direct dynamic application mounts and static code
 * dependencies into a normalized DeploymentSnapshot.
 */
export async function computeDeploymentSnapshot(
  config: DeploymentConfig,
  options: ComputeDeploymentSnapshotOptions = {},
): Promise<DeploymentSnapshot> {
  if (
    !config ||
    typeof config.consumer !== 'string' ||
    !config.consumer.trim()
  ) {
    throw new Error('computeDeploymentSnapshot requires a consumer name.');
  }
  if (!Array.isArray(config.applications)) {
    throw new Error(
      'computeDeploymentSnapshot requires an applications array.',
    );
  }
  options.signal?.throwIfAborted();

  const resolveProducer =
    options.resolveManifest ??
    ((url: string, opts?: ResolveManifestOptions) =>
      resolveManifest(url, {
        signal: opts?.signal ?? options.signal,
        loadManifest: opts?.loadManifest ?? options.loadManifest,
      }));

  const explicitRemotes = config.remotes || {};
  const overrides = config.overrides || {};
  const routes: DeploymentRemoteRoute[] = [];
  const moduleInfo: GlobalModuleInfo = {};
  const sources: Record<string, DeploymentChildSource> = {};
  const fixedChildren: Record<string, DeploymentSnapshot> = {};
  let hasFixedChildren = false;

  const consumerRemotesInfo: Record<string, { matchedVersion: string }> = {};
  const visitedProducers = new Map<string, ResolvedProducer>();
  const seenRoutes = new Set<string>();
  const seenModuleVersions = new Map<string, string>();

  const loadProducerCached = async (
    manifestUrl: string,
  ): Promise<ResolvedProducer> => {
    const existing = visitedProducers.get(manifestUrl);
    if (existing) return existing;
    const resolved = await resolveProducer(manifestUrl, {
      signal: options.signal,
      loadManifest: options.loadManifest,
    });
    visitedProducers.set(manifestUrl, resolved);
    return resolved;
  };

  const visitingDeps = new Set<string>();

  const traverseStaticDependencies = async (
    ownerName: string,
    ownerManifest: Manifest,
    chain: string[],
  ): Promise<Record<string, string>> => {
    const rawDeps = mergeManifestRemotes(ownerManifest, {}, overrides);
    const resolvedDeps: Record<string, string> = {};

    for (const [depName, rawRef] of Object.entries(rawDeps)) {
      options.signal?.throwIfAborted();
      let finalRef = rawRef;
      let directRemoteEntry:
        | { remoteEntry: string; globalName: string }
        | undefined;

      if (!isUrl(rawRef) || !isManifestUrl(rawRef)) {
        if (options.resolveRemote) {
          const resolved = await options.resolveRemote({
            consumer: ownerName,
            moduleName: depName,
            reference: rawRef,
            signal: options.signal,
          });
          if (typeof resolved === 'string') {
            finalRef = resolved;
          } else if (resolved.manifestUrl) {
            finalRef = resolved.manifestUrl;
          } else if (resolved.remoteEntry) {
            finalRef = resolved.remoteEntry;
            directRemoteEntry = {
              remoteEntry: resolved.remoteEntry,
              globalName: resolved.globalName || depName,
            };
          } else {
            throw new Error(
              `Unable to resolve remote "${depName}" (reference "${rawRef}") in chain ${[...chain, ownerName].join(' -> ')}.`,
            );
          }
        } else if (isUrl(rawRef)) {
          // Direct remoteEntry URL terminal dependency.
          directRemoteEntry = {
            remoteEntry: rawRef,
            globalName: depName,
          };
        } else {
          throw new Error(
            `Unable to resolve non-URL remote reference "${rawRef}" for "${depName}" in chain ${[...chain, ownerName].join(' -> ')}. Provide options.resolveRemote.`,
          );
        }
      }

      resolvedDeps[depName] = finalRef;

      if (directRemoteEntry) {
        moduleInfo[`${depName}:${finalRef}`] = {
          remoteEntry: directRemoteEntry.remoteEntry,
          globalName: directRemoteEntry.globalName,
          version: finalRef,
        };
        continue;
      }

      const depKey = `${depName}:${finalRef}`;
      if (moduleInfo[depKey] || visitingDeps.has(depKey)) continue;
      visitingDeps.add(depKey);

      try {
        const depProducer = await loadProducerCached(finalRef);
        const depChildRemotes = await traverseStaticDependencies(
          depProducer.moduleName,
          depProducer.manifest,
          [...chain, ownerName],
        );
        const depSnapshot: ProviderModuleInfo = generateSnapshotFromManifest(
          depProducer.manifest,
          {
            version: finalRef,
            remotes: depChildRemotes,
            overrides,
          },
        );
        moduleInfo[depKey] = depSnapshot;
      } finally {
        visitingDeps.delete(depKey);
      }
    }

    return resolvedDeps;
  };

  // Resolve explicit static remotes on the root consumer first.
  for (const [remoteName, rawRef] of Object.entries(explicitRemotes)) {
    const finalRef = overrides[remoteName] ?? rawRef;
    consumerRemotesInfo[remoteName] = { matchedVersion: finalRef };
    if (isUrl(finalRef) && isManifestUrl(finalRef)) {
      const producer = await loadProducerCached(finalRef);
      const depRemotes = await traverseStaticDependencies(
        producer.moduleName,
        producer.manifest,
        [config.consumer],
      );
      moduleInfo[`${producer.moduleName}:${finalRef}`] =
        generateSnapshotFromManifest(producer.manifest, {
          version: finalRef,
          remotes: depRemotes,
          overrides,
        });
    }
  }

  // Process dynamic application mounts.
  for (const app of config.applications) {
    options.signal?.throwIfAborted();
    if (!app.route || !app.route.trim()) {
      throw new Error(
        `Application mount for "${app.manifestUrl}" requires a non-empty route.`,
      );
    }
    const normalizedRoute = app.route.trim().replace(/^\/+/, '');
    if (seenRoutes.has(normalizedRoute)) {
      throw new Error(
        `Duplicate route "${app.route}" in deployment config for "${config.consumer}".`,
      );
    }
    seenRoutes.add(normalizedRoute);

    // Apply overrides if the producer name matches after resolving manifestUrl.
    const initialProducer = await loadProducerCached(app.manifestUrl);
    const effectiveManifestUrl =
      overrides[initialProducer.moduleName] ?? app.manifestUrl;
    const producer =
      effectiveManifestUrl === app.manifestUrl
        ? initialProducer
        : await loadProducerCached(effectiveManifestUrl);

    assertExposeExists(producer.manifest, app.expose, effectiveManifestUrl);

    const existingVer = seenModuleVersions.get(producer.moduleName);
    if (existingVer && existingVer !== effectiveManifestUrl) {
      throw new Error(
        `Conflicting manifest URLs for module "${producer.moduleName}" in consumer "${config.consumer}": "${existingVer}" vs "${effectiveManifestUrl}".`,
      );
    }
    seenModuleVersions.set(producer.moduleName, effectiveManifestUrl);

    const staticDeps = await traverseStaticDependencies(
      producer.moduleName,
      producer.manifest,
      [config.consumer],
    );
    const snapshot = generateSnapshotFromManifest(producer.manifest, {
      version: effectiveManifestUrl,
      remotes: staticDeps,
      overrides,
    });
    moduleInfo[`${producer.moduleName}:${effectiveManifestUrl}`] = snapshot;
    consumerRemotesInfo[producer.moduleName] = {
      matchedVersion: effectiveManifestUrl,
    };

    const normalizedExpose = normalizeExpose(app.expose);
    const hasChildren = Boolean(
      app.children && typeof app.children === 'object',
    );
    routes.push({
      route: app.route.trim(),
      moduleName: producer.moduleName,
      expose: normalizedExpose,
      versionOrUrl: effectiveManifestUrl,
      discoverChildren: hasChildren,
      ...(app.props ? { props: { ...app.props } } : {}),
    });

    if (app.children && typeof app.children === 'object') {
      const key = childSourceKey(
        producer.moduleName,
        normalizedExpose,
        effectiveManifestUrl,
      );
      sources[key] = {
        source: app.children.source,
        ...(app.children.deploymentId
          ? { deploymentId: app.children.deploymentId }
          : {}),
        producerManifestUrl: effectiveManifestUrl,
        moduleName: producer.moduleName,
        expose: normalizedExpose,
        route: app.route.trim(),
      };

      if (app.children.deploymentId) {
        if (!options.readDeployment) {
          throw new Error(
            `Fixed child deployment "${app.children.source}@${app.children.deploymentId}" requires options.readDeployment.`,
          );
        }
        const fixed = await options.readDeployment({
          source: app.children.source,
          deploymentId: app.children.deploymentId,
          signal: options.signal,
        });
        if (!fixed) {
          throw new Error(
            `Fixed child deployment "${app.children.source}@${app.children.deploymentId}" was not found.`,
          );
        }
        if (
          fixed.consumerManifestUrl &&
          fixed.consumerManifestUrl !== effectiveManifestUrl
        ) {
          throw new Error(
            `Fixed child deployment "${app.children.source}@${app.children.deploymentId}" expects consumer manifest "${fixed.consumerManifestUrl}", but parent mounted "${effectiveManifestUrl}".`,
          );
        }
        fixedChildren[key] = JSON.parse(
          JSON.stringify(fixed),
        ) as DeploymentSnapshot;
        hasFixedChildren = true;
      }
    }
  }

  moduleInfo[config.consumer] = {
    version: config.consumerManifestUrl || '',
    buildVersion: config.sid || '',
    remoteTypes: '',
    remoteTypesZip: '',
    remotesInfo: consumerRemotesInfo,
    shared: [],
  };

  return {
    version: 1,
    consumer: config.consumer,
    ...(config.consumerManifestUrl
      ? { consumerManifestUrl: config.consumerManifestUrl }
      : {}),
    ...(config.sid ? { sid: config.sid } : {}),
    routes,
    moduleInfo,
    sources,
    ...(hasFixedChildren ? { fixedChildren } : {}),
  };
}
