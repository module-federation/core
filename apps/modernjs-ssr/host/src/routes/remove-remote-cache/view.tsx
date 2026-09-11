import type { CSSProperties } from 'react';

import type { ProbeResult } from './probe';

const phaseName = (label: string) => {
  const names: Record<string, string> = {
    'before load': 'Before v1 load',
    'after load': 'V1 loaded',
    'before removeRemote': 'Before v1 removal',
    'after removeRemote': 'V1 removed',
    'after gc': 'Forced GC',
    'after reload': 'V2 loaded',
  };

  return names[label] || label.replace('after delayed gc ', 'GC + ');
};

export const ProbeView = ({ result }: { result: ProbeResult }) => {
  const snapshots = result.snapshots || [];
  const maxHeap = Math.max(...snapshots.map((item) => item.heapUsedMb), 1);
  const afterRemove = snapshots.find(
    (snapshot) => snapshot.label === 'after removeRemote',
  );
  const latestGc = [...snapshots]
    .reverse()
    .find((snapshot) => snapshot.label.includes('gc'));
  const heapDelta =
    afterRemove && latestGc
      ? Math.round((latestGc.heapUsedMb - afterRemove.heapUsedMb) * 100) / 100
      : undefined;
  const v1RuntimeAfterRemove = result.v1RuntimeAfterRemove;
  const v1Removed =
    Boolean(v1RuntimeAfterRemove) &&
    !v1RuntimeAfterRemove?.hostModuleCacheHasRemote &&
    v1RuntimeAfterRemove?.federationInstancesWithRemote === 0 &&
    v1RuntimeAfterRemove?.globalEntryKeysPresent.length === 0;
  const v2Loaded = result.reloadedHeavyStats?.version === 'v2';
  const clearCacheCompleted = result.clearCacheCalls.some(
    (call) => call.result === 'resolved',
  );
  const currentVersion =
    result.reloadedHeavyStats?.version ||
    result.heavyStats?.version ||
    'Pending';

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>SSR REMOTE CACHE PROBE</p>
          <h1 style={styles.title}>remote replacement lifecycle</h1>
          <p style={styles.subtitle}>
            Load remote v1, clear its runtime on the next SSR request, then load
            replacement_remote as v2.
          </p>
        </div>
        <div style={v2Loaded ? styles.badgeSuccess : styles.badgeActive}>
          {v2Loaded ? 'Replaced' : 'V1 loaded'}
        </div>
      </header>

      <nav style={styles.actions}>
        <a href="/remove-remote-cache" style={styles.actionLink}>
          1. Load remote v1
        </a>
        <a href="/remove-remote-cache?update=1" style={styles.actionDanger}>
          2. Remove v1 and load v2
        </a>
      </nav>

      <section style={styles.metricGrid}>
        <Metric
          label="Active remote"
          value={currentVersion}
          detail={
            v2Loaded
              ? 'replacement_remote is loaded'
              : 'remote is loaded from the v1 entry'
          }
          tone={v2Loaded ? 'good' : 'neutral'}
        />
        <Metric
          label="Heavy payload"
          value={`${(
            result.reloadedHeavyStats?.items ||
            result.heavyStats?.items ||
            0
          ).toLocaleString()} items`}
          detail={`Load count ${
            result.reloadedHeavyStats?.loadCount ||
            result.heavyStats?.loadCount ||
            0
          }`}
          tone="neutral"
        />
        <Metric
          label="Heap after GC"
          value={latestGc ? `${latestGc.heapUsedMb.toFixed(2)} MB` : 'Pending'}
          detail={
            heapDelta === undefined
              ? 'Run the replacement step'
              : `${heapDelta > 0 ? '+' : ''}${heapDelta.toFixed(2)} MB vs remove`
          }
          tone={heapDelta !== undefined && heapDelta <= 0 ? 'good' : 'neutral'}
        />
        <Metric
          label="Bundler clearCache"
          value={
            clearCacheCompleted
              ? 'Completed'
              : result.action === 'load remote v1'
                ? 'Awaiting update'
                : 'Not observed'
          }
          detail={`${result.clearCacheCalls.length} call${
            result.clearCacheCalls.length === 1 ? '' : 's'
          } recorded`}
          tone={clearCacheCompleted ? 'good' : 'neutral'}
        />
      </section>

      <section style={styles.chartPanel}>
        <div style={styles.panelHeading}>
          <div>
            <h2 style={styles.panelTitle}>Heap comparison</h2>
            <p style={styles.panelDescription}>
              Each bar is a server-side process snapshot taken during the remote
              replacement flow.
            </p>
          </div>
          {result.gcAvailable && <span style={styles.gcLabel}>GC enabled</span>}
        </div>
        {snapshots.length ? (
          <div style={styles.chart}>
            {snapshots.map((snapshot) => (
              <div key={snapshot.label} style={styles.barColumn}>
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
                        snapshot.label === 'after removeRemote'
                          ? '#d97706'
                          : snapshot.label.includes('gc')
                            ? '#1f8f5f'
                            : snapshot.label === 'after reload'
                              ? '#7c3aed'
                              : '#2563eb',
                    }}
                  />
                </div>
                <div style={styles.phaseLabel}>{phaseName(snapshot.label)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.empty}>Load remote v1 to create a baseline.</p>
        )}
      </section>

      <section style={styles.statusPanel}>
        <Status
          ok={v1Removed}
          label="V1 federation instance, module cache, and entry global removed"
          pending="Verified after the update request"
        />
        <Status
          ok={clearCacheCompleted}
          label="Bundler runtime clearCache completed"
          pending="Verified after the update request"
        />
        <Status
          ok={v2Loaded}
          label="Replacement remote loaded as v2"
          pending="Load replacement_remote after removal"
        />
        <Status
          ok={Boolean(
            latestGc &&
            afterRemove &&
            latestGc.heapUsedMb < afterRemove.heapUsedMb,
          )}
          label="Heap reduced after removal"
          pending="Awaiting a delayed GC snapshot"
        />
      </section>

      <pre id="remove-remote-cache-result" style={styles.rawResult}>
        {JSON.stringify(result)}
      </pre>
    </main>
  );
};

function Metric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: 'good' | 'neutral';
}): JSX.Element {
  return (
    <div style={styles.metric}>
      <p style={styles.metricLabel}>{label}</p>
      <strong
        style={{
          ...styles.metricValue,
          color: tone === 'good' ? '#137a4b' : '#172033',
        }}
      >
        {value}
      </strong>
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
    maxWidth: 1120,
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
  subtitle: { color: '#526176', fontSize: 15, lineHeight: 1.5, margin: 0 },
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
  panelDescription: { color: '#526176', margin: '5px 0 0', fontSize: 13 },
  gcLabel: { color: '#137a4b', fontSize: 12, fontWeight: 700 },
  chart: {
    display: 'flex',
    minHeight: 220,
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 20,
    overflowX: 'auto',
    borderBottom: '1px solid #aeb9c9',
    padding: '0 14px 0',
  },
  barColumn: {
    display: 'flex',
    flex: '1 0 82px',
    minWidth: 82,
    height: 220,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  valueLabel: { fontSize: 12, fontWeight: 700, marginBottom: 6 },
  barTrack: {
    height: 150,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    background: '#edf1f6',
  },
  bar: { width: '100%', minHeight: 8, transition: 'height 180ms ease' },
  phaseLabel: {
    color: '#526176',
    fontSize: 11,
    lineHeight: 1.3,
    textAlign: 'center',
    marginTop: 8,
  },
  empty: { color: '#526176', padding: '48px 0', textAlign: 'center' },
  statusPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
