import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

const STORAGE_KEY = 'i18nextLng';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (i18n.language || 'zh-CN').startsWith('en') ? 'en' : 'zh-CN';

  const handleChange = (lng: 'zh-CN' | 'en') => (event: MouseEvent) => {
    event.preventDefault();
    if (lng === current) return;
    void i18n.changeLanguage(lng);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, lng);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/60 px-1 py-0.5 text-[11px] shadow-sm backdrop-blur-md dark:bg-slate-900/70">
      <button
        type="button"
        onClick={handleChange('zh-CN')}
        className={cn(
          'rounded-full px-2 py-0.5 transition-colors',
          current === 'zh-CN'
            ? 'bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900'
            : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/70',
        )}
      >
        {t('lang.zh')}
      </button>
      <span className="text-slate-400 dark:text-slate-500">/</span>
      <button
        type="button"
        onClick={handleChange('en')}
        className={cn(
          'rounded-full px-2 py-0.5 transition-colors',
          current === 'en'
            ? 'bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900'
            : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/70',
        )}
      >
        {t('lang.en')}
      </button>
    </div>
  );
}
