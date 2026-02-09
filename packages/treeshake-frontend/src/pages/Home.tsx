import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

function HomeHero() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    let frame: number;
    let startTime: number | null = null;

    const step = (now: number) => {
      if (startTime == null) startTime = now;
      const elapsed = now - startTime;
      const next = Math.min(elapsed / 5000, 1);
      setProgress(next);
      if (next < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--hero-px', x.toFixed(3));
    el.style.setProperty('--hero-py', y.toFixed(3));
  };

  const handleMouseLeave = () => {
    const el = heroRef.current;
    if (!el) return;
    el.style.setProperty('--hero-px', '0');
    el.style.setProperty('--hero-py', '0');
  };

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const phase = (t: number, start: number, end: number) => {
    if (t <= start) return 0;
    if (t >= end) return 1;
    const normalized = (t - start) / (end - start);
    return easeOutCubic(normalized);
  };

  const fullSizeTarget = 120;
  const treeshakeSizeTarget = 42;
  const fullTimeTarget = 950;
  const treeshakeTimeTarget = 360;
  const fullModulesTarget = 40;
  const treeshakeModulesTarget = 14;

  const fullSizePhase = phase(progress, 0.05, 0.55);
  const treeshakeSizePhase = phase(progress, 0.22, 0.82);
  const fullTimePhase = phase(progress, 0.12, 0.7);
  const treeshakeTimePhase = phase(progress, 0.32, 0.9);
  const savingsPhase = phase(progress, 0.4, 1);
  const modulesPhase = phase(progress, 0.2, 0.8);

  const fullSizeDemo = Math.round(fullSizeTarget * fullSizePhase);
  const treeshakeSizeDemo = Math.round(
    treeshakeSizeTarget * treeshakeSizePhase,
  );
  const savedSizeDemo = Math.max(fullSizeDemo - treeshakeSizeDemo, 0);
  const savedPercentStatic =
    ((fullSizeTarget - treeshakeSizeTarget) / fullSizeTarget) * 100;
  const savedPercentDemo = Math.max(
    0,
    Math.round(savedPercentStatic * savingsPhase),
  );

  const fullTimeDemo = Math.round(fullTimeTarget * fullTimePhase);
  const treeshakeTimeDemo = Math.round(
    treeshakeTimeTarget * treeshakeTimePhase,
  );

  const fullModulesDemo = Math.round(fullModulesTarget * modulesPhase);
  const treeshakeModulesDemo = Math.round(
    treeshakeModulesTarget * modulesPhase,
  );

  const shimmerActive = progress > 0.2 && progress < 1;

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-1 flex-col justify-center py-10 md:py-16"
    >
      <div className="relative z-10 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
        <div className="space-y-6">
          <Badge className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-50 shadow-lg shadow-sky-500/40 dark:bg-slate-100 dark:text-slate-900">
            <Zap className="h-3 w-3" />
            {t('home.badge')}
          </Badge>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            {t('home.titlePrefix')}
            <span className="mx-1 bg-gradient-to-r from-sky-400 via-fuchsia-500 to-emerald-400 bg-clip-text text-transparent">
              {t('home.titleHighlight')}
            </span>
            {t('home.titleSuffix')}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {t('home.subtitle')}
          </p>
        </div>

        <div className="relative">
          <div className="hero-glass-panel p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div
                  className={cn(
                    'hero-metric-pill relative flex items-center justify-between rounded-full bg-slate-900/95 px-3 py-2 text-xs text-slate-100 shadow-md',
                    shimmerActive && 'hero-metric-pill--active',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-[11px] text-rose-200">
                      F
                    </span>
                    {t('results.cardFullTitle')}
                  </span>
                  <span className="font-semibold">
                    {fullSizeDemo} KB · ~{fullTimeDemo} ms
                  </span>
                </div>
                <div
                  className={cn(
                    'hero-metric-pill relative flex items-center justify-between rounded-full bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-100 shadow-md shadow-emerald-500/30 backdrop-blur',
                    shimmerActive && 'hero-metric-pill--active',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30 text-[11px] text-emerald-800 dark:text-emerald-50">
                      T
                    </span>
                    {t('results.cardTreeshakeTitle')}
                  </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-100">
                    {treeshakeSizeDemo} KB · ~{treeshakeTimeDemo} ms
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-[11px] text-slate-300">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-200">{t('home.savedSize')}</span>
                  <span className="text-sm font-semibold text-fuchsia-200">
                    {savedSizeDemo} KB
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-slate-800/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-sky-400 to-emerald-400"
                    style={{
                      width: `${Math.min(savedPercentDemo, 100)}%`,
                      transition: 'width 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />
                  <div
                    className={cn(
                      'hero-bar-shimmer',
                      shimmerActive && 'hero-bar-shimmer--active',
                    )}
                  />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-400">
                    {t('home.savedPercent')}
                  </span>
                  <span className="text-sm font-semibold text-fuchsia-300">
                    {savedPercentDemo > 0 ? `${savedPercentDemo}%` : '--'}
                  </span>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-2 py-1">
                    <span>{t('home.moduleCount')}</span>
                    <span className="font-mono text-xs text-slate-100">
                      {fullModulesDemo} → {treeshakeModulesDemo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-2 py-1">
                    <span>{t('home.simulatedLoad')}</span>
                    <span className="font-mono text-xs text-emerald-200">
                      ~{fullTimeTarget} ms → ~{treeshakeTimeTarget} ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-slate-400">
              {t('home.demoNote')}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-10 flex justify-center">
        <Button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 via-fuchsia-500 to-emerald-500 px-8 py-2.5 text-sm font-medium text-white shadow-xl shadow-sky-500/40 transition-transform hover:translate-y-0.5 hover:shadow-2xl"
          onClick={() => navigate('/analyze')}
        >
          <Zap className="h-4 w-4" />
          {t('common.tryNow')}
        </Button>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="relative z-10 flex flex-1 flex-col">
      <HomeHero />
    </div>
  );
}
