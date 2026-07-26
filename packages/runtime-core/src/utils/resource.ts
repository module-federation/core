import type { ModuleFederation } from '../core';
import type {
  RemoteInfo,
  ResourceLoadCacheSource,
  ResourceLoadContext,
  ResourceLoadEvent,
  ResourceLoadOutcome,
  ResourceLoadResult,
} from '../type';

export interface ResourceLoadAttempt {
  event: ResourceLoadEvent;
  finish(
    outcome: ResourceLoadOutcome,
    details?: {
      response?: Response;
      httpStatus?: number;
      mimeType?: string;
      redirected?: boolean;
      cacheSource?: ResourceLoadCacheSource;
      error?: unknown;
    },
  ): Promise<ResourceLoadResult>;
}

export async function startResourceLoad(
  origin: ModuleFederation,
  options: {
    context: ResourceLoadContext;
    url: string;
    remoteInfo?: RemoteInfo;
    expose?: string;
  },
): Promise<ResourceLoadAttempt> {
  const event: ResourceLoadEvent = {
    ...options.context,
    url: options.url,
    remote: options.remoteInfo,
    expose: options.expose || options.context.expose,
  };
  await origin.loaderHook.lifecycle.beforeLoadResource.emit(event);

  let result: ResourceLoadResult | undefined;
  return {
    event,
    async finish(outcome, details = {}) {
      if (!result) {
        result = {
          ...event,
          ...details,
          outcome,
        };
        await origin.loaderHook.lifecycle.afterLoadResource.emit(result);
      }
      return result;
    },
  };
}

export async function emitCachedResourceLoad(
  origin: ModuleFederation,
  options: {
    context: ResourceLoadContext;
    url: string;
    remoteInfo?: RemoteInfo;
    expose?: string;
    cacheSource: ResourceLoadCacheSource;
  },
): Promise<ResourceLoadResult> {
  const attempt = await startResourceLoad(origin, options);
  return attempt.finish('cached', {
    cacheSource: options.cacheSource,
  });
}
