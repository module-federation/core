import { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

function collectTargetSharedUsedExports(sharedName: string) {
  const usedExports: Set<string> = new Set();
  Object.values(__FEDERATION__.moduleInfo).forEach((moduleInfo) => {
    if (!moduleInfo || !('shared' in moduleInfo)) {
      return;
    }
    moduleInfo.shared.forEach((shared) => {
      //@ts-ignore
      if (shared.sharedName !== sharedName || !shared.usedExports) {
        return;
      }

      // @ts-ignore
      shared.usedExports.forEach(([runtime, exportNames]) => {
        exportNames.forEach((exportName) => {
          usedExports.add(exportName);
        });
      });
    });
  });

  return [...usedExports];
}

export default function (): ModuleFederationRuntimePlugin {
  let mfInstance;
  return {
    name: 'resolve-shaked-shared',
    apply(instance) {
      mfInstance = instance;
      const isCalc = localStorage.getItem('calc');
      if (!isCalc) {
        return;
      }
      // @ts-ignore
      __FEDERATION__.moduleInfo = {
        mf_host: {
          version: '',
          remoteEntry: '',
          remotesInfo: {
            mf_remote: {
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
              version: '4.24.15',
              usedExports: ['Divider', 'Space', 'Switch', 'Button'],
              reShakeShareEntry:
                'http://localhost:3003/independent-packages/antd/antd_mf_host.3fc92539.js',
              reShakeShareName: 'antd_mf_host',
              treeShakingStatus: isCalc === 'no-use' ? 0 : 2,
            },
          ],
        },
        'mf_remote:http://localhost:3002/mf-manifest.json': {
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
                  sync: ['static/js/async/npm.antd.0c40f3e4.js'],
                },
                css: {
                  async: [],
                  sync: [],
                },
              },
              sharedName: 'antd',
              version: '4.24.15',
              usedExports: ['Button', 'Badge'],
              // treeShakingStatus:2,
              reShakeShareEntry:
                'http://localhost:3003/independent-packages/antd/antd_mf_host.3fc92539.js',
              reShakeShareName: 'antd_mf_host',
              treeShakingStatus: isCalc === 'no-use' ? 0 : 2,
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
              usedExports: [],
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
              usedExports: [],
            },
          ],
          modules: [
            {
              moduleName: 'App',
              modulePath: './App',
              assets: {
                js: {
                  sync: [
                    'static/js/async/npm.babel.runtime.bfc5fa9a.js',
                    'static/js/async/npm.react-is.e17534db.js',
                    'static/js/npm..modern-js.a4a39d75.js',
                    'static/js/async/npm.swc.helpers.8b407dbe.js',
                    'static/js/async/npm.modern-js.runtime.968a0fd9.js',
                    'static/js/async/npm.modern-js.runtime-utils.7806a470.js',
                    'static/js/async/npm.modern-js.plugin-v2.63d355aa.js',
                    'static/js/async/npm.tslib.3d69d75a.js',
                    'static/js/async/npm.invariant.a2c88129.js',
                    'static/js/async/npm.hoist-non-react-statics.6174c347.js',
                    'static/js/async/npm.cookie.c6093c5c.js',
                    'static/js/async/npm.react-router.007b61fc.js',
                    'static/js/async/npm.react-router-dom.44c032dc.js',
                    'static/js/async/npm.remix-run.router.d9e969eb.js',
                    'static/js/async/npm.modern-js.utils.97664881.js',
                    'static/js/async/npm.loadable.component.d1f38d58.js',
                    'static/js/async/async-main.e5c8db3d.js',
                    'static/js/async/page.8b9be98b.js',
                  ],
                  async: [
                    'static/js/async/page.8b9be98b.js',
                    'static/js/async/npm.scheduler.f255044f.js',
                    'static/js/async/npm.babel.runtime.bfc5fa9a.js',
                    'static/js/async/npm.react-is.e17534db.js',
                    'static/js/npm..modern-js.a4a39d75.js',
                    'static/js/async/npm.swc.helpers.8b407dbe.js',
                    'static/js/async/npm.modern-js.runtime.968a0fd9.js',
                    'static/js/async/npm.modern-js.runtime-utils.7806a470.js',
                    'static/js/async/npm.modern-js.plugin-v2.63d355aa.js',
                    'static/js/async/npm.tslib.3d69d75a.js',
                    'static/js/async/npm.invariant.a2c88129.js',
                    'static/js/async/npm.hoist-non-react-statics.6174c347.js',
                    'static/js/async/npm.cookie.c6093c5c.js',
                    'static/js/async/npm.react-router.007b61fc.js',
                    'static/js/async/npm.react-router-dom.44c032dc.js',
                    'static/js/async/npm.remix-run.router.d9e969eb.js',
                    'static/js/async/npm.modern-js.utils.97664881.js',
                    'static/js/async/npm.loadable.component.d1f38d58.js',
                    'static/js/async/async-main.e5c8db3d.js',
                    'static/js/async/npm.lodash.d93aeba9.js',
                    'static/js/async/npm.rc-util.048e76db.js',
                    'static/js/async/npm.rc-motion.1a8c8fe9.js',
                    'static/js/async/npm.ant-design.icons.1b7d0d9d.js',
                    'static/js/async/npm.ctrl.tinycolor.0ce792d7.js',
                    'static/js/async/npm.classnames.df1221fe.js',
                    'static/js/async/npm.ant-design.icons-svg.bbb9709d.js',
                    'static/js/async/npm.ant-design.colors.7fa1dec6.js',
                  ],
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
    // resolveShare(args) {
    //   const { shareInfo, pkgName } = args;
    //   if (pkgName !== 'antd') {
    //     return args;
    //   }

    //   // A [Button,List]  antd@4.2.1
    //   // B [Button,List]  antd@4.2.3
    //   // C [Button,List]  antd@4.2.3

    //   // app1   app2
    //   // B       C

    //   const { usedExports } = shareInfo;
    //   if (!usedExports) {
    //     return args;
    //   }

    //   const allUsedExports = collectTargetSharedUsedExports(pkgName);
    //   if (
    //     allUsedExports.every((exportName) => usedExports.includes(exportName))
    //   ) {
    //     return args;
    //   }

    //   // load Fallback shared
    //   const fallbackShared = {
    //     ...shareInfo,
    //     get: () =>
    //       new Promise((resolve) => {
    //         const script = document.createElement('script');
    //         script.src =
    //           'http://localhost:3003/independent-packages/antd/antd_mf_host.js';
    //         script.onload = () => {
    //           const fallbackModuleContainer = window['antd_mf_host'];
    //           // @ts-ignore
    //           fallbackModuleContainer
    //             .init(mfInstance, __webpack_require__.federation.bundlerRuntime)
    //             .then(() => {
    //               resolve(fallbackModuleContainer.get());
    //             });
    //         };
    //         document.head.appendChild(script);
    //       }),
    //   };
    //   console.log('use fallback shared : ', args);

    //   return {
    //     ...args,
    //     resolver: () => fallbackShared,
    //   };
    // },
  };
}
