import styles from './index.module.scss';

export interface Feature {
  icon: 'boundaries' | 'types' | 'runtime' | 'debug';
  title: string;
  details: string;
}

export interface FeatureIntro {
  eyebrow: string;
  title: string;
  details: string;
}

function FeatureIcon({ icon }: { icon: Feature['icon'] }) {
  if (icon === 'boundaries') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect x="4" y="8" width="9" height="16" rx="2" />
        <rect x="19" y="8" width="9" height="16" rx="2" />
        <path d="M13 12h6M13 20h6" />
      </svg>
    );
  }

  if (icon === 'types') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="m12 7-7 9 7 9M20 7l7 9-7 9M18 4l-4 24" />
      </svg>
    );
  }

  if (icon === 'runtime') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="11" />
        <path d="M16 9v7l5 3M16 2v3M16 27v3M2 16h3M27 16h3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M5 22V10l11-6 11 6v12l-11 6-11-6Z" />
      <path d="m5 10 11 6 11-6M16 16v12" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

export function HomeFeature({
  features,
  intro,
}: {
  features: Feature[];
  intro: FeatureIntro;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.introEyebrow}>{intro.eyebrow}</p>
          <h2>{intro.title}</h2>
          <p className={styles.introDetails}>{intro.details}</p>
        </div>

        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              <div className={styles.icon}>
                <FeatureIcon icon={feature.icon} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.details}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
