import { isBrowserEnvValue, loadScript } from '@module-federation/sdk/core';
import { loadScriptNode } from '@module-federation/sdk/node';
import { loadEntryDom } from './web';
import { loadEntryNode } from './node';

declare const ENV_TARGET: 'web' | 'node';

const isWeb = () =>
  typeof ENV_TARGET !== 'undefined' ? ENV_TARGET === 'web' : isBrowserEnvValue;

export const universal = {
  kind: 'platform' as const,
  name: 'universal' as const,
  isBrowser: isWeb,
  loadEntry: (ctx: any) => (isWeb() ? loadEntryDom(ctx) : loadEntryNode(ctx)),
  loadScript: (url: string, info: any) =>
    isWeb() ? loadScript(url, info) : loadScriptNode(url, info),
};
