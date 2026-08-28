import { normalizeHrefInRuntime } from '@rspress/core/runtime';
import { useState } from 'react';
import styles from './index.module.scss';

export interface Hero {
  name: string;
  text: string;
  accent: string;
  tagline: string;
  terminal: {
    install: string;
    trace: string;
    connected: string;
    ready: string;
  };
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
  bundler: string;
  loadTime: string;
  state: 'loaded' | 'ready';
}

const REMOTES: RemoteNode[] = [
  {
    id: 'catalog',
    label: 'catalog',
    expose: './ProductGrid',
    bundler: 'Rspack',
    loadTime: '84 ms',
    state: 'loaded',
  },
  {
    id: 'checkout',
    label: 'checkout',
    expose: './Checkout',
    bundler: 'Webpack',
    loadTime: '112 ms',
    state: 'loaded',
  },
  {
    id: 'account',
    label: 'account',
    expose: './Profile',
    bundler: 'Rspack',
    loadTime: 'standby',
    state: 'ready',
  },
];

const DEFAULT_REMOTE = REMOTES[0]!;

function FederationScene() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.sceneGrid} />
      <svg
        className={styles.sceneCanvas}
        viewBox="0 0 1440 820"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="mf-flow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b7cff" stopOpacity="0" />
            <stop offset="0.46" stopColor="#55bfff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#b9dcff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="mf-core">
            <stop offset="0" stopColor="#b9dcff" stopOpacity="0.82" />
            <stop offset="0.24" stopColor="#55bfff" stopOpacity="0.38" />
            <stop offset="1" stopColor="#153a66" stopOpacity="0" />
          </radialGradient>
          <filter
            id="mf-blur-strong"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur stdDeviation="34" />
          </filter>
          <filter
            id="mf-blur-soft"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <g className={styles.flowFields}>
          <path
            className={styles.flowFieldStrong}
            d="M-120 118C172 34 268 294 478 250c190-40 238-242 438-168 148 54 206 254 454 150 94-39 138-114 188-180"
          />
          <path d="M-88 620c256-172 394 18 570-90 146-90 198-292 400-244 208 50 240 312 642 194" />
          <path d="M208-80c-30 234 170 270 210 454 43 197-128 248-4 490" />
        </g>

        <circle cx="920" cy="382" r="248" fill="url(#mf-core)" />
        <circle className={styles.coreOrbit} cx="920" cy="382" r="152" />
        <circle
          className={styles.coreOrbitSecondary}
          cx="920"
          cy="382"
          r="214"
        />

        <g className={styles.sceneRoutes}>
          <path d="M920 382C840 296 756 234 666 184" />
          <path d="M920 382c116-80 210-120 326-142" />
          <path d="M920 382c148 22 236 84 326 182" />
          <path d="M920 382C814 500 760 590 704 704" />
        </g>

        <g className={styles.sceneNodes}>
          <g transform="translate(920 382)">
            <circle className={styles.hostHalo} r="43" />
            <circle className={styles.hostNode} r="8" />
            <circle className={styles.hostCore} r="3" />
          </g>
          <g transform="translate(666 184)">
            <circle className={styles.remoteHalo} r="22" />
            <circle className={styles.remoteNode} r="5" />
          </g>
          <g transform="translate(1246 240)">
            <circle className={styles.remoteHalo} r="22" />
            <circle className={styles.remoteNode} r="5" />
          </g>
          <g transform="translate(1246 564)">
            <circle className={styles.remoteHalo} r="22" />
            <circle className={styles.remoteNode} r="5" />
          </g>
          <g transform="translate(704 704)">
            <circle className={styles.remoteHalo} r="22" />
            <circle className={styles.remoteNode} r="5" />
          </g>
        </g>

        <g className={styles.dataParticles}>
          <circle cx="802" cy="282" r="2" />
          <circle cx="1094" cy="301" r="2" />
          <circle cx="1108" cy="476" r="2" />
          <circle cx="814" cy="544" r="2" />
        </g>
      </svg>
      <div className={styles.sceneShade} />
    </div>
  );
}

function InstallPanel({ hero }: { hero: Hero }) {
  return (
    <div className={styles.installPanel}>
      <div className={styles.commandLine}>
        <span>$</span>
        <code>pnpm add @module-federation/enhanced</code>
      </div>
      <div className={styles.installStatus}>
        <div>
          <span className={styles.successMark}>✓</span>
          <span>{hero.terminal.ready}</span>
        </div>
        <div>
          <span className={styles.branchMark}>↳</span>
          <span>commerce-shell</span>
          <code>host</code>
        </div>
        <div>
          <span className={styles.branchMark}>↳</span>
          <span>{hero.terminal.connected}</span>
          <code>healthy</code>
        </div>
      </div>
    </div>
  );
}

function TracePanel() {
  const [activeId, setActiveId] = useState(DEFAULT_REMOTE.id);
  const activeRemote =
    REMOTES.find((remote) => remote.id === activeId) ?? DEFAULT_REMOTE;

  return (
    <div className={styles.tracePanel}>
      <div className={styles.remoteList} aria-label="Connected remotes">
        {REMOTES.map((remote) => (
          <button
            key={remote.id}
            type="button"
            aria-pressed={remote.id === activeId}
            className={remote.id === activeId ? styles.remoteActive : ''}
            onClick={() => setActiveId(remote.id)}
          >
            <span className={styles.remoteSignal} data-state={remote.state} />
            <span>{remote.label}</span>
            <small>{remote.state}</small>
          </button>
        ))}
      </div>
      <dl className={styles.remoteDetails} aria-live="polite">
        <div>
          <dt>remote</dt>
          <dd>{activeRemote.label}</dd>
        </div>
        <div>
          <dt>expose</dt>
          <dd>{activeRemote.expose}</dd>
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
  );
}

function RuntimeConsole({ hero }: { hero: Hero }) {
  const [activeTab, setActiveTab] = useState<'install' | 'trace'>('install');

  return (
    <section className={styles.console} aria-label="Module Federation console">
      <div className={styles.consoleTabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'install'}
          onClick={() => setActiveTab('install')}
        >
          {hero.terminal.install}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'trace'}
          onClick={() => setActiveTab('trace')}
        >
          {hero.terminal.trace}
        </button>
      </div>
      <div className={styles.consoleWindow} role="tabpanel">
        <div className={styles.consoleHeader}>
          <div className={styles.windowDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span>federation.runtime</span>
          <span className={styles.consoleLive}>live</span>
        </div>
        {activeTab === 'install' ? (
          <InstallPanel hero={hero} />
        ) : (
          <TracePanel />
        )}
      </div>
    </section>
  );
}

export function HomeHero({ hero }: { hero: Hero }) {
  return (
    <section className={styles.hero}>
      <FederationScene />
      <div className={styles.heroInner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.statusDot} aria-hidden="true" />
            {hero.name}
            <span className={styles.previewTag}>runtime</span>
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
          <p className={styles.capabilities}>
            <span>typed remotes</span>
            <span>runtime manifests</span>
            <span>independent deploys</span>
          </p>
        </div>

        <RuntimeConsole hero={hero} />
      </div>
    </section>
  );
}
