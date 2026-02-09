import { useEffect, useState, lazy, Suspense } from 'react';
import './App.css';

import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
// i18n and confetti no longer used in App after route split

import { Button } from '@/components/ui/button';

import { Switch } from '@/components/ui/switch';

import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

import { Moon, Sparkles, Sun } from 'lucide-react';

import { LanguageSwitcher } from '@/components/custom/LanguageSwitcher';

const HomePage = lazy(() => import('@/pages/Home'));
const AnalyzePage = lazy(() => import('@/pages/Analyze'));

const STORAGE_KEY_THEME = 'tree-shaking-theme';

type ThemeMode = 'light' | 'dark';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY_THEME);
  if (stored === 'light' || stored === 'dark') return stored;
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

function App() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [mockMode, setMockMode] = useState(false);
  const [showMockToggle, setShowMockToggle] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShowMockToggle(!!window.localStorage.getItem('treeshake_mock_mode'));
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  return (
    <div
      className={cn(
        'min-h-screen text-slate-900 transition-colors duration-500 dark:text-slate-50',
        location.pathname === '/analyze'
          ? 'bg-gradient-to-b from-sky-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
          : 'bg-white dark:bg-slate-950',
      )}
    >
      {location.pathname === '/analyze' && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-br from-sky-400/25 via-fuchsia-500/15 to-emerald-400/25 blur-3xl opacity-80" />
          <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-1/3 bg-gradient-to-tl from-sky-500/10 via-transparent to-emerald-500/10 blur-3xl" />
        </>
      )}

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-8 pt-6 md:px-8 md:pb-12 md:pt-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-fuchsia-500 text-white shadow-lg shadow-sky-500/40">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">
                {t('common.appName')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('common.appSubtitle')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {showMockToggle && (
              <div className="flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs shadow-sm backdrop-blur-md dark:bg-slate-900/70">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('common.mockModeLabel')}
                </span>
                <Switch
                  checked={mockMode}
                  onCheckedChange={(checked) => setMockMode(Boolean(checked))}
                />
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {mockMode
                    ? t('common.mockModeLocal')
                    : t('common.mockModeRemote')}
                </span>
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('common.themeToggleAria')}
              className="h-9 w-9 rounded-full border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-900"
              onClick={() =>
                setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
              }
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-slate-700" />
              ) : (
                <Sun className="h-4 w-4 text-amber-300" />
              )}
            </Button>
          </div>
        </header>

        <main className="mt-8 flex flex-1 flex-col gap-8 md:mt-10">
          {location.pathname === '/analyze' ? (
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <AnalyzePage mockMode={mockMode} />
            </Suspense>
          ) : location.pathname === '/' ? (
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <HomePage />
            </Suspense>
          ) : null}
        </main>

        <footer className="mt-8 border-t border-slate-200/80 pt-4 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          <div className="flex justify-center text-center">
            <span className="text-slate-400">{t('footer.jsSafety')}</span>
          </div>
        </footer>
      </div>

      <Toaster />
    </div>
  );
}

export default App;
