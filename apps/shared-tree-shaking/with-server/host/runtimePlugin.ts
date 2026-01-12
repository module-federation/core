import { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

export default function (): ModuleFederationRuntimePlugin {
  let mfInstance;
  return {
    name: 'dispatch-snapshot',
    apply(instance) {
      mfInstance = instance;
      __FEDERATION__.moduleInfo = {
        mf_host: {
          version: '',
          remoteEntry: '',
          remotesInfo: {
            provider: {
              matchedVersion: 'http://localhost:3002/mf-manifest.json',
            },
          },
          shared: [
            {
              assets: {
                js: {
                  async: [],
                  sync: [],
                },
                css: {
                  async: [],
                  sync: [],
                },
              },
              sharedName: 'antd',
              version: '6.0.1',
              reShakeShareEntry:
                'http://localhost:3003/independent-packages/antd/6.0.1/share-entry.js',
              reShakeShareName: 'mf_host_antd_6.0.1',
              treeShakingStatus: 2,
            },
          ],
        },
        'provider:http://localhost:3002/mf-manifest.json': {
          version: 'http://localhost:3002/mf-manifest.json',
          buildVersion: '0.1.34',
          globalName: 'provider',
          remoteEntry: 'remoteEntry.js',
          remoteEntryType: 'global',
          remoteTypes: '',
          remoteTypesZip: '',
          remoteTypesAPI: '',
          remotesInfo: {},
          shared: [
            {
              assets: {
                js: {
                  async: [],
                  sync: [],
                },
                css: {
                  async: [],
                  sync: [],
                },
              },
              sharedName: 'antd',
              version: '4.24.15',
              reShakeShareEntry:
                // for this demo, just use the same , but it need to dispatch remote own shared in real case
                'http://localhost:3003/independent-packages/antd/6.0.1/share-entry.js',
              reShakeShareName: 'mf_host_antd_6.0.1',
              treeShakingStatus: 2,
            },
            {
              assets: {
                js: {
                  async: [],
                  sync: ['static/js/async/npm.react-dom.9ba4b416.js'],
                },
                css: {
                  async: [],
                  sync: [],
                },
              },
              sharedName: 'react-dom',
              version: '18.3.1',
            },
            {
              assets: {
                js: {
                  async: [],
                  sync: ['static/js/async/npm.react.5f9ecbd5.js'],
                },
                css: {
                  async: [],
                  sync: [],
                },
              },
              sharedName: 'react',
              version: '18.3.1',
            },
          ],
          modules: [
            {
              moduleName: 'App',
              modulePath: './App',
              assets: {
                js: {
                  sync: [],
                  async: [],
                },
                css: {
                  sync: [],
                  async: [],
                },
              },
            },
          ],
          publicPath: 'http://localhost:3002/',
        },
      };
    },
  };
}
