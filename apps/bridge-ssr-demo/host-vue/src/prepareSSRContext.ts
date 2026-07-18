import { getInstance } from '@module-federation/runtime';
import { renderRemoteBridge } from '@module-federation/bridge-shared';
import { normalizeBridgeRequestUrl } from '../../host/src/lib/normalizeRequestUrl.mjs';
import type { HostSSRContext } from './ssrContext';

export type PrepareSSRContextOptions = { signal?: AbortSignal };

export async function prepareSSRContext(
  url: string,
  options: PrepareSSRContextOptions = {},
): Promise<HostSSRContext> {
  const requestUrl = normalizeBridgeRequestUrl(url);
  const parsed = new URL(requestUrl, 'http://bridge-ssr.local');
  const context: HostSSRContext = { url: requestUrl };
  const instance = getInstance();
  if (!instance)
    throw new Error('Module Federation runtime is not initialized');
  const request = new Request(parsed, { signal: options.signal });

  const renderReact = (
    instanceId: string,
    basename: string,
    name: string,
    age: number,
  ) =>
    renderRemoteBridge({
      loader: () =>
        instance.loadRemote<Record<string, unknown>>(
          'bridge_ssr_react/export-app',
        ),
      moduleName: 'bridge_ssr_react',
      instanceId,
      request,
      props: { basename, name, age },
    });

  if (parsed.pathname.startsWith('/react-pair')) {
    context.reactPair = await Promise.all([
      renderReact('react-pair-left', '/react-pair', 'Left', 1),
      renderReact('react-pair-right', '/react-pair', 'Right', 2),
    ]);
  } else if (parsed.pathname.startsWith('/react-remote')) {
    context.reactRemote = await renderReact(
      'react-primary',
      '/react-remote',
      'Ming',
      12,
    );
  }
  return context;
}
