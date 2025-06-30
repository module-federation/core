import { createRemoteComponent } from './createRemoteComponent';
import type { CreateRemoteComponentOptions } from './createRemoteComponent';

export function wrapNoSSR<T, E extends keyof T>(
  createComponentFn: typeof createRemoteComponent<T, E>,
) {
  return (options: Omit<CreateRemoteComponentOptions<T, E>, 'noSSR'>) => {
    return createComponentFn({ ...options, noSSR: true });
  };
}
