const basicProxyCore = require('../../vendor/basic-proxy-core.js') as {
  registerSnapshotPlugin(globalObject?: typeof globalThis): unknown;
};

basicProxyCore.registerSnapshotPlugin(globalThis);

export {};
