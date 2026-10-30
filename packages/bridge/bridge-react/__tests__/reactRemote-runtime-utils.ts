import { ModuleFederation, helpers } from '@module-federation/enhanced/runtime';
import type { ModuleInfo } from '@module-federation/sdk';

let sequence = 0;
export function snapshotRuntime({
  module,
  render,
  isService = false,
  pureEntry = false,
  globalSnapshot = false,
  dataFetch,
}: {
  module: Record<string, unknown>;
  render?: 'component' | 'bridge';
  isService?: boolean;
  pureEntry?: boolean;
  globalSnapshot?: boolean;
  dataFetch?: () => unknown;
}) {
  const name = `react_remote_${++sequence}`;
  const snapshot = {
    version: 'selected',
    globalName: name,
    remoteEntry: 'entry.js',
    publicPath: `https://${name}.test/`,
    remoteEntryType: 'global',
    modules: [
      {
        moduleName: 'Card',
        modulePath: './Card',
        ...(render && { render }),
        isService,
        assets: { js: { sync: [], async: [] }, css: { sync: [], async: [] } },
      },
    ],
    shared: [],
    remotesInfo: {},
  } satisfies ModuleInfo;
  if (dataFetch) {
    snapshot.modules.push({
      moduleName: 'Card.data',
      modulePath: './Card.data',
      isService: false,
      assets: { js: { sync: [], async: [] }, css: { sync: [], async: [] } },
    });
  }
  const events: string[] = [];
  const factory = jest.fn(() => {
    events.push('factory');
    return module;
  });
  const get = jest.fn((expose: string) =>
    expose === './Card.data' ? () => ({ fetchData: dataFetch }) : factory,
  );
  const loadEntry = jest.fn(() => ({ init() {}, get }));
  const beforeRequest = jest.fn((args) => args);
  const loadSnapshot = jest.fn((args) => ({
    ...args,
    remoteSnapshot: globalSnapshot ? args.remoteSnapshot : snapshot,
  }));
  const afterResolve = jest.fn((args) => {
    events.push('afterResolve');
    return args;
  });
  const onLoad = jest.fn();
  const afterLoadRemote = jest.fn();
  const instance = new ModuleFederation({
    name: `${name}_host`,
    inBrowser: false,
    remotes: [
      pureEntry
        ? { name, alias: 'alias', entry: `${snapshot.publicPath}entry.js` }
        : { name, alias: 'alias', version: 'tag:current' },
    ],
    plugins: [
      {
        name: 'deployment-snapshot',
        beforeRequest,
        loadSnapshot,
        afterResolve,
        loadEntry,
        onLoad,
        afterLoadRemote,
      },
    ],
  });
  if (globalSnapshot) {
    helpers.global.addGlobalSnapshot({
      [instance.name]: {
        version: '',
        remoteEntry: '',
        remotesInfo: { [name]: { matchedVersion: 'selected' } },
      },
      [`${name}:stale`]: {
        ...snapshot,
        version: 'stale',
        modules: snapshot.modules.map((item) => ({
          ...item,
          render: 'component',
        })),
      },
      [`${name}:selected`]: snapshot,
    });
  }
  return {
    instance,
    name,
    snapshot,
    factory,
    get,
    loadEntry,
    beforeRequest,
    loadSnapshot,
    afterResolve,
    onLoad,
    afterLoadRemote,
    events,
  };
}
