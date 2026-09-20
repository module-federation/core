export interface BasicProxyCore {
  registerOverridePlugin(globalObject?: typeof globalThis): unknown;
}

export const resolveBasicProxyCore = (
  basicProxyCoreModule: BasicProxyCore | { default: BasicProxyCore },
): BasicProxyCore =>
  'default' in basicProxyCoreModule
    ? basicProxyCoreModule.default
    : basicProxyCoreModule;
