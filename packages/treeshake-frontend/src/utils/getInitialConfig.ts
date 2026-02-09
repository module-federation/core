import type { BuildConfigState } from '@/components/analyze/AnalyzeForm';
import { STORAGE_KEY_CONFIG } from '@/constant';

export function getInitialConfig(): BuildConfigState {
  const base: BuildConfigState = {
    target: 'web,\nbrowserslist:> 0.01%,not dead,not op_mini all',
    plugins: '',
    shared: '',
  };

  if (typeof window === 'undefined') return base;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!stored) return base;
    const parsed = JSON.parse(stored) as Partial<BuildConfigState>;
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}
