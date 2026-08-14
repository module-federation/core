import {
  BasicProxyCore,
  resolveBasicProxyCore,
} from './resolve-basic-proxy-core';

const basicProxyCore = resolveBasicProxyCore(
  require('../../vendor/basic-proxy-core.js') as
    | BasicProxyCore
    | { default: BasicProxyCore },
);

basicProxyCore.registerOverridePlugin(globalThis);

export {};
