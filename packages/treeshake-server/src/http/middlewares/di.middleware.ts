import type { MiddlewareHandler } from 'hono';
import type { AdapterDeps } from '@/adapters/createAdapterDeps';
import type { AppEnv } from '@/http/env';

export function createDiMiddleware(
  deps: AdapterDeps,
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    c.set('objectStore', deps.objectStore);
    if (deps.projectPublisher) {
      c.set('projectPublisher', deps.projectPublisher);
    }
    await next();
  };
}
