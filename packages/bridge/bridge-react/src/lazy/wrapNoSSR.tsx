import { createLazyComponent } from './createLazyComponent';
import type { CreateLazyComponentOptions } from './createLazyComponent';

export function wrapNoSSR<T, E extends keyof T>(
  createLazyComponentFn: typeof createLazyComponent<T, E>,
) {
  return (options: Omit<CreateLazyComponentOptions<T, E>, 'noSSR'>) => {
    return createLazyComponentFn({ ...options, noSSR: true });
  };
}
