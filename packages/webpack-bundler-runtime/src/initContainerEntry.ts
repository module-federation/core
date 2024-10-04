import { InitContainerEntryOptions, WebpackRequire } from './types';

export function initContainerEntry(
  options: InitContainerEntryOptions,
): WebpackRequire['I'] | void {
  const {
    webpackRequire,
    shareScope,
    initScope,
    shareScopeKey,
    remoteEntryInitOptions,
  } = options;
  if (!webpackRequire.S) return;
  if (
    !webpackRequire.federation ||
    !webpackRequire.federation.instance ||
    !webpackRequire.federation.initOptions
  )
    return;

  const federationInstance = webpackRequire.federation.instance;
  var name = shareScopeKey || 'default';
  federationInstance.initOptions({
    name: webpackRequire.federation.initOptions.name,
    remotes: [],
    ...remoteEntryInitOptions,
  });

  federationInstance.initShareScopeMap(name, shareScope, {
    hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
  });

  if (webpackRequire.federation.attachShareScopeMap) {
    webpackRequire.federation.attachShareScopeMap(webpackRequire);
  }
  if (typeof webpackRequire.federation.prefetch === 'function') {
    webpackRequire.federation.prefetch();
  }
  // @ts-ignore
  return webpackRequire.I(name, initScope);
}
