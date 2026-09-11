import { useLoaderData } from '@modern-js/runtime/router';
import type { CSSProperties } from 'react';

type Snapshot = {
  label: string;
  heapUsedMb: number;
  file: string;
};

type Result = {
  antdVersion?: string;
  antdVersionAfterRemove?: string;
  consumerMarker?: string;
  gcAvailable?: boolean;
  nonSharedPayloadCollected?: boolean;
  nonSharedPayloadItems?: number;
  runtime: {
    anotherRemoteInstances: number;
    hostModuleCacheHasAnotherRemote: boolean;
    antdShares: Array<{ from?: string; loaded?: boolean }>;
  };
  snapshots: Snapshot[];
};

const phaseName = (label: string) =>
  label.replace('after-', '').replace(/-/g, ' ');

const hasRetainedShared = (result: Result) =>
  result.runtime.antdShares.some(
    (shared) => shared.from === 'another_remote' && shared.loaded,
  );

export default function RemoveRemoteSharedCachePage(): JSX.Element {
  const result = useLoaderData() as Result;
  const snapshots = result.snapshots || [];
  const maxHeap = Math.max(...snapshots.map((item) => item.heapUsedMb), 1);
  const loadSnapshot = snapshots.find((item) => item.label === 'after-load');
  const gcSnapshot = snapshots.find((item) => item.label === 'after-gc');
  const heapDelta =
    loadSnapshot && gcSnapshot
      ? Math.round((gcSnapshot.heapUsedMb - loadSnapshot.heapUsedMb) * 100) /
        100
      : undefined;
  const isRemoved = result.runtime.anotherRemoteInstances === 0;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>SSR SHARED CACHE PROBE</p>
          <h1 style={styles.title}>another_remote memory lifecycle</h1>
          <p style={styles.subtitle}>
            Track the retained antd share while confirming non-shared payloads
            are released.
          </p>
        </div>
        <div style={isRemoved ? styles.badgeSuccess : styles.badgeActive}>
          {isRemoved ? 'Removed' : 'Loaded'}
        </div>
      </header>

      <nav style={styles.actions}>
        <a href="/remove-remote-shared-cache" style={styles.actionLink}>
          1. Load remote
        </a>
        <a href="/remove-remote-shared-cache?load=1" style={styles.actionLink}>
          2. Host consumes antd
        </a>
        <a
          href="/remove-remote-shared-cache?remove=another_remote"
          style={styles.actionDanger}
        >
          3. Remove remote
        </a>
      </nav>

      <section style={styles.metricGrid}>
        <Metric
          label="Shared retention baseline"
          value={
            gcSnapshot ? `${gcSnapshot.heapUsedMb.toFixed(2)} MB` : 'Pending'
          }
          detail={
            hasRetainedShared(result)
              ? `Includes host, Node, and retained antd ${result.antdVersionAfterRemove || result.antdVersion || ''}`
              : 'Not an exact package allocation'
          }
          tone={hasRetainedShared(result) ? 'shared' : 'neutral'}
        />
        <Metric
          label="Heap after GC"
          value={
            gcSnapshot ? `${gcSnapshot.heapUsedMb.toFixed(2)} MB` : 'Pending'
          }
          detail={
            heapDelta === undefined
              ? 'Run the removal step'
              : `${heapDelta > 0 ? '+' : ''}${heapDelta.toFixed(2)} MB vs load`
          }
          tone={heapDelta !== undefined && heapDelta <= 0 ? 'good' : 'neutral'}
        />
        <Metric
          label="Non-shared payload"
          value={
            result.nonSharedPayloadCollected === undefined
              ? `${result.nonSharedPayloadItems || 0} items loaded`
              : result.nonSharedPayloadCollected
                ? 'Collected'
                : 'Still retained'
          }
          detail="WeakRef after forced GC"
          tone={result.nonSharedPayloadCollected ? 'good' : 'neutral'}
        />
        <Metric
          label="Remote runtime"
          value={
            result.runtime.anotherRemoteInstances === 0
              ? 'Instance removed'
              : 'Instance active'
          }
          detail={
            result.runtime.hostModuleCacheHasAnotherRemote
              ? 'Module cache present'
              : 'Module cache cleared'
          }
          tone={isRemoved ? 'good' : 'neutral'}
        />
        <Metric
          label="Shared antd"
          value={hasRetainedShared(result) ? 'Retained' : 'Unavailable'}
          detail={
            result.antdVersionAfterRemove || result.antdVersion
              ? `Version ${result.antdVersionAfterRemove || result.antdVersion}`
              : 'Load host consumer first'
          }
          tone={hasRetainedShared(result) ? 'shared' : 'neutral'}
        />
      </section>

      <section style={styles.chartPanel}>
        <div style={styles.panelHeading}>
          <div>
            <h2 style={styles.panelTitle}>Heap comparison</h2>
            <p style={styles.panelDescription}>
              Heap snapshots are written for each phase. A stable shared
              baseline may remain after removal.
            </p>
          </div>
          {result.gcAvailable && <span style={styles.gcLabel}>GC enabled</span>}
        </div>
        {snapshots.length ? (
          <div style={styles.chart}>
            {snapshots.map((snapshot) => (
              <div key={snapshot.file} style={styles.barColumn}>
                <div style={styles.valueLabel}>
                  {snapshot.heapUsedMb.toFixed(2)} MB
                </div>
                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.bar,
                      height: `${Math.max(
                        8,
                        (snapshot.heapUsedMb / maxHeap) * 100,
                      )}%`,
                      background:
                        snapshot.label === 'after-gc'
                          ? '#1f8f5f'
                          : snapshot.label === 'after-remove'
                            ? '#d97706'
                            : '#2563eb',
                    }}
                  />
                </div>
                <div style={styles.phaseLabel}>{phaseName(snapshot.label)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.empty}>Load the remote to create a baseline.</p>
        )}
      </section>

      <section style={styles.statusPanel}>
        <Status
          ok={isRemoved}
          label="Federation instance removed"
          pending="Pending removal"
        />
        <Status
          ok={!result.runtime.hostModuleCacheHasAnotherRemote && isRemoved}
          label="Non-shared module cache cleared"
          pending="Pending removal"
        />
        <Status
          ok={hasRetainedShared(result)}
          label="Loaded antd shared module retained"
          pending="Shared module not loaded"
        />
        <Status
          ok={result.nonSharedPayloadCollected === true}
          label="Non-shared payload collected"
          pending="Verified after removal"
        />
      </section>

      <pre id="remove-remote-shared-cache-result" style={styles.rawResult}>
        {JSON.stringify(result)}
      </pre>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: 'good' | 'neutral' | 'shared';
}): JSX.Element {
  const color =
    tone === 'good' ? '#137a4b' : tone === 'shared' ? '#7a4c00' : '#172033';
  return (
    <div style={styles.metric}>
      <p style={styles.metricLabel}>{label}</p>
      <strong style={{ ...styles.metricValue, color }}>{value}</strong>
      <p style={styles.metricDetail}>{detail}</p>
    </div>
  );
}

function Status({
  ok,
  label,
  pending,
}: {
  ok: boolean;
  label: string;
  pending: string;
}): JSX.Element {
  return (
    <div style={styles.status}>
      <span style={ok ? styles.statusOk : styles.statusPending}>
        {ok ? 'PASS' : 'WAIT'}
      </span>
      <span>{ok ? label : pending}</span>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    maxWidth: 1080,
    margin: '24px auto 48px',
    color: '#172033',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 24,
    alignItems: 'flex-start',
    borderBottom: '1px solid #d7dee8',
    paddingBottom: 20,
  },
  eyebrow: { color: '#526176', fontSize: 12, fontWeight: 700, margin: 0 },
  title: { fontSize: 28, margin: '7px 0', fontWeight: 700 },
  subtitle: { color: '#526176', fontSize: 15, lineHeight: 1.5 },
  badgeActive: {
    background: '#e5edff',
    color: '#1949a3',
    padding: '7px 10px',
    fontSize: 13,
    fontWeight: 700,
  },
  badgeSuccess: {
    background: '#dff5e8',
    color: '#137a4b',
    padding: '7px 10px',
    fontSize: 13,
    fontWeight: 700,
  },
  actions: { display: 'flex', gap: 10, margin: '20px 0' },
  actionLink: {
    border: '1px solid #9eabc0',
    color: '#1e3a6d',
    padding: '8px 12px',
    fontSize: 14,
    textDecoration: 'none',
  },
  actionDanger: {
    border: '1px solid #c76552',
    color: '#962d1b',
    padding: '8px 12px',
    fontSize: 14,
    textDecoration: 'none',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 12,
  },
  metric: { border: '1px solid #d7dee8', padding: 16, minHeight: 128 },
  metricLabel: { color: '#526176', fontSize: 13, margin: 0 },
  metricValue: { display: 'block', fontSize: 21, margin: '10px 0 6px' },
  metricDetail: { color: '#6b7789', fontSize: 12, margin: 0 },
  chartPanel: { border: '1px solid #d7dee8', marginTop: 12, padding: 20 },
  panelHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
  },
  panelTitle: { fontSize: 18, margin: 0 },
  panelDescription: { color: '#526176', marginTop: 5, fontSize: 13 },
  gcLabel: { color: '#137a4b', fontSize: 12, fontWeight: 700 },
  chart: {
    display: 'flex',
    height: 220,
    alignItems: 'flex-end',
    gap: 32,
    marginTop: 20,
    borderBottom: '1px solid #aeb9c9',
    padding: '0 14px 0',
  },
  barColumn: {
    display: 'flex',
    flex: 1,
    minWidth: 90,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  valueLabel: { fontSize: 12, fontWeight: 700, marginBottom: 6 },
  barTrack: {
    height: 160,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    background: '#edf1f6',
  },
  bar: { width: '100%', minHeight: 8, transition: 'height 180ms ease' },
  phaseLabel: {
    color: '#526176',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  empty: { color: '#526176', padding: '48px 0', textAlign: 'center' },
  statusPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1,
    marginTop: 12,
    border: '1px solid #d7dee8',
    background: '#d7dee8',
  },
  status: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    padding: '13px 14px',
    background: '#fff',
    fontSize: 13,
  },
  statusOk: {
    color: '#137a4b',
    background: '#dff5e8',
    padding: '3px 5px',
    fontSize: 10,
    fontWeight: 700,
  },
  statusPending: {
    color: '#6b4c09',
    background: '#fff0c2',
    padding: '3px 5px',
    fontSize: 10,
    fontWeight: 700,
  },
  rawResult: { display: 'none' },
};
