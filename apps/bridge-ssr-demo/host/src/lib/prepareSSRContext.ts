import { getInstance } from '@module-federation/runtime';
import { renderRemoteBridge } from '@module-federation/bridge-shared';
import type { HostSSRContext } from './ssrContext';
import { normalizeBridgeRequestUrl } from './normalizeRequestUrl.mjs';
import { VUE_REMOTE_BASENAME, VUE_REMOTE_MODULE } from './remoteRoutes';

export type PrepareSSRContextOptions = { signal?: AbortSignal };

export async function prepareSSRContext(
  url: string,
  options: PrepareSSRContextOptions = {},
): Promise<HostSSRContext> {
  const requestUrl = normalizeBridgeRequestUrl(url);
  const pathname = new URL(requestUrl, 'http://bridge-ssr.local').pathname;
  const context: HostSSRContext = { url: requestUrl };
  if (!pathname.startsWith(VUE_REMOTE_BASENAME)) return context;

  const instance = getInstance();
  if (!instance)
    throw new Error('Module Federation runtime is not initialized');
  const request = new Request(`http://bridge-ssr.local${requestUrl}`, {
    signal: options.signal,
  });
  context.vueRemote = await renderRemoteBridge({
    loader: () =>
      instance.loadRemote<Record<string, unknown>>(
        `${VUE_REMOTE_MODULE}/export-app`,
      ),
    moduleName: VUE_REMOTE_MODULE,
    instanceId: 'vue-primary',
    request,
    props: { basename: VUE_REMOTE_BASENAME, test: 'vue-ssr' },
  });
  return context;
}
