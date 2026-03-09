import { useEffect, useState } from 'react';

export type DevtoolsTheme = 'light' | 'dark';

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

function resolveThemeFromDevtools(): DevtoolsTheme | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const devtools = (window as any).chrome?.devtools;
  const themeName: string | undefined = devtools?.panels?.themeName;

  if (typeof themeName === 'string') {
    return themeName.toLowerCase().includes('dark') ? 'dark' : 'light';
  }

  return null;
}

function resolveThemeFromMedia(): DevtoolsTheme | null {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return null;
  }

  return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
}

function getInitialTheme(): DevtoolsTheme {
  return resolveThemeFromDevtools() ?? resolveThemeFromMedia() ?? 'light';
}

export const useDevtoolsTheme = (): DevtoolsTheme => {
  const [theme, setTheme] = useState<DevtoolsTheme>(() => getInitialTheme());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const devtools = (window as any).chrome?.devtools;
    const panels = devtools?.panels;
    const onThemeChanged = panels?.onThemeChanged;

    const handleThemeChange = (newThemeName: string) => {
      if (typeof newThemeName !== 'string') {
        return;
      }
      const next: DevtoolsTheme = newThemeName.toLowerCase().includes('dark')
        ? 'dark'
        : 'light';
      setTheme(next);
    };

    const fromDevtools = resolveThemeFromDevtools();
    if (fromDevtools) {
      setTheme(fromDevtools);
    }

    let mediaQuery: MediaQueryList | null = null;
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'dark' : 'light');
    };

    if (onThemeChanged && typeof onThemeChanged.addListener === 'function') {
      onThemeChanged.addListener(handleThemeChange);
    } else if (typeof window.matchMedia === 'function') {
      mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleMediaQueryChange);
      } else if (typeof (mediaQuery as any).addListener === 'function') {
        (mediaQuery as any).addListener(handleMediaQueryChange);
      }
    }

    return () => {
      if (
        onThemeChanged &&
        typeof onThemeChanged.removeListener === 'function'
      ) {
        onThemeChanged.removeListener(handleThemeChange);
      }
      if (mediaQuery) {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', handleMediaQueryChange);
        } else if (typeof (mediaQuery as any).removeListener === 'function') {
          (mediaQuery as any).removeListener(handleMediaQueryChange);
        }
      }
    };
  }, []);

  return theme;
};
