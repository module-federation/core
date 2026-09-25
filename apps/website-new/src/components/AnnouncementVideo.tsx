import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../theme/i18n';
import styles from './AnnouncementVideo.module.scss';

export default function AnnouncementVideo(props: {
  customWidthScale?: number;
}) {
  const t = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<{ destroy: () => void } | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const widthScale = 1 - (props.customWidthScale ?? 0.3);
  const videoUrl = t('announcementVideo');
  const posterUrl = t('announcementVideoPoster');

  const loadPlayer = useCallback(() => {
    setShouldLoad(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || shouldLoad) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad) {
      return;
    }

    let cancelled = false;

    void Promise.all([
      import('xgplayer'),
      import('xgplayer/dist/index.min.css'),
    ]).then(([{ default: Player }]) => {
      if (cancelled || !containerRef.current) {
        return;
      }

      playerRef.current = new Player({
        el: containerRef.current,
        url: videoUrl,
        height: '100%',
        width: '100%',
        poster: posterUrl,
      });
      setIsReady(true);
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [posterUrl, shouldLoad, videoUrl]);

  return (
    <div
      className={`${styles.videoFrame} mx-auto`}
      style={{
        width: `${widthScale * 100}vw`,
      }}
    >
      <div ref={containerRef} className={styles.player} />
      {!isReady && (
        <button
          aria-label="Play announcement video"
          className={styles.posterButton}
          onClick={loadPlayer}
          type="button"
        >
          <img alt="" className={styles.poster} src={posterUrl} />
          <span aria-hidden="true" className={styles.playIcon} />
        </button>
      )}
    </div>
  );
}
