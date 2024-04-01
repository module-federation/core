import { WebpackRequire } from './types';

export function attachShareScopeMap(webpackRequire: WebpackRequire) {
  if (
    !webpackRequire.S ||
    webpackRequire.federation.hasAttachShareScopeMap ||
    !webpackRequire.federation.instance ||
    !webpackRequire.federation.instance.shareScopeMap
  ) {
    return;
  }

  webpackRequire.S = webpackRequire.federation.instance.shareScopeMap;

  webpackRequire.federation.hasAttachShareScopeMap = true;
}
