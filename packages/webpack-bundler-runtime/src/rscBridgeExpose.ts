type ManifestExport = {
  id: string;
  name: string;
  chunks?: Array<string | number>;
  async?: boolean;
};

type ManifestNode = Record<string, ManifestExport>;

type ManifestLike = {
  serverManifest?: Record<string, ManifestExport>;
  clientManifest?: Record<string, ManifestExport>;
  serverConsumerModuleMap?: Record<string, ManifestNode>;
  moduleLoading?: Record<string, unknown>;
  entryCssFiles?: Record<string, string[]>;
  entryJsFiles?: Record<string, string[]>;
  clientExposes?: Record<string, string>;
};

type WebpackRequireRuntime = {
  initializeExposesData?: {
    moduleMap?: Record<string, () => Promise<() => unknown> | (() => unknown)>;
  };
  rscM?: ManifestLike;
};

declare const __webpack_require__: WebpackRequireRuntime;

const CLIENT_REFERENCE_SYMBOL = Symbol.for('react.client.reference');
const BRIDGE_EXPOSE_KEY = './__rspack_rsc_bridge__';

const actionReferenceCache: Record<string, (...args: unknown[]) => unknown> =
  Object.create(null);
const clientExposeMap: Record<string, string> = Object.create(null);
let scannedExposes = false;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeExpose = (expose: string) =>
  expose.startsWith('./') ? expose : `./${expose}`;

const getClientReferenceIdentity = (
  value: unknown,
): { key: string; baseKey: string } | undefined => {
  if (!isObject(value) && typeof value !== 'function') {
    return undefined;
  }
  const candidate = value as {
    $$typeof?: unknown;
    $$id?: unknown;
  };
  if (
    candidate.$$typeof !== CLIENT_REFERENCE_SYMBOL ||
    typeof candidate.$$id !== 'string' ||
    !candidate.$$id
  ) {
    return undefined;
  }
  const key = candidate.$$id;
  const hashIndex = key.indexOf('#');
  const baseKey = hashIndex >= 0 ? key.slice(0, hashIndex) : key;
  return { key, baseKey };
};

const cacheActionReference = (value: unknown) => {
  if (typeof value !== 'function') {
    return;
  }
  const id = (value as { $$id?: unknown }).$$id;
  if (typeof id === 'string' && id) {
    actionReferenceCache[id] = value as (...args: unknown[]) => unknown;
  }
};

const cacheClientExpose = (value: unknown, exposeName: string) => {
  const identity = getClientReferenceIdentity(value);
  if (!identity) {
    return;
  }
  const normalizedExpose = normalizeExpose(exposeName);
  if (!Object.prototype.hasOwnProperty.call(clientExposeMap, identity.key)) {
    clientExposeMap[identity.key] = normalizedExpose;
  }
  if (
    !Object.prototype.hasOwnProperty.call(clientExposeMap, identity.baseKey)
  ) {
    clientExposeMap[identity.baseKey] = normalizedExpose;
  }
};

const inspectExportValue = (value: unknown, exposeName: string) => {
  cacheActionReference(value);
  cacheClientExpose(value, exposeName);
  if (!isObject(value)) {
    return;
  }
  for (const nestedValue of Object.values(value)) {
    cacheActionReference(nestedValue);
    cacheClientExpose(nestedValue, exposeName);
  }
};

const resolveFactoryExports = async (getFactory: () => unknown) => {
  const factory = await Promise.resolve(getFactory());
  if (typeof factory === 'function') {
    return (factory as () => unknown)();
  }
  return factory;
};

const scanExposedModules = async () => {
  if (scannedExposes) {
    return;
  }
  scannedExposes = true;

  const moduleMap = __webpack_require__.initializeExposesData?.moduleMap;
  if (!isObject(moduleMap)) {
    return;
  }

  for (const [exposeName, getFactory] of Object.entries(moduleMap)) {
    if (exposeName === BRIDGE_EXPOSE_KEY || typeof getFactory !== 'function') {
      continue;
    }
    try {
      const exportsValue = await resolveFactoryExports(getFactory);
      inspectExportValue(exportsValue, exposeName);
      if (isObject(exportsValue) && isObject(exportsValue['default'])) {
        inspectExportValue(exportsValue['default'], exposeName);
      }
    } catch {
      // Ignore expose loading errors while scanning bridge metadata.
    }
  }
};

export async function getManifest(): Promise<ManifestLike> {
  await scanExposedModules();
  const manifest = isObject(__webpack_require__.rscM)
    ? (__webpack_require__.rscM as ManifestLike)
    : {};
  return {
    ...manifest,
    clientExposes: {
      ...(manifest.clientExposes || {}),
      ...clientExposeMap,
    },
  };
}

export async function executeAction(actionId: string, args: unknown[]) {
  await scanExposedModules();
  const action = actionReferenceCache[actionId];
  if (typeof action !== 'function') {
    throw new Error(
      `[rsc-bridge-expose] Missing remote action for "${actionId}". Ensure the action is reachable from a federated expose.`,
    );
  }
  return action(...(Array.isArray(args) ? args : []));
}
