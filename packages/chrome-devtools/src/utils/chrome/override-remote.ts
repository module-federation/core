const basicProxyCore = (
  require('../../vendor/basic-proxy-core.js') as {
    default: {
      registerOverridePlugin(globalObject?: typeof globalThis): unknown;
    };
  }
).default;

basicProxyCore.registerOverridePlugin(globalThis);

export {};
