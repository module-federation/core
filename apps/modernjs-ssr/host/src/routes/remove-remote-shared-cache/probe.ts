import {
  loadRemote,
  registerRemotes,
  removeRemote,
} from '@module-federation/modern-js-v3/runtime';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { writeHeapSnapshot } from 'node:v8';

type SharedModule = {
  getConsumerMarker?: () => string;
  getProvidedAntdVersion?: () => string;
  getNonSharedPayloadItems?: () => number;
  getNonSharedPayload?: () => object;
};

type SharedRecord = {
  from?: string;
  loaded?: boolean;
  useIn?: string[];
};

const consumerName = 'another_remote';
let heapSnapshotSequence = 0;
let nonSharedPayloadRef: WeakRef<object> | undefined;
let latestLoadSnapshot: ReturnType<typeof takeHeapSnapshot> | undefined;

const remoteEntries = [
  {
    name: consumerName,
    entry: 'http://127.0.0.1:3057/mf-manifest.json',
  },
];

const getInstances = () =>
  (
    globalThis as typeof globalThis & {
      __FEDERATION__?: { __INSTANCES__?: Array<{ name?: string }> };
    }
  ).__FEDERATION__?.__INSTANCES__ || [];

const getAntdShares = () => {
  const shareScopes = (
    globalThis as typeof globalThis & {
      __FEDERATION__?: {
        __SHARE__?: Record<
          string,
          Record<string, Record<string, Record<string, SharedRecord>>>
        >;
      };
    }
  ).__FEDERATION__?.__SHARE__;
  const shares: SharedRecord[] = [];

  for (const scopes of Object.values(shareScopes || {})) {
    for (const scope of Object.values(scopes)) {
      shares.push(...Object.values(scope.antd || {}));
    }
  }
  return shares;
};

const getRuntimeState = () => {
  const instances = getInstances();
  const host = instances.find((item) => item.name === 'host') as
    | { moduleCache?: Map<string, unknown> }
    | undefined;
  return {
    anotherRemoteInstances: instances.filter(
      (item) => item.name === consumerName,
    ).length,
    hostModuleCacheHasAnotherRemote: Boolean(
      host?.moduleCache?.has(consumerName),
    ),
    antdShares: getAntdShares().map(({ from, loaded, useIn }) => ({
      from,
      loaded,
      useIn,
    })),
  };
};

const toMb = (value: number) => Math.round((value / 1024 / 1024) * 100) / 100;

const forceGc = () => {
  const gc = (globalThis as typeof globalThis & { gc?: () => void }).gc;
  if (typeof gc !== 'function') {
    return false;
  }
  gc();
  gc();
  return true;
};

const takeHeapSnapshot = (label: string) => {
  const directory =
    process.env.MF_SSR_HEAP_SNAPSHOT_DIR || '/tmp/mf-ssr-cache-probe';
  mkdirSync(directory, { recursive: true });
  const sequence = String((heapSnapshotSequence += 1)).padStart(2, '0');
  const file = join(
    directory,
    `${sequence}-shared-${label}-${Date.now()}.heapsnapshot`,
  );
  writeHeapSnapshot(file);
  return {
    label,
    heapUsedMb: toMb(process.memoryUsage().heapUsed),
    file,
  };
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

type ProbeOptions = {
  load: boolean;
  remove: string | null;
};

export const runSharedProviderProbe = async ({
  load,
  remove,
}: ProbeOptions) => {
  if (!load && !remove) {
    try {
      await removeRemote(consumerName);
    } catch {
      // Reset the state for a fresh SSR request sequence.
    }
    registerRemotes(remoteEntries, { force: true });
    const consumer = (await loadRemote(
      `${consumerName}/SharedConsumer`,
    )) as SharedModule;
    const nonSharedPayload = consumer.getNonSharedPayload?.();
    nonSharedPayloadRef = nonSharedPayload
      ? new WeakRef(nonSharedPayload)
      : undefined;

    const afterLoad = takeHeapSnapshot('after-load');
    latestLoadSnapshot = afterLoad;

    return {
      consumerMarker: consumer.getConsumerMarker?.(),
      providedAntdVersion: consumer.getProvidedAntdVersion?.(),
      nonSharedPayloadItems: consumer.getNonSharedPayloadItems?.(),
      runtime: getRuntimeState(),
      snapshots: [afterLoad],
    };
  }

  const antdVersion = load ? (await import('antd')).version : undefined;

  if (remove === consumerName) {
    await removeRemote(consumerName);
    const afterRemove = takeHeapSnapshot('after-remove');
    forceGc();
    await wait(100);
    forceGc();
    const antdVersionAfterRemove = (await import('antd')).version;

    return {
      antdVersion,
      antdVersionAfterRemove,
      gcAvailable: typeof globalThis.gc === 'function',
      nonSharedPayloadCollected: nonSharedPayloadRef?.deref() === undefined,
      runtime: getRuntimeState(),
      snapshots: [
        ...(latestLoadSnapshot ? [latestLoadSnapshot] : []),
        afterRemove,
        takeHeapSnapshot('after-gc'),
      ],
    };
  }

  return {
    antdVersion,
    runtime: getRuntimeState(),
    snapshots: [],
  };
};
