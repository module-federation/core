import {
  InitContainerEntryOptions,
  WebpackRequire,
  ShareScopeMap,
} from './types';

export function initContainerEntry(
  options: InitContainerEntryOptions,
): WebpackRequire['I'] | void {
  const { webpackRequire, shareScope, initScope, shareScopeKey } = options;
  if (!webpackRequire.S) return;
  if (
    !webpackRequire.federation ||
    !webpackRequire.federation.instance ||
    !webpackRequire.federation.initOptions
  )
    return;
  var name = shareScopeKey || 'default';
  webpackRequire.federation.instance.initOptions({
    name: webpackRequire.federation.initOptions.name,
    remotes: [],
  });
  webpackRequire.federation.instance.initShareScopeMap(name, shareScope);
  const prevShareScope = webpackRequire.g.__FEDERATION__.__SHARE__['default'];
  if (prevShareScope) {
    webpackRequire.federation.instance.initShareScopeMap(
      name,
      prevShareScope as unknown as ShareScopeMap[string],
    );
  }
  webpackRequire.S[name] = shareScope;
  if (webpackRequire.federation.attachShareScopeMap) {
    webpackRequire.federation.attachShareScopeMap(webpackRequire);
  }

  // @ts-ignore
  return webpackRequire.I(name, initScope);
}
