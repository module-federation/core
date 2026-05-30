const basicProxyCore = require('../../vendor/basic-proxy-core.js') as {
  registerOverridePlugin(globalObject?: typeof globalThis): unknown;
};

basicProxyCore.registerOverridePlugin(globalThis);

export {};
