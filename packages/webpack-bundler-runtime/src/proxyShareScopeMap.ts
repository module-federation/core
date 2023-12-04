import { WebpackRequire } from './types';

export function proxyShareScopeMap(webpackRequire: WebpackRequire,) {
  if (!webpackRequire.S || webpackRequire.federation.hasProxyShareScopeMap || !webpackRequire.federation.initOptions ) {
    return;
  }

  if(!webpackRequire.g["__FEDERATION__"].__SHARE__[webpackRequire.federation.initOptions.name]){
    return;
  }

  webpackRequire.S = webpackRequire.g['__FEDERATION__'].__SHARE__[webpackRequire.federation.initOptions.name]

  webpackRequire.federation.hasProxyShareScopeMap = true
}
