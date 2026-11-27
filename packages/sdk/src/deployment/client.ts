import type { GlobalModuleInfo } from '../types';
import { childSourceKey } from './computeSnapshot';
import type {
  DeploymentChildSource,
  DeploymentClient,
  DeploymentClientOptions,
  DeploymentDiscoveryContext,
  DeploymentSnapshot,
  DeploymentStore,
} from './types';

export const SNAPSHOT_EXPIRED_CODE = 'MODERN_APPLICATIONS_SNAPSHOT_EXPIRED';

export class DeploymentSnapshotExpiredError extends Error {
  readonly code = SNAPSHOT_EXPIRED_CODE;
  readonly source?: string;
  readonly expectedSid?: string;
  readonly receivedSid?: string;

  constructor(
    message = 'Deployment snapshot has expired.',
    options: {
      source?: string;
      expectedSid?: string;
      receivedSid?: string;
    } = {},
  ) {
    super(message);
    this.name = 'SnapshotExpiredError';
    this.source = options.source;
    this.expectedSid = options.expectedSid;
    this.receivedSid = options.receivedSid;
  }
}

interface MountSourceRecord {
  source: string;
  deploymentId?: string;
  sources: Record<string, DeploymentChildSource>;
  fixedChildren?: Record<string, DeploymentSnapshot>;
}

interface SerializedClientState {
  version: 1;
  acceptedSids: Record<string, string>;
  mounts: Record<string, MountSourceRecord>;
}

/**
 * Stateful runtime client for Modern.js `load(ctx)` hooks.
 * Resolves root and child deployments by source index, enforces same-source
 * `sid` consistency, and isolates staging transactions until commit/discard.
 */
export function createDeploymentClient(
  options: DeploymentClientOptions,
): DeploymentClient {
  const { rootSource, rootDeploymentId, readDeployment } = options;

  const acceptedSids = new Map<string, string>();
  const committedMounts = new Map<string, MountSourceRecord>();
  const stagedMounts = new Map<string, Map<string, MountSourceRecord>>();
  const stagedSids = new Map<string, Map<string, string>>();

  const getMountRecord = (
    mountId: string,
    transactionId?: string,
  ): MountSourceRecord | undefined => {
    if (transactionId) {
      const staged = stagedMounts.get(transactionId)?.get(mountId);
      if (staged) return staged;
    }
    return committedMounts.get(mountId);
  };

  const getAcceptedSid = (
    source: string,
    transactionId?: string,
  ): string | undefined => {
    const committed = acceptedSids.get(source);
    if (committed !== undefined) return committed;
    if (transactionId) {
      return stagedSids.get(transactionId)?.get(source);
    }
    return undefined;
  };

  const stageMountRecord = (
    mountId: string,
    record: MountSourceRecord,
    sid: string | undefined,
    transactionId?: string,
  ) => {
    if (!transactionId) {
      committedMounts.set(mountId, record);
      if (sid !== undefined) acceptedSids.set(record.source, sid);
      return;
    }
    let txMounts = stagedMounts.get(transactionId);
    if (!txMounts) {
      txMounts = new Map();
      stagedMounts.set(transactionId, txMounts);
    }
    txMounts.set(mountId, record);
    if (sid !== undefined) {
      let txSids = stagedSids.get(transactionId);
      if (!txSids) {
        txSids = new Map();
        stagedSids.set(transactionId, txSids);
      }
      txSids.set(record.source, sid);
    }
  };

  const assertSameSourceSid = (
    source: string,
    receivedSid: string | undefined,
    transactionId?: string,
  ) => {
    const expectedSid = getAcceptedSid(source, transactionId);
    if (
      expectedSid !== undefined &&
      receivedSid !== undefined &&
      expectedSid !== receivedSid
    ) {
      throw new DeploymentSnapshotExpiredError(
        `Deployment source "${source}" changed from sid "${expectedSid}" to "${receivedSid}".`,
        {
          source,
          expectedSid,
          receivedSid,
        },
      );
    }
  };

  const getApplications = async (
    ctx: DeploymentDiscoveryContext,
  ): Promise<{
    routes: DeploymentSnapshot['routes'];
    moduleInfo: GlobalModuleInfo;
  }> => {
    ctx.signal?.throwIfAborted();

    if (!ctx.consumer) {
      const snapshot = await readDeployment({
        source: rootSource,
        deploymentId: rootDeploymentId,
        signal: ctx.signal,
      });
      if (!snapshot) {
        if (rootDeploymentId) {
          throw new DeploymentSnapshotExpiredError(
            `Pinned root deployment "${rootSource}@${rootDeploymentId}" could not be restored.`,
            { source: rootSource },
          );
        }
        throw new Error(`Unknown root deployment source "${rootSource}".`);
      }
      assertSameSourceSid(rootSource, snapshot.sid, ctx.transactionId);
      stageMountRecord(
        ctx.mountId,
        {
          source: rootSource,
          deploymentId: rootDeploymentId,
          sources: snapshot.sources || {},
          fixedChildren: snapshot.fixedChildren,
        },
        snapshot.sid,
        ctx.transactionId,
      );
      return {
        routes: snapshot.routes,
        moduleInfo: snapshot.moduleInfo,
      };
    }

    const parentRecord = ctx.parentMountId
      ? getMountRecord(ctx.parentMountId, ctx.transactionId)
      : undefined;
    if (!parentRecord) {
      throw new Error(
        `No deployment source context found for parent mount "${ctx.parentMountId ?? ''}" when discovering "${ctx.consumer.moduleName}".`,
      );
    }

    const key = childSourceKey(
      ctx.consumer.moduleName,
      ctx.consumer.expose,
      ctx.consumer.versionOrUrl,
    );
    const childSource = parentRecord.sources[key];
    if (!childSource) {
      throw new Error(
        `Unknown child deployment source for "${ctx.consumer.moduleName}" (${ctx.consumer.expose}) under mount "${ctx.parentMountId}".`,
      );
    }

    // Serve pinned child snapshots directly from parent deployment without drifting.
    const embeddedFixed = parentRecord.fixedChildren?.[key];
    if (embeddedFixed) {
      stageMountRecord(
        ctx.mountId,
        {
          source: childSource.source,
          deploymentId: childSource.deploymentId,
          sources: embeddedFixed.sources || {},
          fixedChildren: embeddedFixed.fixedChildren,
        },
        undefined,
        ctx.transactionId,
      );
      return {
        routes: embeddedFixed.routes,
        moduleInfo: embeddedFixed.moduleInfo,
      };
    }

    const childSnapshot = await readDeployment({
      source: childSource.source,
      deploymentId: childSource.deploymentId,
      signal: ctx.signal,
    });
    if (!childSnapshot) {
      if (childSource.deploymentId) {
        throw new DeploymentSnapshotExpiredError(
          `Pinned child deployment "${childSource.source}@${childSource.deploymentId}" could not be restored.`,
          { source: childSource.source },
        );
      }
      throw new Error(
        `Unknown child deployment source "${childSource.source}".`,
      );
    }

    if (
      childSnapshot.consumerManifestUrl &&
      childSnapshot.consumerManifestUrl !== ctx.consumer.versionOrUrl
    ) {
      throw new Error(
        `Child deployment "${childSource.source}" expects consumer manifest "${childSnapshot.consumerManifestUrl}", which does not match parent-selected "${ctx.consumer.versionOrUrl}".`,
      );
    }

    // Only compare sid within the same independent source.
    assertSameSourceSid(
      childSource.source,
      childSnapshot.sid,
      ctx.transactionId,
    );

    stageMountRecord(
      ctx.mountId,
      {
        source: childSource.source,
        deploymentId: childSource.deploymentId,
        sources: childSnapshot.sources || {},
        fixedChildren: childSnapshot.fixedChildren,
      },
      childSnapshot.sid,
      ctx.transactionId,
    );

    return {
      routes: childSnapshot.routes,
      moduleInfo: childSnapshot.moduleInfo,
    };
  };

  const lifecycle = {
    onCommit(transactionId: string) {
      const txMounts = stagedMounts.get(transactionId);
      if (txMounts) {
        for (const [mountId, record] of txMounts) {
          committedMounts.set(mountId, record);
        }
        stagedMounts.delete(transactionId);
      }
      const txSids = stagedSids.get(transactionId);
      if (txSids) {
        for (const [source, sid] of txSids) {
          acceptedSids.set(source, sid);
        }
        stagedSids.delete(transactionId);
      }
    },
    onDiscard(transactionId: string) {
      stagedMounts.delete(transactionId);
      stagedSids.delete(transactionId);
    },
    dehydrate(): SerializedClientState {
      return {
        version: 1,
        acceptedSids: Object.fromEntries(acceptedSids.entries()),
        mounts: Object.fromEntries(committedMounts.entries()),
      };
    },
    hydrate(raw: unknown) {
      if (!raw || typeof raw !== 'object') return;
      const state = raw as SerializedClientState;
      if (state.version !== 1) return;
      if (state.acceptedSids && typeof state.acceptedSids === 'object') {
        for (const [source, sid] of Object.entries(state.acceptedSids)) {
          if (typeof sid === 'string') acceptedSids.set(source, sid);
        }
      }
      if (state.mounts && typeof state.mounts === 'object') {
        for (const [mountId, record] of Object.entries(state.mounts)) {
          if (record && typeof record === 'object') {
            committedMounts.set(mountId, record);
          }
        }
      }
    },
  };

  return {
    getApplications,
    lifecycle,
  };
}

/**
 * In-memory atomic DeploymentStore reference implementation for tests, local
 * development, and custom adapters.
 */
export function createMemoryDeploymentStore(): DeploymentStore {
  const snapshots = new Map<string, Map<string, DeploymentSnapshot>>();
  const activeIds = new Map<string, string>();
  let sequence = 0;

  return {
    async save(source, deployment) {
      let bucket = snapshots.get(source);
      if (!bucket) {
        bucket = new Map();
        snapshots.set(source, bucket);
      }
      const deploymentId = `dep_${++sequence}`;
      bucket.set(
        deploymentId,
        JSON.parse(JSON.stringify(deployment)) as DeploymentSnapshot,
      );
      return deploymentId;
    },
    async read({ source, deploymentId, signal }) {
      signal?.throwIfAborted();
      const bucket = snapshots.get(source);
      if (!bucket) return undefined;
      const targetId = deploymentId ?? activeIds.get(source);
      if (!targetId) return undefined;
      const found = bucket.get(targetId);
      return found
        ? (JSON.parse(JSON.stringify(found)) as DeploymentSnapshot)
        : undefined;
    },
    async activate(source, deploymentId) {
      const bucket = snapshots.get(source);
      if (!bucket || !bucket.has(deploymentId)) {
        throw new Error(
          `Cannot activate unknown deployment "${deploymentId}" for source "${source}".`,
        );
      }
      activeIds.set(source, deploymentId);
    },
    async list(source) {
      const bucket = snapshots.get(source);
      if (!bucket) return [];
      const current = activeIds.get(source);
      return [...bucket.entries()].map(([deploymentId, snapshot]) => ({
        deploymentId,
        active: deploymentId === current,
        ...(snapshot.sid ? { sid: snapshot.sid } : {}),
      }));
    },
  };
}
