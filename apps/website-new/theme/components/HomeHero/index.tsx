import { normalizeHrefInRuntime } from '@rspress/core/runtime';
import { AsteroidField } from './AsteroidField';
import { ElasticGrid, FluidGalaxy } from './FluidGalaxy';
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

export function HomeHero({ hero }: { hero: Hero }) {
  return (
    <section className={styles.hero} data-galaxy-surface>
      <div
        className={styles.paintedBackdrop}
        style={{ backgroundImage: "url('/home-galaxy-oil-v2.jpg')" }}
        aria-hidden="true"
      />
      <div className={styles.fluidGalaxy} aria-hidden="true">
        <FluidGalaxy imageUrl="/home-galaxy-oil-v2.jpg" />
      </div>
      <div className={styles.elasticGrid} aria-hidden="true">
        <ElasticGrid />
      </div>
      <div className={styles.heroShade} aria-hidden="true" />
      <div className={styles.asteroidField} aria-hidden="true">
        <AsteroidField />
      </div>

      <div className={styles.heroInner}>
        <div className={styles.copy} data-hero-copy>
          <p className={styles.eyebrow}>
            <span className={styles.statusDot} aria-hidden="true" />
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
      </div>
    </section>
  );
}
