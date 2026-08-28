import { normalizeHrefInRuntime } from '@rspress/core/runtime';
import { useState } from 'react';
import styles from './index.module.scss';

export interface Hero {
  name: string;
  text: string;
  accent: string;
  tagline: string;
  actions: {
    text: string;
    link: string;
    theme: 'brand' | 'alt';
  }[];
}

interface RemoteNode {
  id: string;
  label: string;
  expose: string;
  version: string;
  bundler: string;
  loadTime: string;
  state: 'loaded' | 'ready';
}

const REMOTES: RemoteNode[] = [
  {
    id: 'catalog',
    label: 'catalog',
    expose: './ProductGrid',
    version: '2.4.1',
    bundler: 'Rspack',
    loadTime: '84 ms',
    state: 'loaded',
  },
  {
    id: 'checkout',
    label: 'checkout',
    expose: './Checkout',
    version: '1.9.0',
    bundler: 'Webpack',
    loadTime: '112 ms',
    state: 'loaded',
  },
  {
    id: 'account',
    label: 'account',
    expose: './Profile',
    version: '3.2.0',
    bundler: 'Rspack',
    loadTime: 'standby',
    state: 'ready',
  },
];
const DEFAULT_REMOTE = REMOTES[0]!;

function TopologyMark({ remote = false }: { remote?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 5.5 12 2.3l5.5 3.2v6.4L12 15.1l-5.5-3.2V5.5Z" />
      <path d="m6.5 5.5 5.5 3.2 5.5-3.2M12 8.7v6.4" />
      {remote ? <path d="M9 18.2h6M12 15.2v3" /> : null}
    </svg>
  );
}

function FederationTopology() {
  const [activeId, setActiveId] = useState(DEFAULT_REMOTE.id);
  const activeRemote =
    REMOTES.find((remote) => remote.id === activeId) ?? DEFAULT_REMOTE;

  return (
    <section className={styles.topology} aria-label="Federation runtime graph">
      <div className={styles.topologyHeader}>
        <div className={styles.runtimeTitle}>
          <span className={styles.statusDot} />
          <span>runtime graph</span>
        </div>
        <div className={styles.environment}>
          <span>production</span>
          <span className={styles.environmentDivider} />
          <span>healthy</span>
        </div>
      </div>

      <div className={styles.graph}>
        <div className={styles.hostNode}>
          <div className={styles.nodeIcon}>
            <TopologyMark />
          </div>
          <span className={styles.nodeKind}>HOST</span>
          <strong>commerce-shell</strong>
          <span className={styles.nodeMeta}>react · runtime 2.0</span>
        </div>

        <div className={styles.routes} aria-hidden="true">
          {REMOTES.map((remote) => (
            <span
              key={remote.id}
              className={`${styles.route} ${
                remote.id === activeId ? styles.routeActive : ''
              }`}
            >
              <span className={styles.routePulse} />
            </span>
          ))}
        </div>

        <div className={styles.remoteList} aria-label="Connected remotes">
          {REMOTES.map((remote) => (
            <button
              key={remote.id}
              type="button"
              className={`${styles.remoteNode} ${
                remote.id === activeId ? styles.remoteNodeActive : ''
              }`}
              aria-pressed={remote.id === activeId}
              onClick={() => setActiveId(remote.id)}
            >
              <span className={styles.nodeIcon}>
                <TopologyMark remote />
              </span>
              <span className={styles.remoteIdentity}>
                <span className={styles.nodeKind}>REMOTE</span>
                <strong>{remote.label}</strong>
              </span>
              <span className={styles.remoteStatus} data-state={remote.state}>
                {remote.state}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.inspector} aria-live="polite">
        <div className={styles.inspectorTitle}>
          <span>selected remote</span>
          <strong>{activeRemote.label}</strong>
        </div>
        <dl className={styles.inspectorGrid}>
          <div>
            <dt>expose</dt>
            <dd>{activeRemote.expose}</dd>
          </div>
          <div>
            <dt>version</dt>
            <dd>{activeRemote.version}</dd>
          </div>
          <div>
            <dt>bundler</dt>
            <dd>{activeRemote.bundler}</dd>
          </div>
          <div>
            <dt>load</dt>
            <dd>{activeRemote.loadTime}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.sharedScope}>
        <span className={styles.sharedLabel}>shared scope</span>
        <code>react@19.1.1</code>
        <span>singleton</span>
        <span className={styles.sharedDivider} />
        <code>design-system@4.8.0</code>
        <span>eager</span>
      </div>
    </section>
  );
}

export function HomeHero({ hero }: { hero: Hero }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroInner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowMark} aria-hidden="true">
              MF
            </span>
            {hero.name}
          </p>
          <h1>
            <span>{hero.text}</span>
            <span className={styles.headlineAccent}>{hero.accent}</span>
          </h1>
          <p className={styles.tagline}>{hero.tagline}</p>
          <div className={styles.actions}>
            {hero.actions.map((action) => (
              <a
                key={action.link}
                className={
                  action.theme === 'brand'
                    ? styles.primaryAction
                    : styles.secondaryAction
                }
                href={normalizeHrefInRuntime(action.link)}
              >
                <span>{action.text}</span>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <FederationTopology />
      </div>
    </section>
  );
}
