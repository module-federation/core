import * as __WEBPACK_EXTERNAL_MODULE__3_layers_full_module_container_mjs_552ff716__ from '../../3-layers-full/module/container.mjs';
import * as __WEBPACK_EXTERNAL_MODULE__container_mjs_6f4cf51f__ from './container.mjs';
import { createRequire as __WEBPACK_EXTERNAL_createRequire } from 'module';
/******/ var __webpack_modules__ = {
  /***/ 815:
    /*!**************************************************************************************!*\
  !*** ../../../../node_modules/.federation/entry.6136f28307fdffaf282b30f3aa33aa4a.js ***!
  \**************************************************************************************/
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony import */ var _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_index_cjs_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          /*! ../../../../../webpack-bundler-runtime/dist/index.cjs.js */ 956,
        );
      /* harmony import */ var _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_index_cjs_js__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(
          _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_index_cjs_js__WEBPACK_IMPORTED_MODULE_0__,
        );

      if (!__webpack_require__.federation.runtime) {
        var prevFederation = __webpack_require__.federation;
        __webpack_require__.federation = {};
        for (var key in _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_index_cjs_js__WEBPACK_IMPORTED_MODULE_0___default()) {
          __webpack_require__.federation[key] =
            _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_index_cjs_js__WEBPACK_IMPORTED_MODULE_0___default()[
              key
            ];
        }
        for (var key in prevFederation) {
          __webpack_require__.federation[key] = prevFederation[key];
        }
      }
      if (!__webpack_require__.federation.instance) {
        __webpack_require__.federation.instance =
          __webpack_require__.federation.runtime.init(
            __webpack_require__.federation.initOptions,
          );
        if (__webpack_require__.federation.attachShareScopeMap) {
          __webpack_require__.federation.attachShareScopeMap(
            __webpack_require__,
          );
        }
        if (__webpack_require__.federation.installInitialConsumes) {
          __webpack_require__.federation.installInitialConsumes();
        }

        if (
          !__webpack_require__.federation.isMFRemote &&
          __webpack_require__.federation.prefetch
        ) {
          __webpack_require__.federation.prefetch();
        }
      }

      /***/
    },

  /***/ 664:
    /*!****************************************************!*\
  !*** ../../../../../error-codes/dist/index.cjs.js ***!
  \****************************************************/
    /***/ (__unused_webpack_module, exports) => {
      const RUNTIME_001 = 'RUNTIME-001';
      const RUNTIME_002 = 'RUNTIME-002';
      const RUNTIME_003 = 'RUNTIME-003';
      const RUNTIME_004 = 'RUNTIME-004';
      const RUNTIME_005 = 'RUNTIME-005';
      const RUNTIME_006 = 'RUNTIME-006';
      const RUNTIME_007 = 'RUNTIME-007';
      const TYPE_001 = 'TYPE-001';

      const getDocsUrl = (errorCode) => {
        const type = errorCode.split('-')[0].toLowerCase();
        return `https://module-federation.io/guide/troubleshooting/${type}/${errorCode}`;
      };
      const getShortErrorMsg = (
        errorCode,
        errorDescMap,
        args,
        originalErrorMsg,
      ) => {
        const msg = [`${[errorDescMap[errorCode]]} #${errorCode}`];
        args && msg.push(`args: ${JSON.stringify(args)}`);
        msg.push(getDocsUrl(errorCode));
        originalErrorMsg &&
          msg.push(`Original Error Message:\n ${originalErrorMsg}`);
        return msg.join('\n');
      };

      function _extends() {
        _extends =
          Object.assign ||
          function assign(target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source)
                if (Object.prototype.hasOwnProperty.call(source, key))
                  target[key] = source[key];
            }
            return target;
          };
        return _extends.apply(this, arguments);
      }

      const runtimeDescMap = {
        [RUNTIME_001]: 'Failed to get remoteEntry exports.',
        [RUNTIME_002]: 'The remote entry interface does not contain "init"',
        [RUNTIME_003]: 'Failed to get manifest.',
        [RUNTIME_004]: 'Failed to locate remote.',
        [RUNTIME_005]:
          'Invalid loadShareSync function call from bundler runtime',
        [RUNTIME_006]: 'Invalid loadShareSync function call from runtime',
        [RUNTIME_007]: 'Failed to get remote snapshot.',
      };
      const typeDescMap = {
        [TYPE_001]: 'Failed to generate type declaration.',
      };
      const errorDescMap = _extends({}, runtimeDescMap, typeDescMap);

      exports.RUNTIME_001 = RUNTIME_001;
      exports.RUNTIME_002 = RUNTIME_002;
      exports.RUNTIME_003 = RUNTIME_003;
      exports.RUNTIME_004 = RUNTIME_004;
      exports.RUNTIME_005 = RUNTIME_005;
      exports.RUNTIME_006 = RUNTIME_006;
      exports.RUNTIME_007 = RUNTIME_007;
      exports.TYPE_001 = TYPE_001;
      exports.errorDescMap = errorDescMap;
      exports.getShortErrorMsg = getShortErrorMsg;
      exports.runtimeDescMap = runtimeDescMap;
      exports.typeDescMap = typeDescMap;

      /***/
    },

  /***/ 247:
    /*!************************************************!*\
  !*** ../../../../../runtime/dist/index.cjs.js ***!
  \************************************************/
    /***/ (__unused_webpack_module, exports, __webpack_require__) => {
      var polyfills = __webpack_require__(/*! ./polyfills.cjs.js */ 267);
      var sdk = __webpack_require__(/*! @module-federation/sdk */ 463);
      var share = __webpack_require__(/*! ./share.cjs.js */ 188);
      var errorCodes = __webpack_require__(
        /*! @module-federation/error-codes */ 664,
      );

      // Function to match a remote with its name and expose
      // id: pkgName(@federation/app1) + expose(button) = @federation/app1/button
      // id: alias(app1) + expose(button) = app1/button
      // id: alias(app1/utils) + expose(loadash/sort) = app1/utils/loadash/sort
      function matchRemoteWithNameAndExpose(remotes, id) {
        for (const remote of remotes) {
          // match pkgName
          const isNameMatched = id.startsWith(remote.name);
          let expose = id.replace(remote.name, '');
          if (isNameMatched) {
            if (expose.startsWith('/')) {
              const pkgNameOrAlias = remote.name;
              expose = `.${expose}`;
              return {
                pkgNameOrAlias,
                expose,
                remote,
              };
            } else if (expose === '') {
              return {
                pkgNameOrAlias: remote.name,
                expose: '.',
                remote,
              };
            }
          }
          // match alias
          const isAliasMatched = remote.alias && id.startsWith(remote.alias);
          let exposeWithAlias = remote.alias && id.replace(remote.alias, '');
          if (remote.alias && isAliasMatched) {
            if (exposeWithAlias && exposeWithAlias.startsWith('/')) {
              const pkgNameOrAlias = remote.alias;
              exposeWithAlias = `.${exposeWithAlias}`;
              return {
                pkgNameOrAlias,
                expose: exposeWithAlias,
                remote,
              };
            } else if (exposeWithAlias === '') {
              return {
                pkgNameOrAlias: remote.alias,
                expose: '.',
                remote,
              };
            }
          }
        }
        return;
      }
      // Function to match a remote with its name or alias
      function matchRemote(remotes, nameOrAlias) {
        for (const remote of remotes) {
          const isNameMatched = nameOrAlias === remote.name;
          if (isNameMatched) {
            return remote;
          }
          const isAliasMatched = remote.alias && nameOrAlias === remote.alias;
          if (isAliasMatched) {
            return remote;
          }
        }
        return;
      }

      function registerPlugins$1(plugins, hookInstances) {
        const globalPlugins = share.getGlobalHostPlugins();
        // Incorporate global plugins
        if (globalPlugins.length > 0) {
          globalPlugins.forEach((plugin) => {
            if (
              plugins == null
                ? void 0
                : plugins.find((item) => item.name !== plugin.name)
            ) {
              plugins.push(plugin);
            }
          });
        }
        if (plugins && plugins.length > 0) {
          plugins.forEach((plugin) => {
            hookInstances.forEach((hookInstance) => {
              hookInstance.applyPlugin(plugin);
            });
          });
        }
        return plugins;
      }

      async function loadEsmEntry({ entry, remoteEntryExports }) {
        return new Promise((resolve, reject) => {
          try {
            if (!remoteEntryExports) {
              if (typeof FEDERATION_ALLOW_NEW_FUNCTION !== 'undefined') {
                new Function(
                  'callbacks',
                  `import("${entry}").then(callbacks[0]).catch(callbacks[1])`,
                )([resolve, reject]);
              } else {
                import(/* webpackIgnore: true */ /* @vite-ignore */ entry)
                  .then(resolve)
                  .catch(reject);
              }
            } else {
              resolve(remoteEntryExports);
            }
          } catch (e) {
            reject(e);
          }
        });
      }
      async function loadSystemJsEntry({ entry, remoteEntryExports }) {
        return new Promise((resolve, reject) => {
          try {
            if (!remoteEntryExports) {
              //@ts-ignore
              if (false) {
              } else {
                new Function(
                  'callbacks',
                  `System.import("${entry}").then(callbacks[0]).catch(callbacks[1])`,
                )([resolve, reject]);
              }
            } else {
              resolve(remoteEntryExports);
            }
          } catch (e) {
            reject(e);
          }
        });
      }
      async function loadEntryScript({ name, globalName, entry, loaderHook }) {
        const { entryExports: remoteEntryExports } =
          share.getRemoteEntryExports(name, globalName);
        if (remoteEntryExports) {
          return remoteEntryExports;
        }
        return sdk
          .loadScript(entry, {
            attrs: {},
            createScriptHook: (url, attrs) => {
              const res = loaderHook.lifecycle.createScript.emit({
                url,
                attrs,
              });
              if (!res) return;
              if (res instanceof HTMLScriptElement) {
                return res;
              }
              if ('script' in res || 'timeout' in res) {
                return res;
              }
              return;
            },
          })
          .then(() => {
            const { remoteEntryKey, entryExports } =
              share.getRemoteEntryExports(name, globalName);
            share.assert(
              entryExports,
              errorCodes.getShortErrorMsg(
                errorCodes.RUNTIME_001,
                errorCodes.runtimeDescMap,
                {
                  remoteName: name,
                  remoteEntryUrl: entry,
                  remoteEntryKey,
                },
              ),
            );
            return entryExports;
          })
          .catch((e) => {
            throw e;
          });
      }
      async function loadEntryDom({
        remoteInfo,
        remoteEntryExports,
        loaderHook,
      }) {
        const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
        switch (type) {
          case 'esm':
          case 'module':
            return loadEsmEntry({
              entry,
              remoteEntryExports,
            });
          case 'system':
            return loadSystemJsEntry({
              entry,
              remoteEntryExports,
            });
          default:
            return loadEntryScript({
              entry,
              globalName,
              name,
              loaderHook,
            });
        }
      }
      async function loadEntryNode({ remoteInfo, loaderHook }) {
        const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
        const { entryExports: remoteEntryExports } =
          share.getRemoteEntryExports(name, globalName);
        if (remoteEntryExports) {
          return remoteEntryExports;
        }
        return sdk
          .loadScriptNode(entry, {
            attrs: {
              name,
              globalName,
              type,
            },
            loaderHook: {
              createScriptHook: (url, attrs = {}) => {
                const res = loaderHook.lifecycle.createScript.emit({
                  url,
                  attrs,
                });
                if (!res) return;
                if ('url' in res) {
                  return res;
                }
                return;
              },
            },
          })
          .then(() => {
            const { remoteEntryKey, entryExports } =
              share.getRemoteEntryExports(name, globalName);
            share.assert(
              entryExports,
              errorCodes.getShortErrorMsg(
                errorCodes.RUNTIME_001,
                errorCodes.runtimeDescMap,
                {
                  remoteName: name,
                  remoteEntryUrl: entry,
                  remoteEntryKey,
                },
              ),
            );
            return entryExports;
          })
          .catch((e) => {
            throw e;
          });
      }
      function getRemoteEntryUniqueKey(remoteInfo) {
        const { entry, name } = remoteInfo;
        return sdk.composeKeyWithSeparator(name, entry);
      }
      async function getRemoteEntry({
        origin,
        remoteEntryExports,
        remoteInfo,
      }) {
        const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
        if (remoteEntryExports) {
          return remoteEntryExports;
        }
        if (!share.globalLoading[uniqueKey]) {
          const loadEntryHook = origin.remoteHandler.hooks.lifecycle.loadEntry;
          const loaderHook = origin.loaderHook;
          share.globalLoading[uniqueKey] = loadEntryHook
            .emit({
              loaderHook,
              remoteInfo,
              remoteEntryExports,
            })
            .then((res) => {
              if (res) {
                return res;
              }
              return sdk.isBrowserEnv()
                ? loadEntryDom({
                    remoteInfo,
                    remoteEntryExports,
                    loaderHook,
                  })
                : loadEntryNode({
                    remoteInfo,
                    loaderHook,
                  });
            });
        }
        return share.globalLoading[uniqueKey];
      }
      function getRemoteInfo(remote) {
        return polyfills._extends({}, remote, {
          entry: 'entry' in remote ? remote.entry : '',
          type: remote.type || share.DEFAULT_REMOTE_TYPE,
          entryGlobalName: remote.entryGlobalName || remote.name,
          shareScope: remote.shareScope || share.DEFAULT_SCOPE,
        });
      }

      let Module = class Module {
        async getEntry() {
          if (this.remoteEntryExports) {
            return this.remoteEntryExports;
          }
          let remoteEntryExports;
          try {
            remoteEntryExports = await getRemoteEntry({
              origin: this.host,
              remoteInfo: this.remoteInfo,
              remoteEntryExports: this.remoteEntryExports,
            });
          } catch (err) {
            const uniqueKey = getRemoteEntryUniqueKey(this.remoteInfo);
            remoteEntryExports =
              await this.host.loaderHook.lifecycle.loadEntryError.emit({
                getRemoteEntry,
                origin: this.host,
                remoteInfo: this.remoteInfo,
                remoteEntryExports: this.remoteEntryExports,
                globalLoading: share.globalLoading,
                uniqueKey,
              });
          }
          share.assert(
            remoteEntryExports,
            `remoteEntryExports is undefined \n ${sdk.safeToString(this.remoteInfo)}`,
          );
          this.remoteEntryExports = remoteEntryExports;
          return this.remoteEntryExports;
        }
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        async get(id, expose, options, remoteSnapshot) {
          const { loadFactory = true } = options || {
            loadFactory: true,
          };
          // Get remoteEntry.js
          const remoteEntryExports = await this.getEntry();
          if (!this.inited) {
            const localShareScopeMap = this.host.shareScopeMap;
            const remoteShareScope = this.remoteInfo.shareScope || 'default';
            if (!localShareScopeMap[remoteShareScope]) {
              localShareScopeMap[remoteShareScope] = {};
            }
            const shareScope = localShareScopeMap[remoteShareScope];
            const initScope = [];
            const remoteEntryInitOptions = {
              version: this.remoteInfo.version || '',
            };
            // Help to find host instance
            Object.defineProperty(remoteEntryInitOptions, 'shareScopeMap', {
              value: localShareScopeMap,
              // remoteEntryInitOptions will be traversed and assigned during container init, ,so this attribute is not allowed to be traversed
              enumerable: false,
            });
            const initContainerOptions =
              await this.host.hooks.lifecycle.beforeInitContainer.emit({
                shareScope,
                // @ts-ignore shareScopeMap will be set by Object.defineProperty
                remoteEntryInitOptions,
                initScope,
                remoteInfo: this.remoteInfo,
                origin: this.host,
              });
            if (
              typeof (remoteEntryExports == null
                ? void 0
                : remoteEntryExports.init) === 'undefined'
            ) {
              share.error(
                errorCodes.getShortErrorMsg(
                  errorCodes.RUNTIME_002,
                  errorCodes.runtimeDescMap,
                  {
                    remoteName: name,
                    remoteEntryUrl: this.remoteInfo.entry,
                    remoteEntryKey: this.remoteInfo.entryGlobalName,
                  },
                ),
              );
            }
            await remoteEntryExports.init(
              initContainerOptions.shareScope,
              initContainerOptions.initScope,
              initContainerOptions.remoteEntryInitOptions,
            );
            await this.host.hooks.lifecycle.initContainer.emit(
              polyfills._extends({}, initContainerOptions, {
                id,
                remoteSnapshot,
                remoteEntryExports,
              }),
            );
          }
          this.lib = remoteEntryExports;
          this.inited = true;
          let moduleFactory;
          moduleFactory =
            await this.host.loaderHook.lifecycle.getModuleFactory.emit({
              remoteEntryExports,
              expose,
              moduleInfo: this.remoteInfo,
            });
          // get exposeGetter
          if (!moduleFactory) {
            moduleFactory = await remoteEntryExports.get(expose);
          }
          share.assert(
            moduleFactory,
            `${share.getFMId(this.remoteInfo)} remote don't export ${expose}.`,
          );
          // keep symbol for module name always one format
          const symbolName = share.processModuleAlias(
            this.remoteInfo.name,
            expose,
          );
          const wrapModuleFactory = this.wraperFactory(
            moduleFactory,
            symbolName,
          );
          if (!loadFactory) {
            return wrapModuleFactory;
          }
          const exposeContent = await wrapModuleFactory();
          return exposeContent;
        }
        wraperFactory(moduleFactory, id) {
          function defineModuleId(res, id) {
            if (
              res &&
              typeof res === 'object' &&
              Object.isExtensible(res) &&
              !Object.getOwnPropertyDescriptor(res, Symbol.for('mf_module_id'))
            ) {
              Object.defineProperty(res, Symbol.for('mf_module_id'), {
                value: id,
                enumerable: false,
              });
            }
          }
          if (moduleFactory instanceof Promise) {
            return async () => {
              const res = await moduleFactory();
              // This parameter is used for bridge debugging
              defineModuleId(res, id);
              return res;
            };
          } else {
            return () => {
              const res = moduleFactory();
              // This parameter is used for bridge debugging
              defineModuleId(res, id);
              return res;
            };
          }
        }
        constructor({ remoteInfo, host }) {
          this.inited = false;
          this.lib = undefined;
          this.remoteInfo = remoteInfo;
          this.host = host;
        }
      };

      class SyncHook {
        on(fn) {
          if (typeof fn === 'function') {
            this.listeners.add(fn);
          }
        }
        once(fn) {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this;
          this.on(function wrapper(...args) {
            self.remove(wrapper);
            // eslint-disable-next-line prefer-spread
            return fn.apply(null, args);
          });
        }
        emit(...data) {
          let result;
          if (this.listeners.size > 0) {
            // eslint-disable-next-line prefer-spread
            this.listeners.forEach((fn) => {
              result = fn(...data);
            });
          }
          return result;
        }
        remove(fn) {
          this.listeners.delete(fn);
        }
        removeAll() {
          this.listeners.clear();
        }
        constructor(type) {
          this.type = '';
          this.listeners = new Set();
          if (type) {
            this.type = type;
          }
        }
      }

      class AsyncHook extends SyncHook {
        emit(...data) {
          let result;
          const ls = Array.from(this.listeners);
          if (ls.length > 0) {
            let i = 0;
            const call = (prev) => {
              if (prev === false) {
                return false; // Abort process
              } else if (i < ls.length) {
                return Promise.resolve(ls[i++].apply(null, data)).then(call);
              } else {
                return prev;
              }
            };
            result = call();
          }
          return Promise.resolve(result);
        }
      }

      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      function checkReturnData(originalData, returnedData) {
        if (!share.isObject(returnedData)) {
          return false;
        }
        if (originalData !== returnedData) {
          // eslint-disable-next-line no-restricted-syntax
          for (const key in originalData) {
            if (!(key in returnedData)) {
              return false;
            }
          }
        }
        return true;
      }
      class SyncWaterfallHook extends SyncHook {
        emit(data) {
          if (!share.isObject(data)) {
            share.error(
              `The data for the "${this.type}" hook should be an object.`,
            );
          }
          for (const fn of this.listeners) {
            try {
              const tempData = fn(data);
              if (checkReturnData(data, tempData)) {
                data = tempData;
              } else {
                this.onerror(
                  `A plugin returned an unacceptable value for the "${this.type}" type.`,
                );
                break;
              }
            } catch (e) {
              share.warn(e);
              this.onerror(e);
            }
          }
          return data;
        }
        constructor(type) {
          super(), (this.onerror = share.error);
          this.type = type;
        }
      }

      class AsyncWaterfallHook extends SyncHook {
        emit(data) {
          if (!share.isObject(data)) {
            share.error(
              `The response data for the "${this.type}" hook must be an object.`,
            );
          }
          const ls = Array.from(this.listeners);
          if (ls.length > 0) {
            let i = 0;
            const processError = (e) => {
              share.warn(e);
              this.onerror(e);
              return data;
            };
            const call = (prevData) => {
              if (checkReturnData(data, prevData)) {
                data = prevData;
                if (i < ls.length) {
                  try {
                    return Promise.resolve(ls[i++](data)).then(
                      call,
                      processError,
                    );
                  } catch (e) {
                    return processError(e);
                  }
                }
              } else {
                this.onerror(
                  `A plugin returned an incorrect value for the "${this.type}" type.`,
                );
              }
              return data;
            };
            return Promise.resolve(call(data));
          }
          return Promise.resolve(data);
        }
        constructor(type) {
          super(), (this.onerror = share.error);
          this.type = type;
        }
      }

      class PluginSystem {
        applyPlugin(plugin) {
          share.assert(
            share.isPlainObject(plugin),
            'Plugin configuration is invalid.',
          );
          // The plugin's name is mandatory and must be unique
          const pluginName = plugin.name;
          share.assert(pluginName, 'A name must be provided by the plugin.');
          if (!this.registerPlugins[pluginName]) {
            this.registerPlugins[pluginName] = plugin;
            Object.keys(this.lifecycle).forEach((key) => {
              const pluginLife = plugin[key];
              if (pluginLife) {
                this.lifecycle[key].on(pluginLife);
              }
            });
          }
        }
        removePlugin(pluginName) {
          share.assert(pluginName, 'A name is required.');
          const plugin = this.registerPlugins[pluginName];
          share.assert(plugin, `The plugin "${pluginName}" is not registered.`);
          Object.keys(plugin).forEach((key) => {
            if (key !== 'name') {
              this.lifecycle[key].remove(plugin[key]);
            }
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-shadow
        inherit({ lifecycle, registerPlugins }) {
          Object.keys(lifecycle).forEach((hookName) => {
            share.assert(
              !this.lifecycle[hookName],
              `The hook "${hookName}" has a conflict and cannot be inherited.`,
            );
            this.lifecycle[hookName] = lifecycle[hookName];
          });
          Object.keys(registerPlugins).forEach((pluginName) => {
            share.assert(
              !this.registerPlugins[pluginName],
              `The plugin "${pluginName}" has a conflict and cannot be inherited.`,
            );
            this.applyPlugin(registerPlugins[pluginName]);
          });
        }
        constructor(lifecycle) {
          this.registerPlugins = {};
          this.lifecycle = lifecycle;
          this.lifecycleKeys = Object.keys(lifecycle);
        }
      }

      function defaultPreloadArgs(preloadConfig) {
        return polyfills._extends(
          {
            resourceCategory: 'sync',
            share: true,
            depsRemote: true,
            prefetchInterface: false,
          },
          preloadConfig,
        );
      }
      function formatPreloadArgs(remotes, preloadArgs) {
        return preloadArgs.map((args) => {
          const remoteInfo = matchRemote(remotes, args.nameOrAlias);
          share.assert(
            remoteInfo,
            `Unable to preload ${args.nameOrAlias} as it is not included in ${
              !remoteInfo &&
              sdk.safeToString({
                remoteInfo,
                remotes,
              })
            }`,
          );
          return {
            remote: remoteInfo,
            preloadConfig: defaultPreloadArgs(args),
          };
        });
      }
      function normalizePreloadExposes(exposes) {
        if (!exposes) {
          return [];
        }
        return exposes.map((expose) => {
          if (expose === '.') {
            return expose;
          }
          if (expose.startsWith('./')) {
            return expose.replace('./', '');
          }
          return expose;
        });
      }
      function preloadAssets(
        remoteInfo,
        host,
        assets, // It is used to distinguish preload from load remote parallel loading
        useLinkPreload = true,
      ) {
        const { cssAssets, jsAssetsWithoutEntry, entryAssets } = assets;
        if (host.options.inBrowser) {
          entryAssets.forEach((asset) => {
            const { moduleInfo } = asset;
            const module = host.moduleCache.get(remoteInfo.name);
            if (module) {
              getRemoteEntry({
                origin: host,
                remoteInfo: moduleInfo,
                remoteEntryExports: module.remoteEntryExports,
              });
            } else {
              getRemoteEntry({
                origin: host,
                remoteInfo: moduleInfo,
                remoteEntryExports: undefined,
              });
            }
          });
          if (useLinkPreload) {
            const defaultAttrs = {
              rel: 'preload',
              as: 'style',
            };
            cssAssets.forEach((cssUrl) => {
              const { link: cssEl, needAttach } = sdk.createLink({
                url: cssUrl,
                cb: () => {
                  // noop
                },
                attrs: defaultAttrs,
                createLinkHook: (url, attrs) => {
                  const res = host.loaderHook.lifecycle.createLink.emit({
                    url,
                    attrs,
                  });
                  if (res instanceof HTMLLinkElement) {
                    return res;
                  }
                  return;
                },
              });
              needAttach && document.head.appendChild(cssEl);
            });
          } else {
            const defaultAttrs = {
              rel: 'stylesheet',
              type: 'text/css',
            };
            cssAssets.forEach((cssUrl) => {
              const { link: cssEl, needAttach } = sdk.createLink({
                url: cssUrl,
                cb: () => {
                  // noop
                },
                attrs: defaultAttrs,
                createLinkHook: (url, attrs) => {
                  const res = host.loaderHook.lifecycle.createLink.emit({
                    url,
                    attrs,
                  });
                  if (res instanceof HTMLLinkElement) {
                    return res;
                  }
                  return;
                },
                needDeleteLink: false,
              });
              needAttach && document.head.appendChild(cssEl);
            });
          }
          if (useLinkPreload) {
            const defaultAttrs = {
              rel: 'preload',
              as: 'script',
            };
            jsAssetsWithoutEntry.forEach((jsUrl) => {
              const { link: linkEl, needAttach } = sdk.createLink({
                url: jsUrl,
                cb: () => {
                  // noop
                },
                attrs: defaultAttrs,
                createLinkHook: (url, attrs) => {
                  const res = host.loaderHook.lifecycle.createLink.emit({
                    url,
                    attrs,
                  });
                  if (res instanceof HTMLLinkElement) {
                    return res;
                  }
                  return;
                },
              });
              needAttach && document.head.appendChild(linkEl);
            });
          } else {
            const defaultAttrs = {
              fetchpriority: 'high',
              type:
                (remoteInfo == null ? void 0 : remoteInfo.type) === 'module'
                  ? 'module'
                  : 'text/javascript',
            };
            jsAssetsWithoutEntry.forEach((jsUrl) => {
              const { script: scriptEl, needAttach } = sdk.createScript({
                url: jsUrl,
                cb: () => {
                  // noop
                },
                attrs: defaultAttrs,
                createScriptHook: (url, attrs) => {
                  const res = host.loaderHook.lifecycle.createScript.emit({
                    url,
                    attrs,
                  });
                  if (res instanceof HTMLScriptElement) {
                    return res;
                  }
                  return;
                },
                needDeleteScript: true,
              });
              needAttach && document.head.appendChild(scriptEl);
            });
          }
        }
      }

      function assignRemoteInfo(remoteInfo, remoteSnapshot) {
        const remoteEntryInfo =
          share.getRemoteEntryInfoFromSnapshot(remoteSnapshot);
        if (!remoteEntryInfo.url) {
          share.error(
            `The attribute remoteEntry of ${remoteInfo.name} must not be undefined.`,
          );
        }
        let entryUrl = sdk.getResourceUrl(remoteSnapshot, remoteEntryInfo.url);
        if (!sdk.isBrowserEnv() && !entryUrl.startsWith('http')) {
          entryUrl = `https:${entryUrl}`;
        }
        remoteInfo.type = remoteEntryInfo.type;
        remoteInfo.entryGlobalName = remoteEntryInfo.globalName;
        remoteInfo.entry = entryUrl;
        remoteInfo.version = remoteSnapshot.version;
        remoteInfo.buildVersion = remoteSnapshot.buildVersion;
      }
      function snapshotPlugin() {
        return {
          name: 'snapshot-plugin',
          async afterResolve(args) {
            const { remote, pkgNameOrAlias, expose, origin, remoteInfo } = args;
            if (
              !share.isRemoteInfoWithEntry(remote) ||
              !share.isPureRemoteEntry(remote)
            ) {
              const { remoteSnapshot, globalSnapshot } =
                await origin.snapshotHandler.loadRemoteSnapshotInfo(remote);
              assignRemoteInfo(remoteInfo, remoteSnapshot);
              // preloading assets
              const preloadOptions = {
                remote,
                preloadConfig: {
                  nameOrAlias: pkgNameOrAlias,
                  exposes: [expose],
                  resourceCategory: 'sync',
                  share: false,
                  depsRemote: false,
                },
              };
              const assets =
                await origin.remoteHandler.hooks.lifecycle.generatePreloadAssets.emit(
                  {
                    origin,
                    preloadOptions,
                    remoteInfo,
                    remote,
                    remoteSnapshot,
                    globalSnapshot,
                  },
                );
              if (assets) {
                preloadAssets(remoteInfo, origin, assets, false);
              }
              return polyfills._extends({}, args, {
                remoteSnapshot,
              });
            }
            return args;
          },
        };
      }

      // name
      // name:version
      function splitId(id) {
        const splitInfo = id.split(':');
        if (splitInfo.length === 1) {
          return {
            name: splitInfo[0],
            version: undefined,
          };
        } else if (splitInfo.length === 2) {
          return {
            name: splitInfo[0],
            version: splitInfo[1],
          };
        } else {
          return {
            name: splitInfo[1],
            version: splitInfo[2],
          };
        }
      }
      // Traverse all nodes in moduleInfo and traverse the entire snapshot
      function traverseModuleInfo(
        globalSnapshot,
        remoteInfo,
        traverse,
        isRoot,
        memo = {},
        remoteSnapshot,
      ) {
        const id = share.getFMId(remoteInfo);
        const { value: snapshotValue } = share.getInfoWithoutType(
          globalSnapshot,
          id,
        );
        const effectiveRemoteSnapshot = remoteSnapshot || snapshotValue;
        if (
          effectiveRemoteSnapshot &&
          !sdk.isManifestProvider(effectiveRemoteSnapshot)
        ) {
          traverse(effectiveRemoteSnapshot, remoteInfo, isRoot);
          if (effectiveRemoteSnapshot.remotesInfo) {
            const remoteKeys = Object.keys(effectiveRemoteSnapshot.remotesInfo);
            for (const key of remoteKeys) {
              if (memo[key]) {
                continue;
              }
              memo[key] = true;
              const subRemoteInfo = splitId(key);
              const remoteValue = effectiveRemoteSnapshot.remotesInfo[key];
              traverseModuleInfo(
                globalSnapshot,
                {
                  name: subRemoteInfo.name,
                  version: remoteValue.matchedVersion,
                },
                traverse,
                false,
                memo,
                undefined,
              );
            }
          }
        }
      }
      // eslint-disable-next-line max-lines-per-function
      function generatePreloadAssets(
        origin,
        preloadOptions,
        remote,
        globalSnapshot,
        remoteSnapshot,
      ) {
        const cssAssets = [];
        const jsAssets = [];
        const entryAssets = [];
        const loadedSharedJsAssets = new Set();
        const loadedSharedCssAssets = new Set();
        const { options } = origin;
        const { preloadConfig: rootPreloadConfig } = preloadOptions;
        const { depsRemote } = rootPreloadConfig;
        const memo = {};
        traverseModuleInfo(
          globalSnapshot,
          remote,
          (moduleInfoSnapshot, remoteInfo, isRoot) => {
            let preloadConfig;
            if (isRoot) {
              preloadConfig = rootPreloadConfig;
            } else {
              if (Array.isArray(depsRemote)) {
                // eslint-disable-next-line array-callback-return
                const findPreloadConfig = depsRemote.find((remoteConfig) => {
                  if (
                    remoteConfig.nameOrAlias === remoteInfo.name ||
                    remoteConfig.nameOrAlias === remoteInfo.alias
                  ) {
                    return true;
                  }
                  return false;
                });
                if (!findPreloadConfig) {
                  return;
                }
                preloadConfig = defaultPreloadArgs(findPreloadConfig);
              } else if (depsRemote === true) {
                preloadConfig = rootPreloadConfig;
              } else {
                return;
              }
            }
            const remoteEntryUrl = sdk.getResourceUrl(
              moduleInfoSnapshot,
              share.getRemoteEntryInfoFromSnapshot(moduleInfoSnapshot).url,
            );
            if (remoteEntryUrl) {
              entryAssets.push({
                name: remoteInfo.name,
                moduleInfo: {
                  name: remoteInfo.name,
                  entry: remoteEntryUrl,
                  type:
                    'remoteEntryType' in moduleInfoSnapshot
                      ? moduleInfoSnapshot.remoteEntryType
                      : 'global',
                  entryGlobalName:
                    'globalName' in moduleInfoSnapshot
                      ? moduleInfoSnapshot.globalName
                      : remoteInfo.name,
                  shareScope: '',
                  version:
                    'version' in moduleInfoSnapshot
                      ? moduleInfoSnapshot.version
                      : undefined,
                },
                url: remoteEntryUrl,
              });
            }
            let moduleAssetsInfo =
              'modules' in moduleInfoSnapshot ? moduleInfoSnapshot.modules : [];
            const normalizedPreloadExposes = normalizePreloadExposes(
              preloadConfig.exposes,
            );
            if (
              normalizedPreloadExposes.length &&
              'modules' in moduleInfoSnapshot
            ) {
              var _moduleInfoSnapshot_modules;
              moduleAssetsInfo =
                moduleInfoSnapshot == null
                  ? void 0
                  : (_moduleInfoSnapshot_modules =
                        moduleInfoSnapshot.modules) == null
                    ? void 0
                    : _moduleInfoSnapshot_modules.reduce(
                        (assets, moduleAssetInfo) => {
                          if (
                            (normalizedPreloadExposes == null
                              ? void 0
                              : normalizedPreloadExposes.indexOf(
                                  moduleAssetInfo.moduleName,
                                )) !== -1
                          ) {
                            assets.push(moduleAssetInfo);
                          }
                          return assets;
                        },
                        [],
                      );
            }
            function handleAssets(assets) {
              const assetsRes = assets.map((asset) =>
                sdk.getResourceUrl(moduleInfoSnapshot, asset),
              );
              if (preloadConfig.filter) {
                return assetsRes.filter(preloadConfig.filter);
              }
              return assetsRes;
            }
            if (moduleAssetsInfo) {
              const assetsLength = moduleAssetsInfo.length;
              for (let index = 0; index < assetsLength; index++) {
                const assetsInfo = moduleAssetsInfo[index];
                const exposeFullPath = `${remoteInfo.name}/${assetsInfo.moduleName}`;
                origin.remoteHandler.hooks.lifecycle.handlePreloadModule.emit({
                  id:
                    assetsInfo.moduleName === '.'
                      ? remoteInfo.name
                      : exposeFullPath,
                  name: remoteInfo.name,
                  remoteSnapshot: moduleInfoSnapshot,
                  preloadConfig,
                  remote: remoteInfo,
                  origin,
                });
                const preloaded = share.getPreloaded(exposeFullPath);
                if (preloaded) {
                  continue;
                }
                if (preloadConfig.resourceCategory === 'all') {
                  cssAssets.push(...handleAssets(assetsInfo.assets.css.async));
                  cssAssets.push(...handleAssets(assetsInfo.assets.css.sync));
                  jsAssets.push(...handleAssets(assetsInfo.assets.js.async));
                  jsAssets.push(...handleAssets(assetsInfo.assets.js.sync));
                  // eslint-disable-next-line no-constant-condition
                } else if ((preloadConfig.resourceCategory = 'sync')) {
                  cssAssets.push(...handleAssets(assetsInfo.assets.css.sync));
                  jsAssets.push(...handleAssets(assetsInfo.assets.js.sync));
                }
                share.setPreloaded(exposeFullPath);
              }
            }
          },
          true,
          memo,
          remoteSnapshot,
        );
        if (remoteSnapshot.shared) {
          const collectSharedAssets = (shareInfo, snapshotShared) => {
            const registeredShared = share.getRegisteredShare(
              origin.shareScopeMap,
              snapshotShared.sharedName,
              shareInfo,
              origin.sharedHandler.hooks.lifecycle.resolveShare,
            );
            // If the global share does not exist, or the lib function does not exist, it means that the shared has not been loaded yet and can be preloaded.
            if (
              registeredShared &&
              typeof registeredShared.lib === 'function'
            ) {
              snapshotShared.assets.js.sync.forEach((asset) => {
                loadedSharedJsAssets.add(asset);
              });
              snapshotShared.assets.css.sync.forEach((asset) => {
                loadedSharedCssAssets.add(asset);
              });
            }
          };
          remoteSnapshot.shared.forEach((shared) => {
            var _options_shared;
            const shareInfos =
              (_options_shared = options.shared) == null
                ? void 0
                : _options_shared[shared.sharedName];
            if (!shareInfos) {
              return;
            }
            // if no version, preload all shared
            const sharedOptions = shared.version
              ? shareInfos.find((s) => s.version === shared.version)
              : shareInfos;
            if (!sharedOptions) {
              return;
            }
            const arrayShareInfo = share.arrayOptions(sharedOptions);
            arrayShareInfo.forEach((s) => {
              collectSharedAssets(s, shared);
            });
          });
        }
        const needPreloadJsAssets = jsAssets.filter(
          (asset) => !loadedSharedJsAssets.has(asset),
        );
        const needPreloadCssAssets = cssAssets.filter(
          (asset) => !loadedSharedCssAssets.has(asset),
        );
        return {
          cssAssets: needPreloadCssAssets,
          jsAssetsWithoutEntry: needPreloadJsAssets,
          entryAssets,
        };
      }
      const generatePreloadAssetsPlugin = function () {
        return {
          name: 'generate-preload-assets-plugin',
          async generatePreloadAssets(args) {
            const {
              origin,
              preloadOptions,
              remoteInfo,
              remote,
              globalSnapshot,
              remoteSnapshot,
            } = args;
            if (
              share.isRemoteInfoWithEntry(remote) &&
              share.isPureRemoteEntry(remote)
            ) {
              return {
                cssAssets: [],
                jsAssetsWithoutEntry: [],
                entryAssets: [
                  {
                    name: remote.name,
                    url: remote.entry,
                    moduleInfo: {
                      name: remoteInfo.name,
                      entry: remote.entry,
                      type: remoteInfo.type || 'global',
                      entryGlobalName: '',
                      shareScope: '',
                    },
                  },
                ],
              };
            }
            assignRemoteInfo(remoteInfo, remoteSnapshot);
            const assets = generatePreloadAssets(
              origin,
              preloadOptions,
              remoteInfo,
              globalSnapshot,
              remoteSnapshot,
            );
            return assets;
          },
        };
      };

      function getGlobalRemoteInfo(moduleInfo, origin) {
        const hostGlobalSnapshot = share.getGlobalSnapshotInfoByModuleInfo({
          name: origin.options.name,
          version: origin.options.version,
        });
        // get remote detail info from global
        const globalRemoteInfo =
          hostGlobalSnapshot &&
          'remotesInfo' in hostGlobalSnapshot &&
          hostGlobalSnapshot.remotesInfo &&
          share.getInfoWithoutType(
            hostGlobalSnapshot.remotesInfo,
            moduleInfo.name,
          ).value;
        if (globalRemoteInfo && globalRemoteInfo.matchedVersion) {
          return {
            hostGlobalSnapshot,
            globalSnapshot: share.getGlobalSnapshot(),
            remoteSnapshot: share.getGlobalSnapshotInfoByModuleInfo({
              name: moduleInfo.name,
              version: globalRemoteInfo.matchedVersion,
            }),
          };
        }
        return {
          hostGlobalSnapshot: undefined,
          globalSnapshot: share.getGlobalSnapshot(),
          remoteSnapshot: share.getGlobalSnapshotInfoByModuleInfo({
            name: moduleInfo.name,
            version: 'version' in moduleInfo ? moduleInfo.version : undefined,
          }),
        };
      }
      class SnapshotHandler {
        async loadSnapshot(moduleInfo) {
          const { options } = this.HostInstance;
          const { hostGlobalSnapshot, remoteSnapshot, globalSnapshot } =
            this.getGlobalRemoteInfo(moduleInfo);
          const {
            remoteSnapshot: globalRemoteSnapshot,
            globalSnapshot: globalSnapshotRes,
          } = await this.hooks.lifecycle.loadSnapshot.emit({
            options,
            moduleInfo,
            hostGlobalSnapshot,
            remoteSnapshot,
            globalSnapshot,
          });
          return {
            remoteSnapshot: globalRemoteSnapshot,
            globalSnapshot: globalSnapshotRes,
          };
        }
        // eslint-disable-next-line max-lines-per-function
        async loadRemoteSnapshotInfo(moduleInfo) {
          const { options } = this.HostInstance;
          await this.hooks.lifecycle.beforeLoadRemoteSnapshot.emit({
            options,
            moduleInfo,
          });
          let hostSnapshot = share.getGlobalSnapshotInfoByModuleInfo({
            name: this.HostInstance.options.name,
            version: this.HostInstance.options.version,
          });
          if (!hostSnapshot) {
            hostSnapshot = {
              version: this.HostInstance.options.version || '',
              remoteEntry: '',
              remotesInfo: {},
            };
            share.addGlobalSnapshot({
              [this.HostInstance.options.name]: hostSnapshot,
            });
          }
          // In dynamic loadRemote scenarios, incomplete remotesInfo delivery may occur. In such cases, the remotesInfo in the host needs to be completed in the snapshot at runtime.
          // This ensures the snapshot's integrity and helps the chrome plugin correctly identify all producer modules, ensuring that proxyable producer modules will not be missing.
          if (
            hostSnapshot &&
            'remotesInfo' in hostSnapshot &&
            !share.getInfoWithoutType(hostSnapshot.remotesInfo, moduleInfo.name)
              .value
          ) {
            if ('version' in moduleInfo || 'entry' in moduleInfo) {
              hostSnapshot.remotesInfo = polyfills._extends(
                {},
                hostSnapshot == null ? void 0 : hostSnapshot.remotesInfo,
                {
                  [moduleInfo.name]: {
                    matchedVersion:
                      'version' in moduleInfo
                        ? moduleInfo.version
                        : moduleInfo.entry,
                  },
                },
              );
            }
          }
          const { hostGlobalSnapshot, remoteSnapshot, globalSnapshot } =
            this.getGlobalRemoteInfo(moduleInfo);
          const {
            remoteSnapshot: globalRemoteSnapshot,
            globalSnapshot: globalSnapshotRes,
          } = await this.hooks.lifecycle.loadSnapshot.emit({
            options,
            moduleInfo,
            hostGlobalSnapshot,
            remoteSnapshot,
            globalSnapshot,
          });
          let mSnapshot;
          let gSnapshot;
          // global snapshot includes manifest or module info includes manifest
          if (globalRemoteSnapshot) {
            if (sdk.isManifestProvider(globalRemoteSnapshot)) {
              const remoteEntry = sdk.isBrowserEnv()
                ? globalRemoteSnapshot.remoteEntry
                : globalRemoteSnapshot.ssrRemoteEntry ||
                  globalRemoteSnapshot.remoteEntry ||
                  '';
              const moduleSnapshot = await this.getManifestJson(
                remoteEntry,
                moduleInfo,
                {},
              );
              // eslint-disable-next-line @typescript-eslint/no-shadow
              const globalSnapshotRes = share.setGlobalSnapshotInfoByModuleInfo(
                polyfills._extends({}, moduleInfo, {
                  // The global remote may be overridden
                  // Therefore, set the snapshot key to the global address of the actual request
                  entry: remoteEntry,
                }),
                moduleSnapshot,
              );
              mSnapshot = moduleSnapshot;
              gSnapshot = globalSnapshotRes;
            } else {
              const { remoteSnapshot: remoteSnapshotRes } =
                await this.hooks.lifecycle.loadRemoteSnapshot.emit({
                  options: this.HostInstance.options,
                  moduleInfo,
                  remoteSnapshot: globalRemoteSnapshot,
                  from: 'global',
                });
              mSnapshot = remoteSnapshotRes;
              gSnapshot = globalSnapshotRes;
            }
          } else {
            if (share.isRemoteInfoWithEntry(moduleInfo)) {
              // get from manifest.json and merge remote info from remote server
              const moduleSnapshot = await this.getManifestJson(
                moduleInfo.entry,
                moduleInfo,
                {},
              );
              // eslint-disable-next-line @typescript-eslint/no-shadow
              const globalSnapshotRes = share.setGlobalSnapshotInfoByModuleInfo(
                moduleInfo,
                moduleSnapshot,
              );
              const { remoteSnapshot: remoteSnapshotRes } =
                await this.hooks.lifecycle.loadRemoteSnapshot.emit({
                  options: this.HostInstance.options,
                  moduleInfo,
                  remoteSnapshot: moduleSnapshot,
                  from: 'global',
                });
              mSnapshot = remoteSnapshotRes;
              gSnapshot = globalSnapshotRes;
            } else {
              share.error(
                errorCodes.getShortErrorMsg(
                  errorCodes.RUNTIME_007,
                  errorCodes.runtimeDescMap,
                  {
                    hostName: moduleInfo.name,
                    hostVersion: moduleInfo.version,
                    globalSnapshot: JSON.stringify(globalSnapshotRes),
                  },
                ),
              );
            }
          }
          await this.hooks.lifecycle.afterLoadSnapshot.emit({
            options,
            moduleInfo,
            remoteSnapshot: mSnapshot,
          });
          return {
            remoteSnapshot: mSnapshot,
            globalSnapshot: gSnapshot,
          };
        }
        getGlobalRemoteInfo(moduleInfo) {
          return getGlobalRemoteInfo(moduleInfo, this.HostInstance);
        }
        async getManifestJson(manifestUrl, moduleInfo, extraOptions) {
          const getManifest = async () => {
            let manifestJson = this.manifestCache.get(manifestUrl);
            if (manifestJson) {
              return manifestJson;
            }
            try {
              let res = await this.loaderHook.lifecycle.fetch.emit(
                manifestUrl,
                {},
              );
              if (!res || !(res instanceof Response)) {
                res = await fetch(manifestUrl, {});
              }
              manifestJson = await res.json();
              share.assert(
                manifestJson.metaData &&
                  manifestJson.exposes &&
                  manifestJson.shared,
                `${manifestUrl} is not a federation manifest`,
              );
              this.manifestCache.set(manifestUrl, manifestJson);
              return manifestJson;
            } catch (err) {
              delete this.manifestLoading[manifestUrl];
              share.error(
                errorCodes.getShortErrorMsg(
                  errorCodes.RUNTIME_003,
                  errorCodes.runtimeDescMap,
                  {
                    manifestUrl,
                    moduleName: moduleInfo.name,
                  },
                  `${err}`,
                ),
              );
            }
          };
          const asyncLoadProcess = async () => {
            const manifestJson = await getManifest();
            const remoteSnapshot = sdk.generateSnapshotFromManifest(
              manifestJson,
              {
                version: manifestUrl,
              },
            );
            const { remoteSnapshot: remoteSnapshotRes } =
              await this.hooks.lifecycle.loadRemoteSnapshot.emit({
                options: this.HostInstance.options,
                moduleInfo,
                manifestJson,
                remoteSnapshot,
                manifestUrl,
                from: 'manifest',
              });
            return remoteSnapshotRes;
          };
          if (!this.manifestLoading[manifestUrl]) {
            this.manifestLoading[manifestUrl] = asyncLoadProcess().then(
              (res) => res,
            );
          }
          return this.manifestLoading[manifestUrl];
        }
        constructor(HostInstance) {
          this.loadingHostSnapshot = null;
          this.manifestCache = new Map();
          this.hooks = new PluginSystem({
            beforeLoadRemoteSnapshot: new AsyncHook('beforeLoadRemoteSnapshot'),
            loadSnapshot: new AsyncWaterfallHook('loadGlobalSnapshot'),
            loadRemoteSnapshot: new AsyncWaterfallHook('loadRemoteSnapshot'),
            afterLoadSnapshot: new AsyncWaterfallHook('afterLoadSnapshot'),
          });
          this.manifestLoading =
            share.Global.__FEDERATION__.__MANIFEST_LOADING__;
          this.HostInstance = HostInstance;
          this.loaderHook = HostInstance.loaderHook;
        }
      }

      class SharedHandler {
        // register shared in shareScopeMap
        registerShared(globalOptions, userOptions) {
          const { shareInfos, shared } = share.formatShareConfigs(
            globalOptions,
            userOptions,
          );
          const sharedKeys = Object.keys(shareInfos);
          sharedKeys.forEach((sharedKey) => {
            const sharedVals = shareInfos[sharedKey];
            sharedVals.forEach((sharedVal) => {
              const registeredShared = share.getRegisteredShare(
                this.shareScopeMap,
                sharedKey,
                sharedVal,
                this.hooks.lifecycle.resolveShare,
              );
              if (!registeredShared && sharedVal && sharedVal.lib) {
                this.setShared({
                  pkgName: sharedKey,
                  lib: sharedVal.lib,
                  get: sharedVal.get,
                  loaded: true,
                  shared: sharedVal,
                  from: userOptions.name,
                });
              }
            });
          });
          return {
            shareInfos,
            shared,
          };
        }
        async loadShare(pkgName, extraOptions) {
          const { host } = this;
          // This function performs the following steps:
          // 1. Checks if the currently loaded share already exists, if not, it throws an error
          // 2. Searches globally for a matching share, if found, it uses it directly
          // 3. If not found, it retrieves it from the current share and stores the obtained share globally.
          const shareInfo = share.getTargetSharedOptions({
            pkgName,
            extraOptions,
            shareInfos: host.options.shared,
          });
          if (shareInfo == null ? void 0 : shareInfo.scope) {
            await Promise.all(
              shareInfo.scope.map(async (shareScope) => {
                await Promise.all(
                  this.initializeSharing(shareScope, {
                    strategy: shareInfo.strategy,
                  }),
                );
                return;
              }),
            );
          }
          const loadShareRes = await this.hooks.lifecycle.beforeLoadShare.emit({
            pkgName,
            shareInfo,
            shared: host.options.shared,
            origin: host,
          });
          const { shareInfo: shareInfoRes } = loadShareRes;
          // Assert that shareInfoRes exists, if not, throw an error
          share.assert(
            shareInfoRes,
            `Cannot find ${pkgName} Share in the ${host.options.name}. Please ensure that the ${pkgName} Share parameters have been injected`,
          );
          // Retrieve from cache
          const registeredShared = share.getRegisteredShare(
            this.shareScopeMap,
            pkgName,
            shareInfoRes,
            this.hooks.lifecycle.resolveShare,
          );
          const addUseIn = (shared) => {
            if (!shared.useIn) {
              shared.useIn = [];
            }
            share.addUniqueItem(shared.useIn, host.options.name);
          };
          if (registeredShared && registeredShared.lib) {
            addUseIn(registeredShared);
            return registeredShared.lib;
          } else if (
            registeredShared &&
            registeredShared.loading &&
            !registeredShared.loaded
          ) {
            const factory = await registeredShared.loading;
            registeredShared.loaded = true;
            if (!registeredShared.lib) {
              registeredShared.lib = factory;
            }
            addUseIn(registeredShared);
            return factory;
          } else if (registeredShared) {
            const asyncLoadProcess = async () => {
              const factory = await registeredShared.get();
              shareInfoRes.lib = factory;
              shareInfoRes.loaded = true;
              addUseIn(shareInfoRes);
              const gShared = share.getRegisteredShare(
                this.shareScopeMap,
                pkgName,
                shareInfoRes,
                this.hooks.lifecycle.resolveShare,
              );
              if (gShared) {
                gShared.lib = factory;
                gShared.loaded = true;
              }
              return factory;
            };
            const loading = asyncLoadProcess();
            this.setShared({
              pkgName,
              loaded: false,
              shared: registeredShared,
              from: host.options.name,
              lib: null,
              loading,
            });
            return loading;
          } else {
            if (extraOptions == null ? void 0 : extraOptions.customShareInfo) {
              return false;
            }
            const asyncLoadProcess = async () => {
              const factory = await shareInfoRes.get();
              shareInfoRes.lib = factory;
              shareInfoRes.loaded = true;
              addUseIn(shareInfoRes);
              const gShared = share.getRegisteredShare(
                this.shareScopeMap,
                pkgName,
                shareInfoRes,
                this.hooks.lifecycle.resolveShare,
              );
              if (gShared) {
                gShared.lib = factory;
                gShared.loaded = true;
              }
              return factory;
            };
            const loading = asyncLoadProcess();
            this.setShared({
              pkgName,
              loaded: false,
              shared: shareInfoRes,
              from: host.options.name,
              lib: null,
              loading,
            });
            return loading;
          }
        }
        /**
         * This function initializes the sharing sequence (executed only once per share scope).
         * It accepts one argument, the name of the share scope.
         * If the share scope does not exist, it creates one.
         */ // eslint-disable-next-line @typescript-eslint/member-ordering
        initializeSharing(shareScopeName = share.DEFAULT_SCOPE, extraOptions) {
          const { host } = this;
          const from = extraOptions == null ? void 0 : extraOptions.from;
          const strategy =
            extraOptions == null ? void 0 : extraOptions.strategy;
          let initScope =
            extraOptions == null ? void 0 : extraOptions.initScope;
          const promises = [];
          if (from !== 'build') {
            const { initTokens } = this;
            if (!initScope) initScope = [];
            let initToken = initTokens[shareScopeName];
            if (!initToken)
              initToken = initTokens[shareScopeName] = {
                from: this.host.name,
              };
            if (initScope.indexOf(initToken) >= 0) return promises;
            initScope.push(initToken);
          }
          const shareScope = this.shareScopeMap;
          const hostName = host.options.name;
          // Creates a new share scope if necessary
          if (!shareScope[shareScopeName]) {
            shareScope[shareScopeName] = {};
          }
          // Executes all initialization snippets from all accessible modules
          const scope = shareScope[shareScopeName];
          const register = (name, shared) => {
            var _activeVersion_shareConfig;
            const { version, eager } = shared;
            scope[name] = scope[name] || {};
            const versions = scope[name];
            const activeVersion = versions[version];
            const activeVersionEager = Boolean(
              activeVersion &&
                (activeVersion.eager ||
                  ((_activeVersion_shareConfig = activeVersion.shareConfig) ==
                  null
                    ? void 0
                    : _activeVersion_shareConfig.eager)),
            );
            if (
              !activeVersion ||
              (activeVersion.strategy !== 'loaded-first' &&
                !activeVersion.loaded &&
                (Boolean(!eager) !== !activeVersionEager
                  ? eager
                  : hostName > activeVersion.from))
            ) {
              versions[version] = shared;
            }
          };
          const initFn = (mod) =>
            mod && mod.init && mod.init(shareScope[shareScopeName], initScope);
          const initRemoteModule = async (key) => {
            const { module } =
              await host.remoteHandler.getRemoteModuleAndOptions({
                id: key,
              });
            if (module.getEntry) {
              let remoteEntryExports;
              try {
                remoteEntryExports = await module.getEntry();
              } catch (error) {
                remoteEntryExports =
                  await host.remoteHandler.hooks.lifecycle.errorLoadRemote.emit(
                    {
                      id: key,
                      error,
                      from: 'runtime',
                      lifecycle: 'beforeLoadShare',
                      origin: host,
                    },
                  );
              }
              if (!module.inited) {
                await initFn(remoteEntryExports);
                module.inited = true;
              }
            }
          };
          Object.keys(host.options.shared).forEach((shareName) => {
            const sharedArr = host.options.shared[shareName];
            sharedArr.forEach((shared) => {
              if (shared.scope.includes(shareScopeName)) {
                register(shareName, shared);
              }
            });
          });
          // TODO: strategy==='version-first' need to be removed in the future
          if (
            host.options.shareStrategy === 'version-first' ||
            strategy === 'version-first'
          ) {
            host.options.remotes.forEach((remote) => {
              if (remote.shareScope === shareScopeName) {
                promises.push(initRemoteModule(remote.name));
              }
            });
          }
          return promises;
        }
        // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
        // 1. If the loaded shared already exists globally, then it will be reused
        // 2. If lib exists in local shared, it will be used directly
        // 3. If the local get returns something other than Promise, then it will be used directly
        loadShareSync(pkgName, extraOptions) {
          const { host } = this;
          const shareInfo = share.getTargetSharedOptions({
            pkgName,
            extraOptions,
            shareInfos: host.options.shared,
          });
          if (shareInfo == null ? void 0 : shareInfo.scope) {
            shareInfo.scope.forEach((shareScope) => {
              this.initializeSharing(shareScope, {
                strategy: shareInfo.strategy,
              });
            });
          }
          const registeredShared = share.getRegisteredShare(
            this.shareScopeMap,
            pkgName,
            shareInfo,
            this.hooks.lifecycle.resolveShare,
          );
          const addUseIn = (shared) => {
            if (!shared.useIn) {
              shared.useIn = [];
            }
            share.addUniqueItem(shared.useIn, host.options.name);
          };
          if (registeredShared) {
            if (typeof registeredShared.lib === 'function') {
              addUseIn(registeredShared);
              if (!registeredShared.loaded) {
                registeredShared.loaded = true;
                if (registeredShared.from === host.options.name) {
                  shareInfo.loaded = true;
                }
              }
              return registeredShared.lib;
            }
            if (typeof registeredShared.get === 'function') {
              const module = registeredShared.get();
              if (!(module instanceof Promise)) {
                addUseIn(registeredShared);
                this.setShared({
                  pkgName,
                  loaded: true,
                  from: host.options.name,
                  lib: module,
                  shared: registeredShared,
                });
                return module;
              }
            }
          }
          if (shareInfo.lib) {
            if (!shareInfo.loaded) {
              shareInfo.loaded = true;
            }
            return shareInfo.lib;
          }
          if (shareInfo.get) {
            const module = shareInfo.get();
            if (module instanceof Promise) {
              const errorCode =
                (extraOptions == null ? void 0 : extraOptions.from) === 'build'
                  ? errorCodes.RUNTIME_005
                  : errorCodes.RUNTIME_006;
              throw new Error(
                errorCodes.getShortErrorMsg(
                  errorCode,
                  errorCodes.runtimeDescMap,
                  {
                    hostName: host.options.name,
                    sharedPkgName: pkgName,
                  },
                ),
              );
            }
            shareInfo.lib = module;
            this.setShared({
              pkgName,
              loaded: true,
              from: host.options.name,
              lib: shareInfo.lib,
              shared: shareInfo,
            });
            return shareInfo.lib;
          }
          throw new Error(
            errorCodes.getShortErrorMsg(
              errorCodes.RUNTIME_006,
              errorCodes.runtimeDescMap,
              {
                hostName: host.options.name,
                sharedPkgName: pkgName,
              },
            ),
          );
        }
        initShareScopeMap(scopeName, shareScope, extraOptions = {}) {
          const { host } = this;
          this.shareScopeMap[scopeName] = shareScope;
          this.hooks.lifecycle.initContainerShareScopeMap.emit({
            shareScope,
            options: host.options,
            origin: host,
            scopeName,
            hostShareScopeMap: extraOptions.hostShareScopeMap,
          });
        }
        setShared({ pkgName, shared, from, lib, loading, loaded, get }) {
          const { version, scope = 'default' } = shared,
            shareInfo = polyfills._object_without_properties_loose(shared, [
              'version',
              'scope',
            ]);
          const scopes = Array.isArray(scope) ? scope : [scope];
          scopes.forEach((sc) => {
            if (!this.shareScopeMap[sc]) {
              this.shareScopeMap[sc] = {};
            }
            if (!this.shareScopeMap[sc][pkgName]) {
              this.shareScopeMap[sc][pkgName] = {};
            }
            if (!this.shareScopeMap[sc][pkgName][version]) {
              this.shareScopeMap[sc][pkgName][version] = polyfills._extends(
                {
                  version,
                  scope: ['default'],
                },
                shareInfo,
                {
                  lib,
                  loaded,
                  loading,
                },
              );
              if (get) {
                this.shareScopeMap[sc][pkgName][version].get = get;
              }
              return;
            }
            const registeredShared = this.shareScopeMap[sc][pkgName][version];
            if (loading && !registeredShared.loading) {
              registeredShared.loading = loading;
            }
          });
        }
        _setGlobalShareScopeMap(hostOptions) {
          const globalShareScopeMap = share.getGlobalShareScope();
          const identifier = hostOptions.id || hostOptions.name;
          if (identifier && !globalShareScopeMap[identifier]) {
            globalShareScopeMap[identifier] = this.shareScopeMap;
          }
        }
        constructor(host) {
          this.hooks = new PluginSystem({
            afterResolve: new AsyncWaterfallHook('afterResolve'),
            beforeLoadShare: new AsyncWaterfallHook('beforeLoadShare'),
            // not used yet
            loadShare: new AsyncHook(),
            resolveShare: new SyncWaterfallHook('resolveShare'),
            // maybe will change, temporarily for internal use only
            initContainerShareScopeMap: new SyncWaterfallHook(
              'initContainerShareScopeMap',
            ),
          });
          this.host = host;
          this.shareScopeMap = {};
          this.initTokens = {};
          this._setGlobalShareScopeMap(host.options);
        }
      }

      class RemoteHandler {
        formatAndRegisterRemote(globalOptions, userOptions) {
          const userRemotes = userOptions.remotes || [];
          return userRemotes.reduce((res, remote) => {
            this.registerRemote(remote, res, {
              force: false,
            });
            return res;
          }, globalOptions.remotes);
        }
        setIdToRemoteMap(id, remoteMatchInfo) {
          const { remote, expose } = remoteMatchInfo;
          const { name, alias } = remote;
          this.idToRemoteMap[id] = {
            name: remote.name,
            expose,
          };
          if (alias && id.startsWith(name)) {
            const idWithAlias = id.replace(name, alias);
            this.idToRemoteMap[idWithAlias] = {
              name: remote.name,
              expose,
            };
            return;
          }
          if (alias && id.startsWith(alias)) {
            const idWithName = id.replace(alias, name);
            this.idToRemoteMap[idWithName] = {
              name: remote.name,
              expose,
            };
          }
        }
        // eslint-disable-next-line max-lines-per-function
        // eslint-disable-next-line @typescript-eslint/member-ordering
        async loadRemote(id, options) {
          const { host } = this;
          try {
            const { loadFactory = true } = options || {
              loadFactory: true,
            };
            // 1. Validate the parameters of the retrieved module. There are two module request methods: pkgName + expose and alias + expose.
            // 2. Request the snapshot information of the current host and globally store the obtained snapshot information. The retrieved module information is partially offline and partially online. The online module information will retrieve the modules used online.
            // 3. Retrieve the detailed information of the current module from global (remoteEntry address, expose resource address)
            // 4. After retrieving remoteEntry, call the init of the module, and then retrieve the exported content of the module through get
            // id: pkgName(@federation/app1) + expose(button) = @federation/app1/button
            // id: alias(app1) + expose(button) = app1/button
            // id: alias(app1/utils) + expose(loadash/sort) = app1/utils/loadash/sort
            const { module, moduleOptions, remoteMatchInfo } =
              await this.getRemoteModuleAndOptions({
                id,
              });
            const {
              pkgNameOrAlias,
              remote,
              expose,
              id: idRes,
              remoteSnapshot,
            } = remoteMatchInfo;
            const moduleOrFactory = await module.get(
              idRes,
              expose,
              options,
              remoteSnapshot,
            );
            const moduleWrapper = await this.hooks.lifecycle.onLoad.emit({
              id: idRes,
              pkgNameOrAlias,
              expose,
              exposeModule: loadFactory ? moduleOrFactory : undefined,
              exposeModuleFactory: loadFactory ? undefined : moduleOrFactory,
              remote,
              options: moduleOptions,
              moduleInstance: module,
              origin: host,
            });
            this.setIdToRemoteMap(id, remoteMatchInfo);
            if (typeof moduleWrapper === 'function') {
              return moduleWrapper;
            }
            return moduleOrFactory;
          } catch (error) {
            const { from = 'runtime' } = options || {
              from: 'runtime',
            };
            const failOver = await this.hooks.lifecycle.errorLoadRemote.emit({
              id,
              error,
              from,
              lifecycle: 'onLoad',
              origin: host,
            });
            if (!failOver) {
              throw error;
            }
            return failOver;
          }
        }
        // eslint-disable-next-line @typescript-eslint/member-ordering
        async preloadRemote(preloadOptions) {
          const { host } = this;
          await this.hooks.lifecycle.beforePreloadRemote.emit({
            preloadOps: preloadOptions,
            options: host.options,
            origin: host,
          });
          const preloadOps = formatPreloadArgs(
            host.options.remotes,
            preloadOptions,
          );
          await Promise.all(
            preloadOps.map(async (ops) => {
              const { remote } = ops;
              const remoteInfo = getRemoteInfo(remote);
              const { globalSnapshot, remoteSnapshot } =
                await host.snapshotHandler.loadRemoteSnapshotInfo(remote);
              const assets =
                await this.hooks.lifecycle.generatePreloadAssets.emit({
                  origin: host,
                  preloadOptions: ops,
                  remote,
                  remoteInfo,
                  globalSnapshot,
                  remoteSnapshot,
                });
              if (!assets) {
                return;
              }
              preloadAssets(remoteInfo, host, assets);
            }),
          );
        }
        registerRemotes(remotes, options) {
          const { host } = this;
          remotes.forEach((remote) => {
            this.registerRemote(remote, host.options.remotes, {
              force: options == null ? void 0 : options.force,
            });
          });
        }
        async getRemoteModuleAndOptions(options) {
          const { host } = this;
          const { id } = options;
          let loadRemoteArgs;
          try {
            loadRemoteArgs = await this.hooks.lifecycle.beforeRequest.emit({
              id,
              options: host.options,
              origin: host,
            });
          } catch (error) {
            loadRemoteArgs = await this.hooks.lifecycle.errorLoadRemote.emit({
              id,
              options: host.options,
              origin: host,
              from: 'runtime',
              error,
              lifecycle: 'beforeRequest',
            });
            if (!loadRemoteArgs) {
              throw error;
            }
          }
          const { id: idRes } = loadRemoteArgs;
          const remoteSplitInfo = matchRemoteWithNameAndExpose(
            host.options.remotes,
            idRes,
          );
          share.assert(
            remoteSplitInfo,
            errorCodes.getShortErrorMsg(
              errorCodes.RUNTIME_004,
              errorCodes.runtimeDescMap,
              {
                hostName: host.options.name,
                requestId: idRes,
              },
            ),
          );
          const { remote: rawRemote } = remoteSplitInfo;
          const remoteInfo = getRemoteInfo(rawRemote);
          const matchInfo =
            await host.sharedHandler.hooks.lifecycle.afterResolve.emit(
              polyfills._extends(
                {
                  id: idRes,
                },
                remoteSplitInfo,
                {
                  options: host.options,
                  origin: host,
                  remoteInfo,
                },
              ),
            );
          const { remote, expose } = matchInfo;
          share.assert(
            remote && expose,
            `The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${idRes}.`,
          );
          let module = host.moduleCache.get(remote.name);
          const moduleOptions = {
            host: host,
            remoteInfo,
          };
          if (!module) {
            module = new Module(moduleOptions);
            host.moduleCache.set(remote.name, module);
          }
          return {
            module,
            moduleOptions,
            remoteMatchInfo: matchInfo,
          };
        }
        registerRemote(remote, targetRemotes, options) {
          const { host } = this;
          const normalizeRemote = () => {
            if (remote.alias) {
              // Validate if alias equals the prefix of remote.name and remote.alias, if so, throw an error
              // As multi-level path references cannot guarantee unique names, alias being a prefix of remote.name is not supported
              const findEqual = targetRemotes.find((item) => {
                var _item_alias;
                return (
                  remote.alias &&
                  (item.name.startsWith(remote.alias) ||
                    ((_item_alias = item.alias) == null
                      ? void 0
                      : _item_alias.startsWith(remote.alias)))
                );
              });
              share.assert(
                !findEqual,
                `The alias ${remote.alias} of remote ${remote.name} is not allowed to be the prefix of ${findEqual && findEqual.name} name or alias`,
              );
            }
            // Set the remote entry to a complete path
            if ('entry' in remote) {
              if (sdk.isBrowserEnv() && !remote.entry.startsWith('http')) {
                remote.entry = new URL(
                  remote.entry,
                  window.location.origin,
                ).href;
              }
            }
            if (!remote.shareScope) {
              remote.shareScope = share.DEFAULT_SCOPE;
            }
            if (!remote.type) {
              remote.type = share.DEFAULT_REMOTE_TYPE;
            }
          };
          this.hooks.lifecycle.beforeRegisterRemote.emit({
            remote,
            origin: host,
          });
          const registeredRemote = targetRemotes.find(
            (item) => item.name === remote.name,
          );
          if (!registeredRemote) {
            normalizeRemote();
            targetRemotes.push(remote);
            this.hooks.lifecycle.registerRemote.emit({
              remote,
              origin: host,
            });
          } else {
            const messages = [
              `The remote "${remote.name}" is already registered.`,
              'Please note that overriding it may cause unexpected errors.',
            ];
            if (options == null ? void 0 : options.force) {
              // remove registered remote
              this.removeRemote(registeredRemote);
              normalizeRemote();
              targetRemotes.push(remote);
              this.hooks.lifecycle.registerRemote.emit({
                remote,
                origin: host,
              });
              sdk.warn(messages.join(' '));
            }
          }
        }
        removeRemote(remote) {
          try {
            const { host } = this;
            const { name } = remote;
            const remoteIndex = host.options.remotes.findIndex(
              (item) => item.name === name,
            );
            if (remoteIndex !== -1) {
              host.options.remotes.splice(remoteIndex, 1);
            }
            const loadedModule = host.moduleCache.get(remote.name);
            if (loadedModule) {
              const remoteInfo = loadedModule.remoteInfo;
              const key = remoteInfo.entryGlobalName;
              if (share.CurrentGlobal[key]) {
                var _Object_getOwnPropertyDescriptor;
                if (
                  (_Object_getOwnPropertyDescriptor =
                    Object.getOwnPropertyDescriptor(
                      share.CurrentGlobal,
                      key,
                    )) == null
                    ? void 0
                    : _Object_getOwnPropertyDescriptor.configurable
                ) {
                  delete share.CurrentGlobal[key];
                } else {
                  // @ts-ignore
                  share.CurrentGlobal[key] = undefined;
                }
              }
              const remoteEntryUniqueKey = getRemoteEntryUniqueKey(
                loadedModule.remoteInfo,
              );
              if (share.globalLoading[remoteEntryUniqueKey]) {
                delete share.globalLoading[remoteEntryUniqueKey];
              }
              host.snapshotHandler.manifestCache.delete(remoteInfo.entry);
              // delete unloaded shared and instance
              let remoteInsId = remoteInfo.buildVersion
                ? sdk.composeKeyWithSeparator(
                    remoteInfo.name,
                    remoteInfo.buildVersion,
                  )
                : remoteInfo.name;
              const remoteInsIndex =
                share.CurrentGlobal.__FEDERATION__.__INSTANCES__.findIndex(
                  (ins) => {
                    if (remoteInfo.buildVersion) {
                      return ins.options.id === remoteInsId;
                    } else {
                      return ins.name === remoteInsId;
                    }
                  },
                );
              if (remoteInsIndex !== -1) {
                const remoteIns =
                  share.CurrentGlobal.__FEDERATION__.__INSTANCES__[
                    remoteInsIndex
                  ];
                remoteInsId = remoteIns.options.id || remoteInsId;
                const globalShareScopeMap = share.getGlobalShareScope();
                let isAllSharedNotUsed = true;
                const needDeleteKeys = [];
                Object.keys(globalShareScopeMap).forEach((instId) => {
                  const shareScopeMap = globalShareScopeMap[instId];
                  shareScopeMap &&
                    Object.keys(shareScopeMap).forEach((shareScope) => {
                      const shareScopeVal = shareScopeMap[shareScope];
                      shareScopeVal &&
                        Object.keys(shareScopeVal).forEach((shareName) => {
                          const sharedPkgs = shareScopeVal[shareName];
                          sharedPkgs &&
                            Object.keys(sharedPkgs).forEach((shareVersion) => {
                              const shared = sharedPkgs[shareVersion];
                              if (
                                shared &&
                                typeof shared === 'object' &&
                                shared.from === remoteInfo.name
                              ) {
                                if (shared.loaded || shared.loading) {
                                  shared.useIn = shared.useIn.filter(
                                    (usedHostName) =>
                                      usedHostName !== remoteInfo.name,
                                  );
                                  if (shared.useIn.length) {
                                    isAllSharedNotUsed = false;
                                  } else {
                                    needDeleteKeys.push([
                                      instId,
                                      shareScope,
                                      shareName,
                                      shareVersion,
                                    ]);
                                  }
                                } else {
                                  needDeleteKeys.push([
                                    instId,
                                    shareScope,
                                    shareName,
                                    shareVersion,
                                  ]);
                                }
                              }
                            });
                        });
                    });
                });
                if (isAllSharedNotUsed) {
                  remoteIns.shareScopeMap = {};
                  delete globalShareScopeMap[remoteInsId];
                }
                needDeleteKeys.forEach(
                  ([insId, shareScope, shareName, shareVersion]) => {
                    var _globalShareScopeMap_insId_shareScope_shareName,
                      _globalShareScopeMap_insId_shareScope,
                      _globalShareScopeMap_insId;
                    (_globalShareScopeMap_insId = globalShareScopeMap[insId]) ==
                    null
                      ? true
                      : (_globalShareScopeMap_insId_shareScope =
                            _globalShareScopeMap_insId[shareScope]) == null
                        ? true
                        : (_globalShareScopeMap_insId_shareScope_shareName =
                              _globalShareScopeMap_insId_shareScope[
                                shareName
                              ]) == null
                          ? true
                          : delete _globalShareScopeMap_insId_shareScope_shareName[
                              shareVersion
                            ];
                  },
                );
                share.CurrentGlobal.__FEDERATION__.__INSTANCES__.splice(
                  remoteInsIndex,
                  1,
                );
              }
              const { hostGlobalSnapshot } = getGlobalRemoteInfo(remote, host);
              if (hostGlobalSnapshot) {
                const remoteKey =
                  hostGlobalSnapshot &&
                  'remotesInfo' in hostGlobalSnapshot &&
                  hostGlobalSnapshot.remotesInfo &&
                  share.getInfoWithoutType(
                    hostGlobalSnapshot.remotesInfo,
                    remote.name,
                  ).key;
                if (remoteKey) {
                  delete hostGlobalSnapshot.remotesInfo[remoteKey];
                  if (
                    //eslint-disable-next-line no-extra-boolean-cast
                    Boolean(
                      share.Global.__FEDERATION__.__MANIFEST_LOADING__[
                        remoteKey
                      ],
                    )
                  ) {
                    delete share.Global.__FEDERATION__.__MANIFEST_LOADING__[
                      remoteKey
                    ];
                  }
                }
              }
              host.moduleCache.delete(remote.name);
            }
          } catch (err) {
            share.logger.log('removeRemote fail: ', err);
          }
        }
        constructor(host) {
          this.hooks = new PluginSystem({
            beforeRegisterRemote: new SyncWaterfallHook('beforeRegisterRemote'),
            registerRemote: new SyncWaterfallHook('registerRemote'),
            beforeRequest: new AsyncWaterfallHook('beforeRequest'),
            onLoad: new AsyncHook('onLoad'),
            handlePreloadModule: new SyncHook('handlePreloadModule'),
            errorLoadRemote: new AsyncHook('errorLoadRemote'),
            beforePreloadRemote: new AsyncHook('beforePreloadRemote'),
            generatePreloadAssets: new AsyncHook('generatePreloadAssets'),
            // not used yet
            afterPreloadRemote: new AsyncHook(),
            loadEntry: new AsyncHook(),
          });
          this.host = host;
          this.idToRemoteMap = {};
        }
      }

      class FederationHost {
        initOptions(userOptions) {
          this.registerPlugins(userOptions.plugins);
          const options = this.formatOptions(this.options, userOptions);
          this.options = options;
          return options;
        }
        async loadShare(pkgName, extraOptions) {
          return this.sharedHandler.loadShare(pkgName, extraOptions);
        }
        // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
        // 1. If the loaded shared already exists globally, then it will be reused
        // 2. If lib exists in local shared, it will be used directly
        // 3. If the local get returns something other than Promise, then it will be used directly
        loadShareSync(pkgName, extraOptions) {
          return this.sharedHandler.loadShareSync(pkgName, extraOptions);
        }
        initializeSharing(shareScopeName = share.DEFAULT_SCOPE, extraOptions) {
          return this.sharedHandler.initializeSharing(
            shareScopeName,
            extraOptions,
          );
        }
        initRawContainer(name, url, container) {
          const remoteInfo = getRemoteInfo({
            name,
            entry: url,
          });
          const module = new Module({
            host: this,
            remoteInfo,
          });
          module.remoteEntryExports = container;
          this.moduleCache.set(name, module);
          return module;
        }
        // eslint-disable-next-line max-lines-per-function
        // eslint-disable-next-line @typescript-eslint/member-ordering
        async loadRemote(id, options) {
          return this.remoteHandler.loadRemote(id, options);
        }
        // eslint-disable-next-line @typescript-eslint/member-ordering
        async preloadRemote(preloadOptions) {
          return this.remoteHandler.preloadRemote(preloadOptions);
        }
        initShareScopeMap(scopeName, shareScope, extraOptions = {}) {
          this.sharedHandler.initShareScopeMap(
            scopeName,
            shareScope,
            extraOptions,
          );
        }
        formatOptions(globalOptions, userOptions) {
          const { shared } = share.formatShareConfigs(
            globalOptions,
            userOptions,
          );
          const { userOptions: userOptionsRes, options: globalOptionsRes } =
            this.hooks.lifecycle.beforeInit.emit({
              origin: this,
              userOptions,
              options: globalOptions,
              shareInfo: shared,
            });
          const remotes = this.remoteHandler.formatAndRegisterRemote(
            globalOptionsRes,
            userOptionsRes,
          );
          const { shared: handledShared } = this.sharedHandler.registerShared(
            globalOptionsRes,
            userOptionsRes,
          );
          const plugins = [...globalOptionsRes.plugins];
          if (userOptionsRes.plugins) {
            userOptionsRes.plugins.forEach((plugin) => {
              if (!plugins.includes(plugin)) {
                plugins.push(plugin);
              }
            });
          }
          const optionsRes = polyfills._extends(
            {},
            globalOptions,
            userOptions,
            {
              plugins,
              remotes,
              shared: handledShared,
            },
          );
          this.hooks.lifecycle.init.emit({
            origin: this,
            options: optionsRes,
          });
          return optionsRes;
        }
        registerPlugins(plugins) {
          const pluginRes = registerPlugins$1(plugins, [
            this.hooks,
            this.remoteHandler.hooks,
            this.sharedHandler.hooks,
            this.snapshotHandler.hooks,
            this.loaderHook,
            this.bridgeHook,
          ]);
          // Merge plugin
          this.options.plugins = this.options.plugins.reduce((res, plugin) => {
            if (!plugin) return res;
            if (res && !res.find((item) => item.name === plugin.name)) {
              res.push(plugin);
            }
            return res;
          }, pluginRes || []);
        }
        registerRemotes(remotes, options) {
          return this.remoteHandler.registerRemotes(remotes, options);
        }
        constructor(userOptions) {
          this.hooks = new PluginSystem({
            beforeInit: new SyncWaterfallHook('beforeInit'),
            init: new SyncHook(),
            // maybe will change, temporarily for internal use only
            beforeInitContainer: new AsyncWaterfallHook('beforeInitContainer'),
            // maybe will change, temporarily for internal use only
            initContainer: new AsyncWaterfallHook('initContainer'),
          });
          this.version = '0.8.3';
          this.moduleCache = new Map();
          this.loaderHook = new PluginSystem({
            // FIXME: may not be suitable , not open to the public yet
            getModuleInfo: new SyncHook(),
            createScript: new SyncHook(),
            createLink: new SyncHook(),
            fetch: new AsyncHook(),
            loadEntryError: new AsyncHook(),
            getModuleFactory: new AsyncHook(),
          });
          this.bridgeHook = new PluginSystem({
            beforeBridgeRender: new SyncHook(),
            afterBridgeRender: new SyncHook(),
            beforeBridgeDestroy: new SyncHook(),
            afterBridgeDestroy: new SyncHook(),
          });
          // TODO: Validate the details of the options
          // Initialize options with default values
          const defaultOptions = {
            id: share.getBuilderId(),
            name: userOptions.name,
            plugins: [snapshotPlugin(), generatePreloadAssetsPlugin()],
            remotes: [],
            shared: {},
            inBrowser: sdk.isBrowserEnv(),
          };
          this.name = userOptions.name;
          this.options = defaultOptions;
          this.snapshotHandler = new SnapshotHandler(this);
          this.sharedHandler = new SharedHandler(this);
          this.remoteHandler = new RemoteHandler(this);
          this.shareScopeMap = this.sharedHandler.shareScopeMap;
          this.registerPlugins([
            ...defaultOptions.plugins,
            ...(userOptions.plugins || []),
          ]);
          this.options = this.formatOptions(defaultOptions, userOptions);
        }
      }

      let FederationInstance = null;
      function init(options) {
        // Retrieve the same instance with the same name
        const instance = share.getGlobalFederationInstance(
          options.name,
          options.version,
        );
        if (!instance) {
          // Retrieve debug constructor
          const FederationConstructor =
            share.getGlobalFederationConstructor() || FederationHost;
          FederationInstance = new FederationConstructor(options);
          share.setGlobalFederationInstance(FederationInstance);
          return FederationInstance;
        } else {
          // Merge options
          instance.initOptions(options);
          if (!FederationInstance) {
            FederationInstance = instance;
          }
          return instance;
        }
      }
      function loadRemote(...args) {
        share.assert(FederationInstance, 'Please call init first');
        const loadRemote1 = FederationInstance.loadRemote;
        // eslint-disable-next-line prefer-spread
        return loadRemote1.apply(FederationInstance, args);
      }
      function loadShare(...args) {
        share.assert(FederationInstance, 'Please call init first');
        // eslint-disable-next-line prefer-spread
        const loadShare1 = FederationInstance.loadShare;
        return loadShare1.apply(FederationInstance, args);
      }
      function loadShareSync(...args) {
        share.assert(FederationInstance, 'Please call init first');
        const loadShareSync1 = FederationInstance.loadShareSync;
        // eslint-disable-next-line prefer-spread
        return loadShareSync1.apply(FederationInstance, args);
      }
      function preloadRemote(...args) {
        share.assert(FederationInstance, 'Please call init first');
        // eslint-disable-next-line prefer-spread
        return FederationInstance.preloadRemote.apply(FederationInstance, args);
      }
      function registerRemotes(...args) {
        share.assert(FederationInstance, 'Please call init first');
        // eslint-disable-next-line prefer-spread
        return FederationInstance.registerRemotes.apply(
          FederationInstance,
          args,
        );
      }
      function registerPlugins(...args) {
        share.assert(FederationInstance, 'Please call init first');
        // eslint-disable-next-line prefer-spread
        return FederationInstance.registerPlugins.apply(
          FederationInstance,
          args,
        );
      }
      function getInstance() {
        return FederationInstance;
      }
      // Inject for debug
      share.setGlobalFederationConstructor(FederationHost);

      Object.defineProperty(exports, 'loadScript', {
        enumerable: true,
        get: function () {
          return sdk.loadScript;
        },
      });
      Object.defineProperty(exports, 'loadScriptNode', {
        enumerable: true,
        get: function () {
          return sdk.loadScriptNode;
        },
      });
      exports.registerGlobalPlugins = share.registerGlobalPlugins;
      exports.FederationHost = FederationHost;
      exports.Module = Module;
      exports.getInstance = getInstance;
      exports.getRemoteEntry = getRemoteEntry;
      exports.getRemoteInfo = getRemoteInfo;
      exports.init = init;
      exports.loadRemote = loadRemote;
      exports.loadShare = loadShare;
      exports.loadShareSync = loadShareSync;
      exports.preloadRemote = preloadRemote;
      exports.registerPlugins = registerPlugins;
      exports.registerRemotes = registerRemotes;

      /***/
    },

  /***/ 267:
    /*!****************************************************!*\
  !*** ../../../../../runtime/dist/polyfills.cjs.js ***!
  \****************************************************/
    /***/ (__unused_webpack_module, exports) => {
      function _extends() {
        _extends =
          Object.assign ||
          function assign(target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source)
                if (Object.prototype.hasOwnProperty.call(source, key))
                  target[key] = source[key];
            }
            return target;
          };
        return _extends.apply(this, arguments);
      }

      function _object_without_properties_loose(source, excluded) {
        if (source == null) return {};
        var target = {};
        var sourceKeys = Object.keys(source);
        var key, i;
        for (i = 0; i < sourceKeys.length; i++) {
          key = sourceKeys[i];
          if (excluded.indexOf(key) >= 0) continue;
          target[key] = source[key];
        }
        return target;
      }

      exports._extends = _extends;
      exports._object_without_properties_loose =
        _object_without_properties_loose;

      /***/
    },

  /***/ 188:
    /*!************************************************!*\
  !*** ../../../../../runtime/dist/share.cjs.js ***!
  \************************************************/
    /***/ (__unused_webpack_module, exports, __webpack_require__) => {
      var polyfills = __webpack_require__(/*! ./polyfills.cjs.js */ 267);
      var sdk = __webpack_require__(/*! @module-federation/sdk */ 463);

      function getBuilderId() {
        //@ts-ignore
        return true ? 'layers_container_2:0.8.3' : 0;
      }

      const LOG_CATEGORY = '[ Federation Runtime ]';
      // FIXME: pre-bundle ?
      const logger = sdk.createLogger(LOG_CATEGORY);
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      function assert(condition, msg) {
        if (!condition) {
          error(msg);
        }
      }
      function error(msg) {
        if (msg instanceof Error) {
          msg.message = `${LOG_CATEGORY}: ${msg.message}`;
          throw msg;
        }
        throw new Error(`${LOG_CATEGORY}: ${msg}`);
      }
      function warn(msg) {
        if (msg instanceof Error) {
          msg.message = `${LOG_CATEGORY}: ${msg.message}`;
          logger.warn(msg);
        } else {
          logger.warn(msg);
        }
      }

      function addUniqueItem(arr, item) {
        if (arr.findIndex((name) => name === item) === -1) {
          arr.push(item);
        }
        return arr;
      }
      function getFMId(remoteInfo) {
        if ('version' in remoteInfo && remoteInfo.version) {
          return `${remoteInfo.name}:${remoteInfo.version}`;
        } else if ('entry' in remoteInfo && remoteInfo.entry) {
          return `${remoteInfo.name}:${remoteInfo.entry}`;
        } else {
          return `${remoteInfo.name}`;
        }
      }
      function isRemoteInfoWithEntry(remote) {
        return typeof remote.entry !== 'undefined';
      }
      function isPureRemoteEntry(remote) {
        return !remote.entry.includes('.json') && remote.entry.includes('.js');
      }
      function isObject(val) {
        return val && typeof val === 'object';
      }
      const objectToString = Object.prototype.toString;
      // eslint-disable-next-line @typescript-eslint/ban-types
      function isPlainObject(val) {
        return objectToString.call(val) === '[object Object]';
      }
      function arrayOptions(options) {
        return Array.isArray(options) ? options : [options];
      }
      function getRemoteEntryInfoFromSnapshot(snapshot) {
        const defaultRemoteEntryInfo = {
          url: '',
          type: 'global',
          globalName: '',
        };
        if (sdk.isBrowserEnv()) {
          return 'remoteEntry' in snapshot
            ? {
                url: snapshot.remoteEntry,
                type: snapshot.remoteEntryType,
                globalName: snapshot.globalName,
              }
            : defaultRemoteEntryInfo;
        }
        if ('ssrRemoteEntry' in snapshot) {
          return {
            url: snapshot.ssrRemoteEntry || defaultRemoteEntryInfo.url,
            type: snapshot.ssrRemoteEntryType || defaultRemoteEntryInfo.type,
            globalName: snapshot.globalName,
          };
        }
        return defaultRemoteEntryInfo;
      }
      const processModuleAlias = (name, subPath) => {
        // @host/ ./button -> @host/button
        let moduleName;
        if (name.endsWith('/')) {
          moduleName = name.slice(0, -1);
        } else {
          moduleName = name;
        }
        if (subPath.startsWith('.')) {
          subPath = subPath.slice(1);
        }
        moduleName = moduleName + subPath;
        return moduleName;
      };

      const CurrentGlobal =
        typeof globalThis === 'object' ? globalThis : window;
      const nativeGlobal = (() => {
        try {
          // get real window (incase of sandbox)
          return document.defaultView;
        } catch (e) {
          // node env
          return CurrentGlobal;
        }
      })();
      const Global = nativeGlobal;
      function definePropertyGlobalVal(target, key, val) {
        Object.defineProperty(target, key, {
          value: val,
          configurable: false,
          writable: true,
        });
      }
      function includeOwnProperty(target, key) {
        return Object.hasOwnProperty.call(target, key);
      }
      // This section is to prevent encapsulation by certain microfrontend frameworks. Due to reuse policies, sandbox escapes.
      // The sandbox in the microfrontend does not replicate the value of 'configurable'.
      // If there is no loading content on the global object, this section defines the loading object.
      if (
        !includeOwnProperty(CurrentGlobal, '__GLOBAL_LOADING_REMOTE_ENTRY__')
      ) {
        definePropertyGlobalVal(
          CurrentGlobal,
          '__GLOBAL_LOADING_REMOTE_ENTRY__',
          {},
        );
      }
      const globalLoading = CurrentGlobal.__GLOBAL_LOADING_REMOTE_ENTRY__;
      function setGlobalDefaultVal(target) {
        var _target___FEDERATION__,
          _target___FEDERATION__1,
          _target___FEDERATION__2,
          _target___FEDERATION__3,
          _target___FEDERATION__4,
          _target___FEDERATION__5;
        if (
          includeOwnProperty(target, '__VMOK__') &&
          !includeOwnProperty(target, '__FEDERATION__')
        ) {
          definePropertyGlobalVal(target, '__FEDERATION__', target.__VMOK__);
        }
        if (!includeOwnProperty(target, '__FEDERATION__')) {
          definePropertyGlobalVal(target, '__FEDERATION__', {
            __GLOBAL_PLUGIN__: [],
            __INSTANCES__: [],
            moduleInfo: {},
            __SHARE__: {},
            __MANIFEST_LOADING__: {},
            __PRELOADED_MAP__: new Map(),
          });
          definePropertyGlobalVal(target, '__VMOK__', target.__FEDERATION__);
        }
        var ___GLOBAL_PLUGIN__;
        (___GLOBAL_PLUGIN__ = (_target___FEDERATION__ = target.__FEDERATION__)
          .__GLOBAL_PLUGIN__) != null
          ? ___GLOBAL_PLUGIN__
          : (_target___FEDERATION__.__GLOBAL_PLUGIN__ = []);
        var ___INSTANCES__;
        (___INSTANCES__ = (_target___FEDERATION__1 = target.__FEDERATION__)
          .__INSTANCES__) != null
          ? ___INSTANCES__
          : (_target___FEDERATION__1.__INSTANCES__ = []);
        var _moduleInfo;
        (_moduleInfo = (_target___FEDERATION__2 = target.__FEDERATION__)
          .moduleInfo) != null
          ? _moduleInfo
          : (_target___FEDERATION__2.moduleInfo = {});
        var ___SHARE__;
        (___SHARE__ = (_target___FEDERATION__3 = target.__FEDERATION__)
          .__SHARE__) != null
          ? ___SHARE__
          : (_target___FEDERATION__3.__SHARE__ = {});
        var ___MANIFEST_LOADING__;
        (___MANIFEST_LOADING__ = (_target___FEDERATION__4 =
          target.__FEDERATION__).__MANIFEST_LOADING__) != null
          ? ___MANIFEST_LOADING__
          : (_target___FEDERATION__4.__MANIFEST_LOADING__ = {});
        var ___PRELOADED_MAP__;
        (___PRELOADED_MAP__ = (_target___FEDERATION__5 = target.__FEDERATION__)
          .__PRELOADED_MAP__) != null
          ? ___PRELOADED_MAP__
          : (_target___FEDERATION__5.__PRELOADED_MAP__ = new Map());
      }
      setGlobalDefaultVal(CurrentGlobal);
      setGlobalDefaultVal(nativeGlobal);
      function resetFederationGlobalInfo() {
        CurrentGlobal.__FEDERATION__.__GLOBAL_PLUGIN__ = [];
        CurrentGlobal.__FEDERATION__.__INSTANCES__ = [];
        CurrentGlobal.__FEDERATION__.moduleInfo = {};
        CurrentGlobal.__FEDERATION__.__SHARE__ = {};
        CurrentGlobal.__FEDERATION__.__MANIFEST_LOADING__ = {};
        Object.keys(globalLoading).forEach((key) => {
          delete globalLoading[key];
        });
      }
      function getGlobalFederationInstance(name, version) {
        const buildId = getBuilderId();
        return CurrentGlobal.__FEDERATION__.__INSTANCES__.find((GMInstance) => {
          if (buildId && GMInstance.options.id === getBuilderId()) {
            return true;
          }
          if (
            GMInstance.options.name === name &&
            !GMInstance.options.version &&
            !version
          ) {
            return true;
          }
          if (
            GMInstance.options.name === name &&
            version &&
            GMInstance.options.version === version
          ) {
            return true;
          }
          return false;
        });
      }
      function setGlobalFederationInstance(FederationInstance) {
        CurrentGlobal.__FEDERATION__.__INSTANCES__.push(FederationInstance);
      }
      function getGlobalFederationConstructor() {
        return CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__;
      }
      function setGlobalFederationConstructor(
        FederationConstructor,
        isDebug = sdk.isDebugMode(),
      ) {
        if (isDebug) {
          CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__ =
            FederationConstructor;
          CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR_VERSION__ = '0.8.3';
        }
      }
      // eslint-disable-next-line @typescript-eslint/ban-types
      function getInfoWithoutType(target, key) {
        if (typeof key === 'string') {
          const keyRes = target[key];
          if (keyRes) {
            return {
              value: target[key],
              key: key,
            };
          } else {
            const targetKeys = Object.keys(target);
            for (const targetKey of targetKeys) {
              const [targetTypeOrName, _] = targetKey.split(':');
              const nKey = `${targetTypeOrName}:${key}`;
              const typeWithKeyRes = target[nKey];
              if (typeWithKeyRes) {
                return {
                  value: typeWithKeyRes,
                  key: nKey,
                };
              }
            }
            return {
              value: undefined,
              key: key,
            };
          }
        } else {
          throw new Error('key must be string');
        }
      }
      const getGlobalSnapshot = () => nativeGlobal.__FEDERATION__.moduleInfo;
      const getTargetSnapshotInfoByModuleInfo = (moduleInfo, snapshot) => {
        // Check if the remote is included in the hostSnapshot
        const moduleKey = getFMId(moduleInfo);
        const getModuleInfo = getInfoWithoutType(snapshot, moduleKey).value;
        // The remoteSnapshot might not include a version
        if (
          getModuleInfo &&
          !getModuleInfo.version &&
          'version' in moduleInfo &&
          moduleInfo['version']
        ) {
          getModuleInfo.version = moduleInfo['version'];
        }
        if (getModuleInfo) {
          return getModuleInfo;
        }
        // If the remote is not included in the hostSnapshot, deploy a micro app snapshot
        if ('version' in moduleInfo && moduleInfo['version']) {
          const { version } = moduleInfo,
            resModuleInfo = polyfills._object_without_properties_loose(
              moduleInfo,
              ['version'],
            );
          const moduleKeyWithoutVersion = getFMId(resModuleInfo);
          const getModuleInfoWithoutVersion = getInfoWithoutType(
            nativeGlobal.__FEDERATION__.moduleInfo,
            moduleKeyWithoutVersion,
          ).value;
          if (
            (getModuleInfoWithoutVersion == null
              ? void 0
              : getModuleInfoWithoutVersion.version) === version
          ) {
            return getModuleInfoWithoutVersion;
          }
        }
        return;
      };
      const getGlobalSnapshotInfoByModuleInfo = (moduleInfo) =>
        getTargetSnapshotInfoByModuleInfo(
          moduleInfo,
          nativeGlobal.__FEDERATION__.moduleInfo,
        );
      const setGlobalSnapshotInfoByModuleInfo = (
        remoteInfo,
        moduleDetailInfo,
      ) => {
        const moduleKey = getFMId(remoteInfo);
        nativeGlobal.__FEDERATION__.moduleInfo[moduleKey] = moduleDetailInfo;
        return nativeGlobal.__FEDERATION__.moduleInfo;
      };
      const addGlobalSnapshot = (moduleInfos) => {
        nativeGlobal.__FEDERATION__.moduleInfo = polyfills._extends(
          {},
          nativeGlobal.__FEDERATION__.moduleInfo,
          moduleInfos,
        );
        return () => {
          const keys = Object.keys(moduleInfos);
          for (const key of keys) {
            delete nativeGlobal.__FEDERATION__.moduleInfo[key];
          }
        };
      };
      const getRemoteEntryExports = (name, globalName) => {
        const remoteEntryKey = globalName || `__FEDERATION_${name}:custom__`;
        const entryExports = CurrentGlobal[remoteEntryKey];
        return {
          remoteEntryKey,
          entryExports,
        };
      };
      // This function is used to register global plugins.
      // It iterates over the provided plugins and checks if they are already registered.
      // If a plugin is not registered, it is added to the global plugins.
      // If a plugin is already registered, a warning message is logged.
      const registerGlobalPlugins = (plugins) => {
        const { __GLOBAL_PLUGIN__ } = nativeGlobal.__FEDERATION__;
        plugins.forEach((plugin) => {
          if (
            __GLOBAL_PLUGIN__.findIndex((p) => p.name === plugin.name) === -1
          ) {
            __GLOBAL_PLUGIN__.push(plugin);
          } else {
            warn(`The plugin ${plugin.name} has been registered.`);
          }
        });
      };
      const getGlobalHostPlugins = () =>
        nativeGlobal.__FEDERATION__.__GLOBAL_PLUGIN__;
      const getPreloaded = (id) =>
        CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.get(id);
      const setPreloaded = (id) =>
        CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.set(id, true);

      const DEFAULT_SCOPE = 'default';
      const DEFAULT_REMOTE_TYPE = 'global';

      // fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
      // those constants are based on https://www.rubydoc.info/gems/semantic_range/3.0.0/SemanticRange#BUILDIDENTIFIER-constant
      // Copyright (c)
      // vite-plugin-federation is licensed under Mulan PSL v2.
      // You can use this software according to the terms and conditions of the Mulan PSL v2.
      // You may obtain a copy of Mulan PSL v2 at:
      //      http://license.coscl.org.cn/MulanPSL2
      // THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
      // See the Mulan PSL v2 for more details.
      const buildIdentifier = '[0-9A-Za-z-]+';
      const build = `(?:\\+(${buildIdentifier}(?:\\.${buildIdentifier})*))`;
      const numericIdentifier = '0|[1-9]\\d*';
      const numericIdentifierLoose = '[0-9]+';
      const nonNumericIdentifier = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';
      const preReleaseIdentifierLoose = `(?:${numericIdentifierLoose}|${nonNumericIdentifier})`;
      const preReleaseLoose = `(?:-?(${preReleaseIdentifierLoose}(?:\\.${preReleaseIdentifierLoose})*))`;
      const preReleaseIdentifier = `(?:${numericIdentifier}|${nonNumericIdentifier})`;
      const preRelease = `(?:-(${preReleaseIdentifier}(?:\\.${preReleaseIdentifier})*))`;
      const xRangeIdentifier = `${numericIdentifier}|x|X|\\*`;
      const xRangePlain = `[v=\\s]*(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:${preRelease})?${build}?)?)?`;
      const hyphenRange = `^\\s*(${xRangePlain})\\s+-\\s+(${xRangePlain})\\s*$`;
      const mainVersionLoose = `(${numericIdentifierLoose})\\.(${numericIdentifierLoose})\\.(${numericIdentifierLoose})`;
      const loosePlain = `[v=\\s]*${mainVersionLoose}${preReleaseLoose}?${build}?`;
      const gtlt = '((?:<|>)?=?)';
      const comparatorTrim = `(\\s*)${gtlt}\\s*(${loosePlain}|${xRangePlain})`;
      const loneTilde = '(?:~>?)';
      const tildeTrim = `(\\s*)${loneTilde}\\s+`;
      const loneCaret = '(?:\\^)';
      const caretTrim = `(\\s*)${loneCaret}\\s+`;
      const star = '(<|>)?=?\\s*\\*';
      const caret = `^${loneCaret}${xRangePlain}$`;
      const mainVersion = `(${numericIdentifier})\\.(${numericIdentifier})\\.(${numericIdentifier})`;
      const fullPlain = `v?${mainVersion}${preRelease}?${build}?`;
      const tilde = `^${loneTilde}${xRangePlain}$`;
      const xRange = `^${gtlt}\\s*${xRangePlain}$`;
      const comparator = `^${gtlt}\\s*(${fullPlain})$|^$`;
      // copy from semver package
      const gte0 = '^\\s*>=\\s*0.0.0\\s*$';

      // fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
      // Copyright (c)
      // vite-plugin-federation is licensed under Mulan PSL v2.
      // You can use this software according to the terms and conditions of the Mulan PSL v2.
      // You may obtain a copy of Mulan PSL v2 at:
      //      http://license.coscl.org.cn/MulanPSL2
      // THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
      // See the Mulan PSL v2 for more details.
      function parseRegex(source) {
        return new RegExp(source);
      }
      function isXVersion(version) {
        return !version || version.toLowerCase() === 'x' || version === '*';
      }
      function pipe(...fns) {
        return (x) => fns.reduce((v, f) => f(v), x);
      }
      function extractComparator(comparatorString) {
        return comparatorString.match(parseRegex(comparator));
      }
      function combineVersion(major, minor, patch, preRelease) {
        const mainVersion = `${major}.${minor}.${patch}`;
        if (preRelease) {
          return `${mainVersion}-${preRelease}`;
        }
        return mainVersion;
      }

      // fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
      // Copyright (c)
      // vite-plugin-federation is licensed under Mulan PSL v2.
      // You can use this software according to the terms and conditions of the Mulan PSL v2.
      // You may obtain a copy of Mulan PSL v2 at:
      //      http://license.coscl.org.cn/MulanPSL2
      // THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
      // See the Mulan PSL v2 for more details.
      function parseHyphen(range) {
        return range.replace(
          parseRegex(hyphenRange),
          (
            _range,
            from,
            fromMajor,
            fromMinor,
            fromPatch,
            _fromPreRelease,
            _fromBuild,
            to,
            toMajor,
            toMinor,
            toPatch,
            toPreRelease,
          ) => {
            if (isXVersion(fromMajor)) {
              from = '';
            } else if (isXVersion(fromMinor)) {
              from = `>=${fromMajor}.0.0`;
            } else if (isXVersion(fromPatch)) {
              from = `>=${fromMajor}.${fromMinor}.0`;
            } else {
              from = `>=${from}`;
            }
            if (isXVersion(toMajor)) {
              to = '';
            } else if (isXVersion(toMinor)) {
              to = `<${Number(toMajor) + 1}.0.0-0`;
            } else if (isXVersion(toPatch)) {
              to = `<${toMajor}.${Number(toMinor) + 1}.0-0`;
            } else if (toPreRelease) {
              to = `<=${toMajor}.${toMinor}.${toPatch}-${toPreRelease}`;
            } else {
              to = `<=${to}`;
            }
            return `${from} ${to}`.trim();
          },
        );
      }
      function parseComparatorTrim(range) {
        return range.replace(parseRegex(comparatorTrim), '$1$2$3');
      }
      function parseTildeTrim(range) {
        return range.replace(parseRegex(tildeTrim), '$1~');
      }
      function parseCaretTrim(range) {
        return range.replace(parseRegex(caretTrim), '$1^');
      }
      function parseCarets(range) {
        return range
          .trim()
          .split(/\s+/)
          .map((rangeVersion) =>
            rangeVersion.replace(
              parseRegex(caret),
              (_, major, minor, patch, preRelease) => {
                if (isXVersion(major)) {
                  return '';
                } else if (isXVersion(minor)) {
                  return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
                } else if (isXVersion(patch)) {
                  if (major === '0') {
                    return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
                  } else {
                    return `>=${major}.${minor}.0 <${Number(major) + 1}.0.0-0`;
                  }
                } else if (preRelease) {
                  if (major === '0') {
                    if (minor === '0') {
                      return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${minor}.${Number(patch) + 1}-0`;
                    } else {
                      return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${Number(minor) + 1}.0-0`;
                    }
                  } else {
                    return `>=${major}.${minor}.${patch}-${preRelease} <${Number(major) + 1}.0.0-0`;
                  }
                } else {
                  if (major === '0') {
                    if (minor === '0') {
                      return `>=${major}.${minor}.${patch} <${major}.${minor}.${Number(patch) + 1}-0`;
                    } else {
                      return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
                    }
                  }
                  return `>=${major}.${minor}.${patch} <${Number(major) + 1}.0.0-0`;
                }
              },
            ),
          )
          .join(' ');
      }
      function parseTildes(range) {
        return range
          .trim()
          .split(/\s+/)
          .map((rangeVersion) =>
            rangeVersion.replace(
              parseRegex(tilde),
              (_, major, minor, patch, preRelease) => {
                if (isXVersion(major)) {
                  return '';
                } else if (isXVersion(minor)) {
                  return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
                } else if (isXVersion(patch)) {
                  return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
                } else if (preRelease) {
                  return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${Number(minor) + 1}.0-0`;
                }
                return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
              },
            ),
          )
          .join(' ');
      }
      function parseXRanges(range) {
        return range
          .split(/\s+/)
          .map((rangeVersion) =>
            rangeVersion
              .trim()
              .replace(
                parseRegex(xRange),
                (ret, gtlt, major, minor, patch, preRelease) => {
                  const isXMajor = isXVersion(major);
                  const isXMinor = isXMajor || isXVersion(minor);
                  const isXPatch = isXMinor || isXVersion(patch);
                  if (gtlt === '=' && isXPatch) {
                    gtlt = '';
                  }
                  preRelease = '';
                  if (isXMajor) {
                    if (gtlt === '>' || gtlt === '<') {
                      // nothing is allowed
                      return '<0.0.0-0';
                    } else {
                      // nothing is forbidden
                      return '*';
                    }
                  } else if (gtlt && isXPatch) {
                    // replace X with 0
                    if (isXMinor) {
                      minor = 0;
                    }
                    patch = 0;
                    if (gtlt === '>') {
                      // >1 => >=2.0.0
                      // >1.2 => >=1.3.0
                      gtlt = '>=';
                      if (isXMinor) {
                        major = Number(major) + 1;
                        minor = 0;
                        patch = 0;
                      } else {
                        minor = Number(minor) + 1;
                        patch = 0;
                      }
                    } else if (gtlt === '<=') {
                      // <=0.7.x is actually <0.8.0, since any 0.7.x should pass
                      // Similarly, <=7.x is actually <8.0.0, etc.
                      gtlt = '<';
                      if (isXMinor) {
                        major = Number(major) + 1;
                      } else {
                        minor = Number(minor) + 1;
                      }
                    }
                    if (gtlt === '<') {
                      preRelease = '-0';
                    }
                    return `${gtlt + major}.${minor}.${patch}${preRelease}`;
                  } else if (isXMinor) {
                    return `>=${major}.0.0${preRelease} <${Number(major) + 1}.0.0-0`;
                  } else if (isXPatch) {
                    return `>=${major}.${minor}.0${preRelease} <${major}.${Number(minor) + 1}.0-0`;
                  }
                  return ret;
                },
              ),
          )
          .join(' ');
      }
      function parseStar(range) {
        return range.trim().replace(parseRegex(star), '');
      }
      function parseGTE0(comparatorString) {
        return comparatorString.trim().replace(parseRegex(gte0), '');
      }

      // fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
      // Copyright (c)
      // vite-plugin-federation is licensed under Mulan PSL v2.
      // You can use this software according to the terms and conditions of the Mulan PSL v2.
      // You may obtain a copy of Mulan PSL v2 at:
      //      http://license.coscl.org.cn/MulanPSL2
      // THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
      // See the Mulan PSL v2 for more details.
      function compareAtom(rangeAtom, versionAtom) {
        rangeAtom = Number(rangeAtom) || rangeAtom;
        versionAtom = Number(versionAtom) || versionAtom;
        if (rangeAtom > versionAtom) {
          return 1;
        }
        if (rangeAtom === versionAtom) {
          return 0;
        }
        return -1;
      }
      function comparePreRelease(rangeAtom, versionAtom) {
        const { preRelease: rangePreRelease } = rangeAtom;
        const { preRelease: versionPreRelease } = versionAtom;
        if (rangePreRelease === undefined && Boolean(versionPreRelease)) {
          return 1;
        }
        if (Boolean(rangePreRelease) && versionPreRelease === undefined) {
          return -1;
        }
        if (rangePreRelease === undefined && versionPreRelease === undefined) {
          return 0;
        }
        for (let i = 0, n = rangePreRelease.length; i <= n; i++) {
          const rangeElement = rangePreRelease[i];
          const versionElement = versionPreRelease[i];
          if (rangeElement === versionElement) {
            continue;
          }
          if (rangeElement === undefined && versionElement === undefined) {
            return 0;
          }
          if (!rangeElement) {
            return 1;
          }
          if (!versionElement) {
            return -1;
          }
          return compareAtom(rangeElement, versionElement);
        }
        return 0;
      }
      function compareVersion(rangeAtom, versionAtom) {
        return (
          compareAtom(rangeAtom.major, versionAtom.major) ||
          compareAtom(rangeAtom.minor, versionAtom.minor) ||
          compareAtom(rangeAtom.patch, versionAtom.patch) ||
          comparePreRelease(rangeAtom, versionAtom)
        );
      }
      function eq(rangeAtom, versionAtom) {
        return rangeAtom.version === versionAtom.version;
      }
      function compare(rangeAtom, versionAtom) {
        switch (rangeAtom.operator) {
          case '':
          case '=':
            return eq(rangeAtom, versionAtom);
          case '>':
            return compareVersion(rangeAtom, versionAtom) < 0;
          case '>=':
            return (
              eq(rangeAtom, versionAtom) ||
              compareVersion(rangeAtom, versionAtom) < 0
            );
          case '<':
            return compareVersion(rangeAtom, versionAtom) > 0;
          case '<=':
            return (
              eq(rangeAtom, versionAtom) ||
              compareVersion(rangeAtom, versionAtom) > 0
            );
          case undefined: {
            // mean * or x -> all versions
            return true;
          }
          default:
            return false;
        }
      }

      // fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
      // Copyright (c)
      // vite-plugin-federation is licensed under Mulan PSL v2.
      // You can use this software according to the terms and conditions of the Mulan PSL v2.
      // You may obtain a copy of Mulan PSL v2 at:
      //      http://license.coscl.org.cn/MulanPSL2
      // THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
      // See the Mulan PSL v2 for more details.
      function parseComparatorString(range) {
        return pipe(
          // handle caret
          // ^ --> * (any, kinda silly)
          // ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
          // ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
          // ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
          // ^1.2.3 --> >=1.2.3 <2.0.0-0
          // ^1.2.0 --> >=1.2.0 <2.0.0-0
          parseCarets, // handle tilde
          // ~, ~> --> * (any, kinda silly)
          // ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
          // ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
          // ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
          // ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
          // ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
          parseTildes,
          parseXRanges,
          parseStar,
        )(range);
      }
      function parseRange(range) {
        return pipe(
          // handle hyphenRange
          // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
          parseHyphen, // handle trim comparator
          // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
          parseComparatorTrim, // handle trim tilde
          // `~ 1.2.3` => `~1.2.3`
          parseTildeTrim, // handle trim caret
          // `^ 1.2.3` => `^1.2.3`
          parseCaretTrim,
        )(range.trim())
          .split(/\s+/)
          .join(' ');
      }
      function satisfy(version, range) {
        if (!version) {
          return false;
        }
        const parsedRange = parseRange(range);
        const parsedComparator = parsedRange
          .split(' ')
          .map((rangeVersion) => parseComparatorString(rangeVersion))
          .join(' ');
        const comparators = parsedComparator
          .split(/\s+/)
          .map((comparator) => parseGTE0(comparator));
        const extractedVersion = extractComparator(version);
        if (!extractedVersion) {
          return false;
        }
        const [
          ,
          versionOperator,
          ,
          versionMajor,
          versionMinor,
          versionPatch,
          versionPreRelease,
        ] = extractedVersion;
        const versionAtom = {
          operator: versionOperator,
          version: combineVersion(
            versionMajor,
            versionMinor,
            versionPatch,
            versionPreRelease,
          ),
          major: versionMajor,
          minor: versionMinor,
          patch: versionPatch,
          preRelease:
            versionPreRelease == null ? void 0 : versionPreRelease.split('.'),
        };
        for (const comparator of comparators) {
          const extractedComparator = extractComparator(comparator);
          if (!extractedComparator) {
            return false;
          }
          const [
            ,
            rangeOperator,
            ,
            rangeMajor,
            rangeMinor,
            rangePatch,
            rangePreRelease,
          ] = extractedComparator;
          const rangeAtom = {
            operator: rangeOperator,
            version: combineVersion(
              rangeMajor,
              rangeMinor,
              rangePatch,
              rangePreRelease,
            ),
            major: rangeMajor,
            minor: rangeMinor,
            patch: rangePatch,
            preRelease:
              rangePreRelease == null ? void 0 : rangePreRelease.split('.'),
          };
          if (!compare(rangeAtom, versionAtom)) {
            return false; // early return
          }
        }
        return true;
      }

      function formatShare(shareArgs, from, name, shareStrategy) {
        let get;
        if ('get' in shareArgs) {
          // eslint-disable-next-line prefer-destructuring
          get = shareArgs.get;
        } else if ('lib' in shareArgs) {
          get = () => Promise.resolve(shareArgs.lib);
        } else {
          get = () =>
            Promise.resolve(() => {
              throw new Error(`Can not get shared '${name}'!`);
            });
        }
        if (shareArgs.strategy) {
          warn(
            `"shared.strategy is deprecated, please set in initOptions.shareStrategy instead!"`,
          );
        }
        var _shareArgs_version, _shareArgs_scope, _shareArgs_strategy;
        return polyfills._extends(
          {
            deps: [],
            useIn: [],
            from,
            loading: null,
          },
          shareArgs,
          {
            shareConfig: polyfills._extends(
              {
                requiredVersion: `^${shareArgs.version}`,
                singleton: false,
                eager: false,
                strictVersion: false,
              },
              shareArgs.shareConfig,
            ),
            get,
            loaded:
              (shareArgs == null ? void 0 : shareArgs.loaded) ||
              'lib' in shareArgs
                ? true
                : undefined,
            version:
              (_shareArgs_version = shareArgs.version) != null
                ? _shareArgs_version
                : '0',
            scope: Array.isArray(shareArgs.scope)
              ? shareArgs.scope
              : [
                  (_shareArgs_scope = shareArgs.scope) != null
                    ? _shareArgs_scope
                    : 'default',
                ],
            strategy:
              ((_shareArgs_strategy = shareArgs.strategy) != null
                ? _shareArgs_strategy
                : shareStrategy) || 'version-first',
          },
        );
      }
      function formatShareConfigs(globalOptions, userOptions) {
        const shareArgs = userOptions.shared || {};
        const from = userOptions.name;
        const shareInfos = Object.keys(shareArgs).reduce((res, pkgName) => {
          const arrayShareArgs = arrayOptions(shareArgs[pkgName]);
          res[pkgName] = res[pkgName] || [];
          arrayShareArgs.forEach((shareConfig) => {
            res[pkgName].push(
              formatShare(
                shareConfig,
                from,
                pkgName,
                userOptions.shareStrategy,
              ),
            );
          });
          return res;
        }, {});
        const shared = polyfills._extends({}, globalOptions.shared);
        Object.keys(shareInfos).forEach((shareKey) => {
          if (!shared[shareKey]) {
            shared[shareKey] = shareInfos[shareKey];
          } else {
            shareInfos[shareKey].forEach((newUserSharedOptions) => {
              const isSameVersion = shared[shareKey].find(
                (sharedVal) =>
                  sharedVal.version === newUserSharedOptions.version,
              );
              if (!isSameVersion) {
                shared[shareKey].push(newUserSharedOptions);
              }
            });
          }
        });
        return {
          shared,
          shareInfos,
        };
      }
      function versionLt(a, b) {
        const transformInvalidVersion = (version) => {
          const isNumberVersion = !Number.isNaN(Number(version));
          if (isNumberVersion) {
            const splitArr = version.split('.');
            let validVersion = version;
            for (let i = 0; i < 3 - splitArr.length; i++) {
              validVersion += '.0';
            }
            return validVersion;
          }
          return version;
        };
        if (
          satisfy(transformInvalidVersion(a), `<=${transformInvalidVersion(b)}`)
        ) {
          return true;
        } else {
          return false;
        }
      }
      const findVersion = (shareVersionMap, cb) => {
        const callback =
          cb ||
          function (prev, cur) {
            return versionLt(prev, cur);
          };
        return Object.keys(shareVersionMap).reduce((prev, cur) => {
          if (!prev) {
            return cur;
          }
          if (callback(prev, cur)) {
            return cur;
          }
          // default version is '0' https://github.com/webpack/webpack/blob/main/lib/sharing/ProvideSharedModule.js#L136
          if (prev === '0') {
            return cur;
          }
          return prev;
        }, 0);
      };
      const isLoaded = (shared) => {
        return Boolean(shared.loaded) || typeof shared.lib === 'function';
      };
      const isLoading = (shared) => {
        return Boolean(shared.loading);
      };
      function findSingletonVersionOrderByVersion(
        shareScopeMap,
        scope,
        pkgName,
      ) {
        const versions = shareScopeMap[scope][pkgName];
        const callback = function (prev, cur) {
          return !isLoaded(versions[prev]) && versionLt(prev, cur);
        };
        return findVersion(shareScopeMap[scope][pkgName], callback);
      }
      function findSingletonVersionOrderByLoaded(
        shareScopeMap,
        scope,
        pkgName,
      ) {
        const versions = shareScopeMap[scope][pkgName];
        const callback = function (prev, cur) {
          const isLoadingOrLoaded = (shared) => {
            return isLoaded(shared) || isLoading(shared);
          };
          if (isLoadingOrLoaded(versions[cur])) {
            if (isLoadingOrLoaded(versions[prev])) {
              return Boolean(versionLt(prev, cur));
            } else {
              return true;
            }
          }
          if (isLoadingOrLoaded(versions[prev])) {
            return false;
          }
          return versionLt(prev, cur);
        };
        return findVersion(shareScopeMap[scope][pkgName], callback);
      }
      function getFindShareFunction(strategy) {
        if (strategy === 'loaded-first') {
          return findSingletonVersionOrderByLoaded;
        }
        return findSingletonVersionOrderByVersion;
      }
      function getRegisteredShare(
        localShareScopeMap,
        pkgName,
        shareInfo,
        resolveShare,
      ) {
        console.log('Getting registered share:', {
          pkgName,
          shareInfo,
          layer: shareInfo == null ? void 0 : shareInfo.layer,
          issuerLayer: shareInfo == null ? void 0 : shareInfo.issuerLayer,
          scopes: shareInfo.scope,
        });
        if (!localShareScopeMap) {
          return;
        }
        const { shareConfig, scope = DEFAULT_SCOPE, strategy } = shareInfo;
        const scopes = Array.isArray(scope) ? scope : [scope];
        for (const sc of scopes) {
          if (
            shareConfig &&
            localShareScopeMap[sc] &&
            localShareScopeMap[sc][pkgName]
          ) {
            const { requiredVersion } = shareConfig;
            const findShareFunction = getFindShareFunction(strategy);
            const maxOrSingletonVersion = findShareFunction(
              localShareScopeMap,
              sc,
              pkgName,
            );
            //@ts-ignore
            const defaultResolver = () => {
              const resolveWithLayers = (version) => {
                var _versionInfo_shareConfig;
                const versionInfo = localShareScopeMap[sc][pkgName][version];
                if (!versionInfo) return undefined;
                // If we have a singleton version loaded, use that version for all requests
                const singletonVersions = Object.keys(
                  localShareScopeMap[sc][pkgName],
                ).filter((v) => {
                  var _info_shareConfig;
                  const info = localShareScopeMap[sc][pkgName][v];
                  return (_info_shareConfig = info.shareConfig) == null
                    ? void 0
                    : _info_shareConfig.singleton;
                });
                if (singletonVersions.length > 0) {
                  // Find the highest version among loaded singletons
                  const loadedSingletonVersion = singletonVersions.reduce(
                    (highest, v) => {
                      const info = localShareScopeMap[sc][pkgName][v];
                      if (!info.loaded) return highest;
                      if (!highest) return v;
                      return versionLt(highest, v) ? v : highest;
                    },
                    undefined,
                  );
                  if (loadedSingletonVersion) {
                    console.log(
                      'Using loaded singleton version:',
                      loadedSingletonVersion,
                    );
                    return localShareScopeMap[sc][pkgName][
                      loadedSingletonVersion
                    ];
                  }
                  // If no singleton is loaded yet, use the highest version
                  const highestSingletonVersion = singletonVersions.reduce(
                    (highest, v) => {
                      if (!highest) return v;
                      return versionLt(highest, v) ? v : highest;
                    },
                  );
                  console.log(
                    'Using highest singleton version:',
                    highestSingletonVersion,
                  );
                  return localShareScopeMap[sc][pkgName][
                    highestSingletonVersion
                  ];
                }
                // If we're requesting a layered version, check if we have a matching layer
                if (shareInfo.layer) {
                  const layeredVersion = Object.keys(
                    localShareScopeMap[sc][pkgName],
                  ).find((v) => {
                    var _info_shareConfig;
                    const info = localShareScopeMap[sc][pkgName][v];
                    return (
                      ((_info_shareConfig = info.shareConfig) == null
                        ? void 0
                        : _info_shareConfig.layer) === shareInfo.layer
                    );
                  });
                  if (layeredVersion) {
                    console.log('Using layered version:', layeredVersion);
                    return localShareScopeMap[sc][pkgName][layeredVersion];
                  }
                }
                // If we're requesting a non-layered version but have a layered one
                if (
                  !shareInfo.layer &&
                  ((_versionInfo_shareConfig = versionInfo.shareConfig) == null
                    ? void 0
                    : _versionInfo_shareConfig.layer)
                ) {
                  console.log(
                    'Skipping layered version when non-layered version is requested',
                  );
                  return undefined;
                }
                return versionInfo;
              };
              if (shareConfig.singleton) {
                if (
                  typeof requiredVersion === 'string' &&
                  !satisfy(maxOrSingletonVersion, requiredVersion)
                ) {
                  const msg = `Version ${maxOrSingletonVersion} from ${maxOrSingletonVersion && localShareScopeMap[sc][pkgName][maxOrSingletonVersion].from} of shared singleton module ${pkgName} does not satisfy the requirement of ${shareInfo.from} which needs ${requiredVersion})`;
                  if (shareConfig.strictVersion) {
                    error(msg);
                  } else {
                    warn(msg);
                  }
                }
                return resolveWithLayers(maxOrSingletonVersion);
              } else {
                if (requiredVersion === false || requiredVersion === '*') {
                  return resolveWithLayers(maxOrSingletonVersion);
                }
                if (
                  typeof requiredVersion === 'string' &&
                  satisfy(maxOrSingletonVersion, requiredVersion)
                ) {
                  return resolveWithLayers(maxOrSingletonVersion);
                }
                for (const [versionKey, versionValue] of Object.entries(
                  localShareScopeMap[sc][pkgName],
                )) {
                  if (
                    typeof requiredVersion === 'string' &&
                    satisfy(versionKey, requiredVersion)
                  ) {
                    const layeredShare = resolveWithLayers(versionKey);
                    if (layeredShare) return layeredShare;
                  }
                }
              }
            };
            const params = {
              shareScopeMap: localShareScopeMap,
              scope: sc,
              pkgName,
              version: maxOrSingletonVersion,
              GlobalFederation: Global.__FEDERATION__,
              resolver: defaultResolver,
            };
            const resolveShared = resolveShare.emit(params) || params;
            return resolveShared.resolver();
          }
        }
      }
      function getGlobalShareScope() {
        return Global.__FEDERATION__.__SHARE__;
      }
      function getTargetSharedOptions(options) {
        const { pkgName, extraOptions, shareInfos } = options;
        const defaultResolver = (sharedOptions) => {
          if (!sharedOptions) {
            return undefined;
          }
          const shareVersionMap = {};
          sharedOptions.forEach((shared) => {
            shareVersionMap[shared.version] = shared;
          });
          const callback = function (prev, cur) {
            return !isLoaded(shareVersionMap[prev]) && versionLt(prev, cur);
          };
          const maxVersion = findVersion(shareVersionMap, callback);
          return shareVersionMap[maxVersion];
        };
        var _extraOptions_resolver;
        const resolver =
          (_extraOptions_resolver =
            extraOptions == null ? void 0 : extraOptions.resolver) != null
            ? _extraOptions_resolver
            : defaultResolver;
        return Object.assign(
          {},
          resolver(shareInfos[pkgName]),
          extraOptions == null ? void 0 : extraOptions.customShareInfo,
        );
      }

      exports.CurrentGlobal = CurrentGlobal;
      exports.DEFAULT_REMOTE_TYPE = DEFAULT_REMOTE_TYPE;
      exports.DEFAULT_SCOPE = DEFAULT_SCOPE;
      exports.Global = Global;
      exports.addGlobalSnapshot = addGlobalSnapshot;
      exports.addUniqueItem = addUniqueItem;
      exports.arrayOptions = arrayOptions;
      exports.assert = assert;
      exports.error = error;
      exports.formatShareConfigs = formatShareConfigs;
      exports.getBuilderId = getBuilderId;
      exports.getFMId = getFMId;
      exports.getGlobalFederationConstructor = getGlobalFederationConstructor;
      exports.getGlobalFederationInstance = getGlobalFederationInstance;
      exports.getGlobalHostPlugins = getGlobalHostPlugins;
      exports.getGlobalShareScope = getGlobalShareScope;
      exports.getGlobalSnapshot = getGlobalSnapshot;
      exports.getGlobalSnapshotInfoByModuleInfo =
        getGlobalSnapshotInfoByModuleInfo;
      exports.getInfoWithoutType = getInfoWithoutType;
      exports.getPreloaded = getPreloaded;
      exports.getRegisteredShare = getRegisteredShare;
      exports.getRemoteEntryExports = getRemoteEntryExports;
      exports.getRemoteEntryInfoFromSnapshot = getRemoteEntryInfoFromSnapshot;
      exports.getTargetSharedOptions = getTargetSharedOptions;
      exports.getTargetSnapshotInfoByModuleInfo =
        getTargetSnapshotInfoByModuleInfo;
      exports.globalLoading = globalLoading;
      exports.isObject = isObject;
      exports.isPlainObject = isPlainObject;
      exports.isPureRemoteEntry = isPureRemoteEntry;
      exports.isRemoteInfoWithEntry = isRemoteInfoWithEntry;
      exports.logger = logger;
      exports.nativeGlobal = nativeGlobal;
      exports.processModuleAlias = processModuleAlias;
      exports.registerGlobalPlugins = registerGlobalPlugins;
      exports.resetFederationGlobalInfo = resetFederationGlobalInfo;
      exports.setGlobalFederationConstructor = setGlobalFederationConstructor;
      exports.setGlobalFederationInstance = setGlobalFederationInstance;
      exports.setGlobalSnapshotInfoByModuleInfo =
        setGlobalSnapshotInfoByModuleInfo;
      exports.setPreloaded = setPreloaded;
      exports.warn = warn;

      /***/
    },

  /***/ 463:
    /*!********************************************!*\
  !*** ../../../../../sdk/dist/index.cjs.js ***!
  \********************************************/
    /***/ (__unused_webpack_module, exports, __webpack_require__) => {
      var isomorphicRslog = __webpack_require__(/*! isomorphic-rslog */ 390);
      var polyfills = __webpack_require__(/*! ./polyfills.cjs.js */ 931);

      const FederationModuleManifest = 'federation-manifest.json';
      const MANIFEST_EXT = '.json';
      const BROWSER_LOG_KEY = 'FEDERATION_DEBUG';
      const BROWSER_LOG_VALUE = '1';
      const NameTransformSymbol = {
        AT: '@',
        HYPHEN: '-',
        SLASH: '/',
      };
      const NameTransformMap = {
        [NameTransformSymbol.AT]: 'scope_',
        [NameTransformSymbol.HYPHEN]: '_',
        [NameTransformSymbol.SLASH]: '__',
      };
      const EncodedNameTransformMap = {
        [NameTransformMap[NameTransformSymbol.AT]]: NameTransformSymbol.AT,
        [NameTransformMap[NameTransformSymbol.HYPHEN]]:
          NameTransformSymbol.HYPHEN,
        [NameTransformMap[NameTransformSymbol.SLASH]]:
          NameTransformSymbol.SLASH,
      };
      const SEPARATOR = ':';
      const ManifestFileName = 'mf-manifest.json';
      const StatsFileName = 'mf-stats.json';
      const MFModuleType = {
        NPM: 'npm',
        APP: 'app',
      };
      const MODULE_DEVTOOL_IDENTIFIER = '__MF_DEVTOOLS_MODULE_INFO__';
      const ENCODE_NAME_PREFIX = 'ENCODE_NAME_PREFIX';
      const TEMP_DIR = '.federation';
      const MFPrefetchCommon = {
        identifier: 'MFDataPrefetch',
        globalKey: '__PREFETCH__',
        library: 'mf-data-prefetch',
        exportsKey: '__PREFETCH_EXPORTS__',
        fileName: 'bootstrap.js',
      };

      var ContainerPlugin = /*#__PURE__*/ Object.freeze({
        __proto__: null,
      });

      var ContainerReferencePlugin = /*#__PURE__*/ Object.freeze({
        __proto__: null,
      });

      var ModuleFederationPlugin = /*#__PURE__*/ Object.freeze({
        __proto__: null,
      });

      var SharePlugin = /*#__PURE__*/ Object.freeze({
        __proto__: null,
      });

      function isBrowserEnv() {
        return typeof window !== 'undefined';
      }
      function isBrowserDebug() {
        try {
          if (isBrowserEnv() && window.localStorage) {
            return localStorage.getItem(BROWSER_LOG_KEY) === BROWSER_LOG_VALUE;
          }
        } catch (error) {
          return false;
        }
        return false;
      }
      function isDebugMode() {
        if (
          typeof process !== 'undefined' &&
          process.env &&
          process.env['FEDERATION_DEBUG']
        ) {
          return Boolean(process.env['FEDERATION_DEBUG']);
        }
        if (
          typeof FEDERATION_DEBUG !== 'undefined' &&
          Boolean(FEDERATION_DEBUG)
        ) {
          return true;
        }
        return isBrowserDebug();
      }
      const getProcessEnv = function () {
        return typeof process !== 'undefined' && process.env ? process.env : {};
      };

      const PREFIX = '[ Module Federation ]';
      function setDebug(loggerInstance) {
        if (isDebugMode()) {
          loggerInstance.level = 'verbose';
        }
      }
      function setPrefix(loggerInstance, prefix) {
        loggerInstance.labels = {
          warn: `${prefix} Warn`,
          error: `${prefix} Error`,
          success: `${prefix} Success`,
          info: `${prefix} Info`,
          ready: `${prefix} Ready`,
          debug: `${prefix} Debug`,
        };
      }
      function createLogger(prefix) {
        const loggerInstance = isomorphicRslog.createLogger({
          labels: {
            warn: `${PREFIX} Warn`,
            error: `${PREFIX} Error`,
            success: `${PREFIX} Success`,
            info: `${PREFIX} Info`,
            ready: `${PREFIX} Ready`,
            debug: `${PREFIX} Debug`,
          },
        });
        setDebug(loggerInstance);
        setPrefix(loggerInstance, prefix);
        return loggerInstance;
      }
      const logger = createLogger(PREFIX);

      const LOG_CATEGORY = '[ Federation Runtime ]';
      // entry: name:version   version : 1.0.0 | ^1.2.3
      // entry: name:entry  entry:  https://localhost:9000/federation-manifest.json
      const parseEntry = (str, devVerOrUrl, separator = SEPARATOR) => {
        const strSplit = str.split(separator);
        const devVersionOrUrl =
          getProcessEnv()['NODE_ENV'] === 'development' && devVerOrUrl;
        const defaultVersion = '*';
        const isEntry = (s) => s.startsWith('http') || s.includes(MANIFEST_EXT);
        // Check if the string starts with a type
        if (strSplit.length >= 2) {
          let [name, ...versionOrEntryArr] = strSplit;
          if (str.startsWith(separator)) {
            versionOrEntryArr = [devVersionOrUrl || strSplit.slice(-1)[0]];
            name = strSplit.slice(0, -1).join(separator);
          }
          let versionOrEntry =
            devVersionOrUrl || versionOrEntryArr.join(separator);
          if (isEntry(versionOrEntry)) {
            return {
              name,
              entry: versionOrEntry,
            };
          } else {
            // Apply version rule
            // devVersionOrUrl => inputVersion => defaultVersion
            return {
              name,
              version: versionOrEntry || defaultVersion,
            };
          }
        } else if (strSplit.length === 1) {
          const [name] = strSplit;
          if (devVersionOrUrl && isEntry(devVersionOrUrl)) {
            return {
              name,
              entry: devVersionOrUrl,
            };
          }
          return {
            name,
            version: devVersionOrUrl || defaultVersion,
          };
        } else {
          throw `Invalid entry value: ${str}`;
        }
      };
      const composeKeyWithSeparator = function (...args) {
        if (!args.length) {
          return '';
        }
        return args.reduce((sum, cur) => {
          if (!cur) {
            return sum;
          }
          if (!sum) {
            return cur;
          }
          return `${sum}${SEPARATOR}${cur}`;
        }, '');
      };
      const encodeName = function (name, prefix = '', withExt = false) {
        try {
          const ext = withExt ? '.js' : '';
          return `${prefix}${name
            .replace(
              new RegExp(`${NameTransformSymbol.AT}`, 'g'),
              NameTransformMap[NameTransformSymbol.AT],
            )
            .replace(
              new RegExp(`${NameTransformSymbol.HYPHEN}`, 'g'),
              NameTransformMap[NameTransformSymbol.HYPHEN],
            )
            .replace(
              new RegExp(`${NameTransformSymbol.SLASH}`, 'g'),
              NameTransformMap[NameTransformSymbol.SLASH],
            )}${ext}`;
        } catch (err) {
          throw err;
        }
      };
      const decodeName = function (name, prefix, withExt) {
        try {
          let decodedName = name;
          if (prefix) {
            if (!decodedName.startsWith(prefix)) {
              return decodedName;
            }
            decodedName = decodedName.replace(new RegExp(prefix, 'g'), '');
          }
          decodedName = decodedName
            .replace(
              new RegExp(`${NameTransformMap[NameTransformSymbol.AT]}`, 'g'),
              EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.AT]],
            )
            .replace(
              new RegExp(`${NameTransformMap[NameTransformSymbol.SLASH]}`, 'g'),
              EncodedNameTransformMap[
                NameTransformMap[NameTransformSymbol.SLASH]
              ],
            )
            .replace(
              new RegExp(
                `${NameTransformMap[NameTransformSymbol.HYPHEN]}`,
                'g',
              ),
              EncodedNameTransformMap[
                NameTransformMap[NameTransformSymbol.HYPHEN]
              ],
            );
          if (withExt) {
            decodedName = decodedName.replace('.js', '');
          }
          return decodedName;
        } catch (err) {
          throw err;
        }
      };
      const generateExposeFilename = (exposeName, withExt) => {
        if (!exposeName) {
          return '';
        }
        let expose = exposeName;
        if (expose === '.') {
          expose = 'default_export';
        }
        if (expose.startsWith('./')) {
          expose = expose.replace('./', '');
        }
        return encodeName(expose, '__federation_expose_', withExt);
      };
      const generateShareFilename = (pkgName, withExt) => {
        if (!pkgName) {
          return '';
        }
        return encodeName(pkgName, '__federation_shared_', withExt);
      };
      const getResourceUrl = (module, sourceUrl) => {
        if ('getPublicPath' in module) {
          let publicPath;
          if (!module.getPublicPath.startsWith('function')) {
            publicPath = new Function(module.getPublicPath)();
          } else {
            publicPath = new Function('return ' + module.getPublicPath)()();
          }
          return `${publicPath}${sourceUrl}`;
        } else if ('publicPath' in module) {
          return `${module.publicPath}${sourceUrl}`;
        } else {
          console.warn(
            'Cannot get resource URL. If in debug mode, please ignore.',
            module,
            sourceUrl,
          );
          return '';
        }
      };
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      const assert = (condition, msg) => {
        if (!condition) {
          error(msg);
        }
      };
      const error = (msg) => {
        throw new Error(`${LOG_CATEGORY}: ${msg}`);
      };
      const warn = (msg) => {
        console.warn(`${LOG_CATEGORY}: ${msg}`);
      };
      function safeToString(info) {
        try {
          return JSON.stringify(info, null, 2);
        } catch (e) {
          return '';
        }
      }
      // RegExp for version string
      const VERSION_PATTERN_REGEXP = /^([\d^=v<>~]|[*xX]$)/;
      function isRequiredVersion(str) {
        return VERSION_PATTERN_REGEXP.test(str);
      }

      const simpleJoinRemoteEntry = (rPath, rName) => {
        if (!rPath) {
          return rName;
        }
        const transformPath = (str) => {
          if (str === '.') {
            return '';
          }
          if (str.startsWith('./')) {
            return str.replace('./', '');
          }
          if (str.startsWith('/')) {
            const strWithoutSlash = str.slice(1);
            if (strWithoutSlash.endsWith('/')) {
              return strWithoutSlash.slice(0, -1);
            }
            return strWithoutSlash;
          }
          return str;
        };
        const transformedPath = transformPath(rPath);
        if (!transformedPath) {
          return rName;
        }
        if (transformedPath.endsWith('/')) {
          return `${transformedPath}${rName}`;
        }
        return `${transformedPath}/${rName}`;
      };
      function inferAutoPublicPath(url) {
        return url
          .replace(/#.*$/, '')
          .replace(/\?.*$/, '')
          .replace(/\/[^\/]+$/, '/');
      }
      // Priority: overrides > remotes
      // eslint-disable-next-line max-lines-per-function
      function generateSnapshotFromManifest(manifest, options = {}) {
        var _manifest_metaData, _manifest_metaData1;
        const { remotes = {}, overrides = {}, version } = options;
        let remoteSnapshot;
        const getPublicPath = () => {
          if ('publicPath' in manifest.metaData) {
            if (manifest.metaData.publicPath === 'auto' && version) {
              // use same implementation as publicPath auto runtime module implements
              return inferAutoPublicPath(version);
            }
            return manifest.metaData.publicPath;
          } else {
            return manifest.metaData.getPublicPath;
          }
        };
        const overridesKeys = Object.keys(overrides);
        let remotesInfo = {};
        // If remotes are not provided, only the remotes in the manifest will be read
        if (!Object.keys(remotes).length) {
          var _manifest_remotes;
          remotesInfo =
            ((_manifest_remotes = manifest.remotes) == null
              ? void 0
              : _manifest_remotes.reduce((res, next) => {
                  let matchedVersion;
                  const name = next.federationContainerName;
                  // overrides have higher priority
                  if (overridesKeys.includes(name)) {
                    matchedVersion = overrides[name];
                  } else {
                    if ('version' in next) {
                      matchedVersion = next.version;
                    } else {
                      matchedVersion = next.entry;
                    }
                  }
                  res[name] = {
                    matchedVersion,
                  };
                  return res;
                }, {})) || {};
        }
        // If remotes (deploy scenario) are specified, they need to be traversed again
        Object.keys(remotes).forEach(
          (key) =>
            (remotesInfo[key] = {
              // overrides will override dependencies
              matchedVersion: overridesKeys.includes(key)
                ? overrides[key]
                : remotes[key],
            }),
        );
        const {
          remoteEntry: {
            path: remoteEntryPath,
            name: remoteEntryName,
            type: remoteEntryType,
          },
          types: remoteTypes,
          buildInfo: { buildVersion },
          globalName,
          ssrRemoteEntry,
        } = manifest.metaData;
        const { exposes } = manifest;
        let basicRemoteSnapshot = {
          version: version ? version : '',
          buildVersion,
          globalName,
          remoteEntry: simpleJoinRemoteEntry(remoteEntryPath, remoteEntryName),
          remoteEntryType,
          remoteTypes: simpleJoinRemoteEntry(
            remoteTypes.path,
            remoteTypes.name,
          ),
          remoteTypesZip: remoteTypes.zip || '',
          remoteTypesAPI: remoteTypes.api || '',
          remotesInfo,
          shared:
            manifest == null
              ? void 0
              : manifest.shared.map((item) => ({
                  assets: item.assets,
                  sharedName: item.name,
                  version: item.version,
                })),
          modules:
            exposes == null
              ? void 0
              : exposes.map((expose) => ({
                  moduleName: expose.name,
                  modulePath: expose.path,
                  assets: expose.assets,
                })),
        };
        if (
          (_manifest_metaData = manifest.metaData) == null
            ? void 0
            : _manifest_metaData.prefetchInterface
        ) {
          const prefetchInterface = manifest.metaData.prefetchInterface;
          basicRemoteSnapshot = polyfills._extends({}, basicRemoteSnapshot, {
            prefetchInterface,
          });
        }
        if (
          (_manifest_metaData1 = manifest.metaData) == null
            ? void 0
            : _manifest_metaData1.prefetchEntry
        ) {
          const { path, name, type } = manifest.metaData.prefetchEntry;
          basicRemoteSnapshot = polyfills._extends({}, basicRemoteSnapshot, {
            prefetchEntry: simpleJoinRemoteEntry(path, name),
            prefetchEntryType: type,
          });
        }
        if ('publicPath' in manifest.metaData) {
          remoteSnapshot = polyfills._extends({}, basicRemoteSnapshot, {
            publicPath: getPublicPath(),
          });
        } else {
          remoteSnapshot = polyfills._extends({}, basicRemoteSnapshot, {
            getPublicPath: getPublicPath(),
          });
        }
        if (ssrRemoteEntry) {
          const fullSSRRemoteEntry = simpleJoinRemoteEntry(
            ssrRemoteEntry.path,
            ssrRemoteEntry.name,
          );
          remoteSnapshot.ssrRemoteEntry = fullSSRRemoteEntry;
          remoteSnapshot.ssrRemoteEntryType =
            ssrRemoteEntry.type || 'commonjs-module';
        }
        return remoteSnapshot;
      }
      function isManifestProvider(moduleInfo) {
        if (
          'remoteEntry' in moduleInfo &&
          moduleInfo.remoteEntry.includes(MANIFEST_EXT)
        ) {
          return true;
        } else {
          return false;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async function safeWrapper(callback, disableWarn) {
        try {
          const res = await callback();
          return res;
        } catch (e) {
          !disableWarn && warn(e);
          return;
        }
      }
      function isStaticResourcesEqual(url1, url2) {
        const REG_EXP = /^(https?:)?\/\//i;
        // Transform url1 and url2 into relative paths
        const relativeUrl1 = url1.replace(REG_EXP, '').replace(/\/$/, '');
        const relativeUrl2 = url2.replace(REG_EXP, '').replace(/\/$/, '');
        // Check if the relative paths are identical
        return relativeUrl1 === relativeUrl2;
      }
      function createScript(info) {
        // Retrieve the existing script element by its src attribute
        let script = null;
        let needAttach = true;
        let timeout = 20000;
        let timeoutId;
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const s = scripts[i];
          const scriptSrc = s.getAttribute('src');
          if (scriptSrc && isStaticResourcesEqual(scriptSrc, info.url)) {
            script = s;
            needAttach = false;
            break;
          }
        }
        if (!script) {
          const attrs = info.attrs;
          script = document.createElement('script');
          script.type =
            (attrs == null ? void 0 : attrs['type']) === 'module'
              ? 'module'
              : 'text/javascript';
          let createScriptRes = undefined;
          if (info.createScriptHook) {
            createScriptRes = info.createScriptHook(info.url, info.attrs);
            if (createScriptRes instanceof HTMLScriptElement) {
              script = createScriptRes;
            } else if (typeof createScriptRes === 'object') {
              if ('script' in createScriptRes && createScriptRes.script) {
                script = createScriptRes.script;
              }
              if ('timeout' in createScriptRes && createScriptRes.timeout) {
                timeout = createScriptRes.timeout;
              }
            }
          }
          if (!script.src) {
            script.src = info.url;
          }
          if (attrs && !createScriptRes) {
            Object.keys(attrs).forEach((name) => {
              if (script) {
                if (name === 'async' || name === 'defer') {
                  script[name] = attrs[name];
                  // Attributes that do not exist are considered overridden
                } else if (!script.getAttribute(name)) {
                  script.setAttribute(name, attrs[name]);
                }
              }
            });
          }
        }
        const onScriptComplete = async (
          prev, // eslint-disable-next-line @typescript-eslint/no-explicit-any
          event,
        ) => {
          var _info_cb;
          clearTimeout(timeoutId);
          // Prevent memory leaks in IE.
          if (script) {
            script.onerror = null;
            script.onload = null;
            safeWrapper(() => {
              const { needDeleteScript = true } = info;
              if (needDeleteScript) {
                (script == null ? void 0 : script.parentNode) &&
                  script.parentNode.removeChild(script);
              }
            });
            if (prev && typeof prev === 'function') {
              var _info_cb1;
              const result = prev(event);
              if (result instanceof Promise) {
                var _info_cb2;
                const res = await result;
                info == null
                  ? void 0
                  : (_info_cb2 = info.cb) == null
                    ? void 0
                    : _info_cb2.call(info);
                return res;
              }
              info == null
                ? void 0
                : (_info_cb1 = info.cb) == null
                  ? void 0
                  : _info_cb1.call(info);
              return result;
            }
          }
          info == null
            ? void 0
            : (_info_cb = info.cb) == null
              ? void 0
              : _info_cb.call(info);
        };
        script.onerror = onScriptComplete.bind(null, script.onerror);
        script.onload = onScriptComplete.bind(null, script.onload);
        timeoutId = setTimeout(() => {
          onScriptComplete(
            null,
            new Error(`Remote script "${info.url}" time-outed.`),
          );
        }, timeout);
        return {
          script,
          needAttach,
        };
      }
      function createLink(info) {
        // <link rel="preload" href="script.js" as="script">
        // Retrieve the existing script element by its src attribute
        let link = null;
        let needAttach = true;
        const links = document.getElementsByTagName('link');
        for (let i = 0; i < links.length; i++) {
          const l = links[i];
          const linkHref = l.getAttribute('href');
          const linkRef = l.getAttribute('ref');
          if (
            linkHref &&
            isStaticResourcesEqual(linkHref, info.url) &&
            linkRef === info.attrs['ref']
          ) {
            link = l;
            needAttach = false;
            break;
          }
        }
        if (!link) {
          link = document.createElement('link');
          link.setAttribute('href', info.url);
          let createLinkRes = undefined;
          const attrs = info.attrs;
          if (info.createLinkHook) {
            createLinkRes = info.createLinkHook(info.url, attrs);
            if (createLinkRes instanceof HTMLLinkElement) {
              link = createLinkRes;
            }
          }
          if (attrs && !createLinkRes) {
            Object.keys(attrs).forEach((name) => {
              if (link && !link.getAttribute(name)) {
                link.setAttribute(name, attrs[name]);
              }
            });
          }
        }
        const onLinkComplete = (
          prev, // eslint-disable-next-line @typescript-eslint/no-explicit-any
          event,
        ) => {
          // Prevent memory leaks in IE.
          if (link) {
            link.onerror = null;
            link.onload = null;
            safeWrapper(() => {
              const { needDeleteLink = true } = info;
              if (needDeleteLink) {
                (link == null ? void 0 : link.parentNode) &&
                  link.parentNode.removeChild(link);
              }
            });
            if (prev) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const res = prev(event);
              info.cb();
              return res;
            }
          }
          info.cb();
        };
        link.onerror = onLinkComplete.bind(null, link.onerror);
        link.onload = onLinkComplete.bind(null, link.onload);
        return {
          link,
          needAttach,
        };
      }
      function loadScript(url, info) {
        const { attrs = {}, createScriptHook } = info;
        return new Promise((resolve, _reject) => {
          const { script, needAttach } = createScript({
            url,
            cb: resolve,
            attrs: polyfills._extends(
              {
                fetchpriority: 'high',
              },
              attrs,
            ),
            createScriptHook,
            needDeleteScript: true,
          });
          needAttach && document.head.appendChild(script);
        });
      }

      function importNodeModule(name) {
        if (!name) {
          throw new Error('import specifier is required');
        }
        const importModule = new Function('name', `return import(name)`);
        return importModule(name)
          .then((res) => res)
          .catch((error) => {
            console.error(`Error importing module ${name}:`, error);
            throw error;
          });
      }
      const loadNodeFetch = async () => {
        const fetchModule = await importNodeModule('node-fetch');
        return fetchModule.default || fetchModule;
      };
      const lazyLoaderHookFetch = async (input, init, loaderHook) => {
        const hook = (url, init) => {
          return loaderHook.lifecycle.fetch.emit(url, init);
        };
        const res = await hook(input, init || {});
        if (!res || !(res instanceof Response)) {
          const fetchFunction =
            typeof fetch === 'undefined' ? await loadNodeFetch() : fetch;
          return fetchFunction(input, init || {});
        }
        return res;
      };
      function createScriptNode(url, cb, attrs, loaderHook) {
        if (loaderHook == null ? void 0 : loaderHook.createScriptHook) {
          const hookResult = loaderHook.createScriptHook(url);
          if (
            hookResult &&
            typeof hookResult === 'object' &&
            'url' in hookResult
          ) {
            url = hookResult.url;
          }
        }
        let urlObj;
        try {
          urlObj = new URL(url);
        } catch (e) {
          console.error('Error constructing URL:', e);
          cb(new Error(`Invalid URL: ${e}`));
          return;
        }
        const getFetch = async () => {
          if (loaderHook == null ? void 0 : loaderHook.fetch) {
            return (input, init) =>
              lazyLoaderHookFetch(input, init, loaderHook);
          }
          return typeof fetch === 'undefined' ? loadNodeFetch() : fetch;
        };
        const handleScriptFetch = async (f, urlObj) => {
          try {
            var //@ts-ignore
              _vm_constants;
            const res = await f(urlObj.href);
            const data = await res.text();
            const [path, vm] = await Promise.all([
              importNodeModule('path'),
              importNodeModule('vm'),
            ]);
            const scriptContext = {
              exports: {},
              module: {
                exports: {},
              },
            };
            const urlDirname = urlObj.pathname
              .split('/')
              .slice(0, -1)
              .join('/');
            const filename = path.basename(urlObj.pathname);
            var _vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER;
            const script = new vm.Script(
              `(function(exports, module, require, __dirname, __filename) {${data}\n})`,
              {
                filename,
                importModuleDynamically:
                  (_vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER =
                    (_vm_constants = vm.constants) == null
                      ? void 0
                      : _vm_constants.USE_MAIN_CONTEXT_DEFAULT_LOADER) != null
                    ? _vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER
                    : importNodeModule,
              },
            );
            script.runInThisContext()(
              scriptContext.exports,
              scriptContext.module,
              eval('require'),
              urlDirname,
              filename,
            );
            const exportedInterface =
              scriptContext.module.exports || scriptContext.exports;
            if (attrs && exportedInterface && attrs['globalName']) {
              const container =
                exportedInterface[attrs['globalName']] || exportedInterface;
              cb(undefined, container);
              return;
            }
            cb(undefined, exportedInterface);
          } catch (e) {
            cb(
              e instanceof Error
                ? e
                : new Error(`Script execution error: ${e}`),
            );
          }
        };
        getFetch()
          .then(async (f) => {
            if (
              (attrs == null ? void 0 : attrs['type']) === 'esm' ||
              (attrs == null ? void 0 : attrs['type']) === 'module'
            ) {
              return loadModule(urlObj.href, {
                fetch: f,
                vm: await importNodeModule('vm'),
              })
                .then(async (module) => {
                  await module.evaluate();
                  cb(undefined, module.namespace);
                })
                .catch((e) => {
                  cb(
                    e instanceof Error
                      ? e
                      : new Error(`Script execution error: ${e}`),
                  );
                });
            }
            handleScriptFetch(f, urlObj);
          })
          .catch((err) => {
            cb(err);
          });
      }
      function loadScriptNode(url, info) {
        return new Promise((resolve, reject) => {
          createScriptNode(
            url,
            (error, scriptContext) => {
              if (error) {
                reject(error);
              } else {
                var _info_attrs, _info_attrs1;
                const remoteEntryKey =
                  (info == null
                    ? void 0
                    : (_info_attrs = info.attrs) == null
                      ? void 0
                      : _info_attrs['globalName']) ||
                  `__FEDERATION_${info == null ? void 0 : (_info_attrs1 = info.attrs) == null ? void 0 : _info_attrs1['name']}:custom__`;
                const entryExports = (globalThis[remoteEntryKey] =
                  scriptContext);
                resolve(entryExports);
              }
            },
            info.attrs,
            info.loaderHook,
          );
        });
      }
      async function loadModule(url, options) {
        const { fetch: fetch1, vm } = options;
        const response = await fetch1(url);
        const code = await response.text();
        const module = new vm.SourceTextModule(code, {
          // @ts-ignore
          importModuleDynamically: async (specifier, script) => {
            const resolvedUrl = new URL(specifier, url).href;
            return loadModule(resolvedUrl, options);
          },
        });
        await module.link(async (specifier) => {
          const resolvedUrl = new URL(specifier, url).href;
          const module = await loadModule(resolvedUrl, options);
          return module;
        });
        return module;
      }

      function normalizeOptions(enableDefault, defaultOptions, key) {
        return function (options) {
          if (options === false) {
            return false;
          }
          if (typeof options === 'undefined') {
            if (enableDefault) {
              return defaultOptions;
            } else {
              return false;
            }
          }
          if (options === true) {
            return defaultOptions;
          }
          if (options && typeof options === 'object') {
            return polyfills._extends({}, defaultOptions, options);
          }
          throw new Error(
            `Unexpected type for \`${key}\`, expect boolean/undefined/object, got: ${typeof options}`,
          );
        };
      }

      exports.BROWSER_LOG_KEY = BROWSER_LOG_KEY;
      exports.BROWSER_LOG_VALUE = BROWSER_LOG_VALUE;
      exports.ENCODE_NAME_PREFIX = ENCODE_NAME_PREFIX;
      exports.EncodedNameTransformMap = EncodedNameTransformMap;
      exports.FederationModuleManifest = FederationModuleManifest;
      exports.MANIFEST_EXT = MANIFEST_EXT;
      exports.MFModuleType = MFModuleType;
      exports.MFPrefetchCommon = MFPrefetchCommon;
      exports.MODULE_DEVTOOL_IDENTIFIER = MODULE_DEVTOOL_IDENTIFIER;
      exports.ManifestFileName = ManifestFileName;
      exports.NameTransformMap = NameTransformMap;
      exports.NameTransformSymbol = NameTransformSymbol;
      exports.SEPARATOR = SEPARATOR;
      exports.StatsFileName = StatsFileName;
      exports.TEMP_DIR = TEMP_DIR;
      exports.assert = assert;
      exports.composeKeyWithSeparator = composeKeyWithSeparator;
      exports.containerPlugin = ContainerPlugin;
      exports.containerReferencePlugin = ContainerReferencePlugin;
      exports.createLink = createLink;
      exports.createLogger = createLogger;
      exports.createScript = createScript;
      exports.createScriptNode = createScriptNode;
      exports.decodeName = decodeName;
      exports.encodeName = encodeName;
      exports.error = error;
      exports.generateExposeFilename = generateExposeFilename;
      exports.generateShareFilename = generateShareFilename;
      exports.generateSnapshotFromManifest = generateSnapshotFromManifest;
      exports.getProcessEnv = getProcessEnv;
      exports.getResourceUrl = getResourceUrl;
      exports.inferAutoPublicPath = inferAutoPublicPath;
      exports.isBrowserEnv = isBrowserEnv;
      exports.isDebugMode = isDebugMode;
      exports.isManifestProvider = isManifestProvider;
      exports.isRequiredVersion = isRequiredVersion;
      exports.isStaticResourcesEqual = isStaticResourcesEqual;
      exports.loadScript = loadScript;
      exports.loadScriptNode = loadScriptNode;
      exports.logger = logger;
      exports.moduleFederationPlugin = ModuleFederationPlugin;
      exports.normalizeOptions = normalizeOptions;
      exports.parseEntry = parseEntry;
      exports.safeToString = safeToString;
      exports.safeWrapper = safeWrapper;
      exports.sharePlugin = SharePlugin;
      exports.simpleJoinRemoteEntry = simpleJoinRemoteEntry;
      exports.warn = warn;

      /***/
    },

  /***/ 931:
    /*!************************************************!*\
  !*** ../../../../../sdk/dist/polyfills.cjs.js ***!
  \************************************************/
    /***/ (__unused_webpack_module, exports) => {
      function _extends() {
        _extends =
          Object.assign ||
          function assign(target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source)
                if (Object.prototype.hasOwnProperty.call(source, key))
                  target[key] = source[key];
            }
            return target;
          };
        return _extends.apply(this, arguments);
      }

      exports._extends = _extends;

      /***/
    },

  /***/ 594:
    /*!*******************************************************************!*\
  !*** ../../../../../webpack-bundler-runtime/dist/constant.cjs.js ***!
  \*******************************************************************/
    /***/ (__unused_webpack_module, exports, __webpack_require__) => {
      var sdk = __webpack_require__(/*! @module-federation/sdk */ 463);

      const FEDERATION_SUPPORTED_TYPES = ['script'];

      Object.defineProperty(exports, 'ENCODE_NAME_PREFIX', {
        enumerable: true,
        get: function () {
          return sdk.ENCODE_NAME_PREFIX;
        },
      });
      exports.FEDERATION_SUPPORTED_TYPES = FEDERATION_SUPPORTED_TYPES;

      /***/
    },

  /***/ 956:
    /*!****************************************************************!*\
  !*** ../../../../../webpack-bundler-runtime/dist/index.cjs.js ***!
  \****************************************************************/
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var runtime = __webpack_require__(/*! @module-federation/runtime */ 247);
      var constant = __webpack_require__(/*! ./constant.cjs.js */ 594);
      var sdk = __webpack_require__(/*! @module-federation/sdk */ 463);
      var polyfills = __webpack_require__(/*! ./polyfills.cjs.js */ 464);

      function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
          Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
              var d = Object.getOwnPropertyDescriptor(e, k);
              Object.defineProperty(
                n,
                k,
                d.get
                  ? d
                  : {
                      enumerable: true,
                      get: function () {
                        return e[k];
                      },
                    },
              );
            }
          });
        }
        n.default = e;
        return Object.freeze(n);
      }

      var runtime__namespace = /*#__PURE__*/ _interopNamespaceDefault(runtime);

      function attachShareScopeMap(webpackRequire) {
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

      function remotes(options) {
        const {
          chunkId,
          promises,
          chunkMapping,
          idToExternalAndNameMapping,
          webpackRequire,
          idToRemoteMap,
        } = options;
        attachShareScopeMap(webpackRequire);
        if (webpackRequire.o(chunkMapping, chunkId)) {
          chunkMapping[chunkId].forEach((id) => {
            let getScope = webpackRequire.R;
            if (!getScope) {
              getScope = [];
            }
            const data = idToExternalAndNameMapping[id];
            const remoteInfos = idToRemoteMap[id];
            // @ts-ignore seems not work
            if (getScope.indexOf(data) >= 0) {
              return;
            }
            // @ts-ignore seems not work
            getScope.push(data);
            if (data.p) {
              return promises.push(data.p);
            }
            const onError = (error) => {
              if (!error) {
                error = new Error('Container missing');
              }
              if (typeof error.message === 'string') {
                error.message += `\nwhile loading "${data[1]}" from ${data[2]}`;
              }
              webpackRequire.m[id] = () => {
                throw error;
              };
              data.p = 0;
            };
            const handleFunction = (fn, arg1, arg2, d, next, first) => {
              try {
                const promise = fn(arg1, arg2);
                if (promise && promise.then) {
                  const p = promise.then((result) => next(result, d), onError);
                  if (first) {
                    promises.push((data.p = p));
                  } else {
                    return p;
                  }
                } else {
                  return next(promise, d, first);
                }
              } catch (error) {
                onError(error);
              }
            };
            const onExternal = (external, _, first) =>
              external
                ? handleFunction(
                    webpackRequire.I,
                    data[0],
                    0,
                    external,
                    onInitialized,
                    first,
                  )
                : onError();
            // eslint-disable-next-line no-var
            var onInitialized = (_, external, first) =>
              handleFunction(
                external.get,
                data[1],
                getScope,
                0,
                onFactory,
                first,
              );
            // eslint-disable-next-line no-var
            var onFactory = (factory) => {
              data.p = 1;
              webpackRequire.m[id] = (module) => {
                module.exports = factory();
              };
            };
            const onRemoteLoaded = () => {
              try {
                const remoteName = sdk.decodeName(
                  remoteInfos[0].name,
                  sdk.ENCODE_NAME_PREFIX,
                );
                const remoteModuleName = remoteName + data[1].slice(1);
                const instance = webpackRequire.federation.instance;
                const loadRemote = () =>
                  webpackRequire.federation.instance.loadRemote(
                    remoteModuleName,
                    {
                      loadFactory: false,
                      from: 'build',
                    },
                  );
                if (instance.options.shareStrategy === 'version-first') {
                  return Promise.all(
                    instance.sharedHandler.initializeSharing(data[0]),
                  ).then(() => {
                    return loadRemote();
                  });
                }
                return loadRemote();
              } catch (error) {
                onError(error);
              }
            };
            const useRuntimeLoad =
              remoteInfos.length === 1 &&
              constant.FEDERATION_SUPPORTED_TYPES.includes(
                remoteInfos[0].externalType,
              ) &&
              remoteInfos[0].name;
            if (useRuntimeLoad) {
              handleFunction(onRemoteLoaded, data[2], 0, 0, onFactory, 1);
            } else {
              handleFunction(webpackRequire, data[2], 0, 0, onExternal, 1);
            }
          });
        }
      }

      function consumes(options) {
        const {
          chunkId,
          promises,
          chunkMapping,
          installedModules,
          moduleToHandlerMapping,
          webpackRequire,
        } = options;
        attachShareScopeMap(webpackRequire);
        if (webpackRequire.o(chunkMapping, chunkId)) {
          chunkMapping[chunkId].forEach((id) => {
            if (webpackRequire.o(installedModules, id)) {
              return promises.push(installedModules[id]);
            }
            const onFactory = (factory) => {
              installedModules[id] = 0;
              webpackRequire.m[id] = (module) => {
                delete webpackRequire.c[id];
                module.exports = factory();
              };
            };
            const onError = (error) => {
              delete installedModules[id];
              webpackRequire.m[id] = (module) => {
                delete webpackRequire.c[id];
                throw error;
              };
            };
            try {
              var _shareInfo_shareConfig, _shareInfo_shareConfig1;
              const federationInstance = webpackRequire.federation.instance;
              if (!federationInstance) {
                throw new Error('Federation instance not found!');
              }
              const { shareKey, getter, shareInfo } =
                moduleToHandlerMapping[id];
              console.log('Loading share:', {
                shareKey,
                shareInfo,
                layer:
                  shareInfo == null
                    ? void 0
                    : (_shareInfo_shareConfig = shareInfo.shareConfig) == null
                      ? void 0
                      : _shareInfo_shareConfig.layer,
                issuerLayer:
                  shareInfo == null
                    ? void 0
                    : (_shareInfo_shareConfig1 = shareInfo.shareConfig) == null
                      ? void 0
                      : _shareInfo_shareConfig1.issuerLayer,
              });
              debugger;
              const promise = federationInstance
                .loadShare(shareKey, {
                  customShareInfo: shareInfo,
                })
                .then((factory) => {
                  if (factory === false) {
                    return getter();
                  }
                  return factory;
                });
              if (promise.then) {
                promises.push(
                  (installedModules[id] = promise
                    .then(onFactory)
                    .catch(onError)),
                );
              } else {
                // @ts-ignore maintain previous logic
                onFactory(promise);
              }
            } catch (e) {
              onError(e);
            }
          });
        }
      }

      function initializeSharing({
        shareScopeName,
        webpackRequire,
        initPromises,
        initTokens,
        initScope,
      }) {
        if (!initScope) initScope = [];
        const mfInstance = webpackRequire.federation.instance;
        // handling circular init calls
        var initToken = initTokens[shareScopeName];
        if (!initToken)
          initToken = initTokens[shareScopeName] = {
            from: mfInstance.name,
          };
        if (initScope.indexOf(initToken) >= 0) return;
        initScope.push(initToken);
        const promise = initPromises[shareScopeName];
        if (promise) return promise;
        var warn = (msg) =>
          typeof console !== 'undefined' && console.warn && console.warn(msg);
        var initExternal = (id) => {
          var handleError = (err) =>
            warn('Initialization of sharing external failed: ' + err);
          try {
            var module = webpackRequire(id);
            if (!module) return;
            var initFn = (module) =>
              module &&
              module.init && // @ts-ignore compat legacy mf shared behavior
              module.init(webpackRequire.S[shareScopeName], initScope);
            if (module.then)
              return promises.push(module.then(initFn, handleError));
            var initResult = initFn(module);
            // @ts-ignore
            if (
              initResult &&
              typeof initResult !== 'boolean' &&
              initResult.then
            )
              // @ts-ignore
              return promises.push(initResult['catch'](handleError));
          } catch (err) {
            handleError(err);
          }
        };
        const promises = mfInstance.initializeSharing(shareScopeName, {
          strategy: mfInstance.options.shareStrategy,
          initScope,
          from: 'build',
        });
        attachShareScopeMap(webpackRequire);
        const bundlerRuntimeRemotesOptions =
          webpackRequire.federation.bundlerRuntimeOptions.remotes;
        if (bundlerRuntimeRemotesOptions) {
          Object.keys(bundlerRuntimeRemotesOptions.idToRemoteMap).forEach(
            (moduleId) => {
              const info = bundlerRuntimeRemotesOptions.idToRemoteMap[moduleId];
              const externalModuleId =
                bundlerRuntimeRemotesOptions.idToExternalAndNameMapping[
                  moduleId
                ][2];
              if (info.length > 1) {
                initExternal(externalModuleId);
              } else if (info.length === 1) {
                const remoteInfo = info[0];
                if (
                  !constant.FEDERATION_SUPPORTED_TYPES.includes(
                    remoteInfo.externalType,
                  )
                ) {
                  initExternal(externalModuleId);
                }
              }
            },
          );
        }
        if (!promises.length) {
          return (initPromises[shareScopeName] = true);
        }
        return (initPromises[shareScopeName] = Promise.all(promises).then(
          () => (initPromises[shareScopeName] = true),
        ));
      }

      function handleInitialConsumes(options) {
        const { moduleId, moduleToHandlerMapping, webpackRequire } = options;
        const federationInstance = webpackRequire.federation.instance;
        if (!federationInstance) {
          throw new Error('Federation instance not found!');
        }
        const { shareKey, shareInfo } = moduleToHandlerMapping[moduleId];
        try {
          return federationInstance.loadShareSync(shareKey, {
            customShareInfo: shareInfo,
          });
        } catch (err) {
          console.error(
            'loadShareSync failed! The function should not be called unless you set "eager:true". If you do not set it, and encounter this issue, you can check whether an async boundary is implemented.',
          );
          console.error('The original error message is as follows: ');
          throw err;
        }
      }
      function installInitialConsumes(options) {
        const {
          moduleToHandlerMapping,
          webpackRequire,
          installedModules,
          initialConsumes,
        } = options;
        initialConsumes.forEach((id) => {
          webpackRequire.m[id] = (module) => {
            // Handle scenario when module is used synchronously
            installedModules[id] = 0;
            delete webpackRequire.c[id];
            const factory = handleInitialConsumes({
              moduleId: id,
              moduleToHandlerMapping,
              webpackRequire,
            });
            if (typeof factory !== 'function') {
              throw new Error(
                `Shared module is not available for eager consumption: ${id}`,
              );
            }
            module.exports = factory();
          };
        });
      }

      function initContainerEntry(options) {
        const {
          webpackRequire,
          shareScope,
          initScope,
          shareScopeKey,
          remoteEntryInitOptions,
        } = options;
        if (!webpackRequire.S) return;
        if (
          !webpackRequire.federation ||
          !webpackRequire.federation.instance ||
          !webpackRequire.federation.initOptions
        )
          return;
        const federationInstance = webpackRequire.federation.instance;
        var name = shareScopeKey || 'default';
        federationInstance.initOptions(
          polyfills._extends(
            {
              name: webpackRequire.federation.initOptions.name,
              remotes: [],
            },
            remoteEntryInitOptions,
          ),
        );
        federationInstance.initShareScopeMap(name, shareScope, {
          hostShareScopeMap:
            (remoteEntryInitOptions == null
              ? void 0
              : remoteEntryInitOptions.shareScopeMap) || {},
        });
        if (webpackRequire.federation.attachShareScopeMap) {
          webpackRequire.federation.attachShareScopeMap(webpackRequire);
        }
        if (typeof webpackRequire.federation.prefetch === 'function') {
          webpackRequire.federation.prefetch();
        }
        // @ts-ignore
        return webpackRequire.I(name, initScope);
      }

      const federation = {
        runtime: runtime__namespace,
        instance: undefined,
        initOptions: undefined,
        bundlerRuntime: {
          remotes,
          consumes,
          I: initializeSharing,
          S: {},
          installInitialConsumes,
          initContainerEntry,
        },
        attachShareScopeMap,
        bundlerRuntimeOptions: {},
      };

      module.exports = federation;

      /***/
    },

  /***/ 464:
    /*!********************************************************************!*\
  !*** ../../../../../webpack-bundler-runtime/dist/polyfills.cjs.js ***!
  \********************************************************************/
    /***/ (__unused_webpack_module, exports) => {
      function _extends() {
        _extends =
          Object.assign ||
          function assign(target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source)
                if (Object.prototype.hasOwnProperty.call(source, key))
                  target[key] = source[key];
            }
            return target;
          };
        return _extends.apply(this, arguments);
      }

      exports._extends = _extends;

      /***/
    },

  /***/ 340:
    /*!***********************!*\
  !*** container entry ***!
  \***********************/
    /***/ (__unused_webpack_module, exports, __webpack_require__) => {
      var moduleMap = {
        './ComponentB': () => {
          return Promise.all(
            /*! __federation_expose_ComponentB */ [
              __webpack_require__.e(230),
              __webpack_require__.e(477),
            ],
          ).then(() => () => __webpack_require__(/*! ./ComponentB */ 734));
        },
        './ComponentC': () => {
          return Promise.all(
            /*! __federation_expose_ComponentC */ [
              __webpack_require__.e(230),
              __webpack_require__.e(425),
              __webpack_require__.e(668),
            ],
          ).then(() => () => __webpack_require__(/*! ./ComponentC */ 453));
        },
      };
      var get = (module, getScope) => {
        __webpack_require__.R = getScope;
        getScope = __webpack_require__.o(moduleMap, module)
          ? moduleMap[module]()
          : Promise.resolve().then(() => {
              throw new Error(
                'Module "' + module + '" does not exist in container.',
              );
            });
        __webpack_require__.R = undefined;
        return getScope;
      };
      var init = (shareScope, initScope, remoteEntryInitOptions) => {
        return __webpack_require__.federation.bundlerRuntime.initContainerEntry(
          {
            webpackRequire: __webpack_require__,
            shareScope: shareScope,
            initScope: initScope,
            remoteEntryInitOptions: remoteEntryInitOptions,
            shareScopeKey: 'default',
          },
        );
      };

      __webpack_require__(
        /*! ../../../../node_modules/.federation/entry.6136f28307fdffaf282b30f3aa33aa4a.js */ 815,
      );

      // This exports getters to disallow modifications
      __webpack_require__.d(exports, {
        get: () => get,
        init: () => init,
      });

      /***/
    },

  /***/ 911:
    /*!***********************************************************!*\
  !*** external "../../3-layers-full/module/container.mjs" ***!
  \***********************************************************/
    /***/ (module) => {
      module.exports =
        __WEBPACK_EXTERNAL_MODULE__3_layers_full_module_container_mjs_552ff716__;

      /***/
    },

  /***/ 342:
    /*!**********************************!*\
  !*** external "./container.mjs" ***!
  \**********************************/
    /***/ (module) => {
      module.exports = __WEBPACK_EXTERNAL_MODULE__container_mjs_6f4cf51f__;

      /***/
    },

  /***/ 857:
    /*!*********************!*\
  !*** external "os" ***!
  \*********************/
    /***/ (module) => {
      module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)('os');

      /***/
    },

  /***/ 932:
    /*!**************************!*\
  !*** external "process" ***!
  \**************************/
    /***/ (module) => {
      module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)(
        'process',
      );

      /***/
    },

  /***/ 18:
    /*!**********************!*\
  !*** external "tty" ***!
  \**********************/
    /***/ (module) => {
      module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)('tty');

      /***/
    },

  /***/ 390:
    /*!*********************************************************************************************************************!*\
  !*** ../../../../../../node_modules/.pnpm/isomorphic-rslog@0.0.6/node_modules/isomorphic-rslog/dist/node/index.cjs ***!
  \*********************************************************************************************************************/
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var __create = Object.create;
      var __defProp = Object.defineProperty;
      var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
      var __getOwnPropNames = Object.getOwnPropertyNames;
      var __getProtoOf = Object.getPrototypeOf;
      var __hasOwnProp = Object.prototype.hasOwnProperty;
      var __export = (target, all) => {
        for (var name in all)
          __defProp(target, name, { get: all[name], enumerable: true });
      };
      var __copyProps = (to, from, except, desc) => {
        if ((from && typeof from === 'object') || typeof from === 'function') {
          for (let key of __getOwnPropNames(from))
            if (!__hasOwnProp.call(to, key) && key !== except)
              __defProp(to, key, {
                get: () => from[key],
                enumerable:
                  !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
              });
        }
        return to;
      };
      var __toESM = (mod, isNodeMode, target) => (
        (target = mod != null ? __create(__getProtoOf(mod)) : {}),
        __copyProps(
          // If the importer is in node compatibility mode or this is not an ESM
          // file that has been converted to a CommonJS file using a Babel-
          // compatible transform (i.e. "__esModule" has not been set), then set
          // "default" to the CommonJS "module.exports" for node compatibility.
          isNodeMode || !mod || !mod.__esModule
            ? __defProp(target, 'default', { value: mod, enumerable: true })
            : target,
          mod,
        )
      );
      var __toCommonJS = (mod) =>
        __copyProps(__defProp({}, '__esModule', { value: true }), mod);

      // src/node/index.ts
      var node_exports = {};
      __export(node_exports, {
        createLogger: () => createLogger2,
        logger: () => logger,
      });
      module.exports = __toCommonJS(node_exports);

      // src/constants.ts
      var LOG_LEVEL = {
        error: 0,
        warn: 1,
        info: 2,
        log: 3,
        verbose: 4,
      };

      // src/utils.ts
      var errorStackRegExp = /at\s.*:\d+:\d+[\s\)]*$/;
      var anonymousErrorStackRegExp = /at\s.*\(<anonymous>\)$/;
      var isErrorStackMessage = (message) =>
        errorStackRegExp.test(message) ||
        anonymousErrorStackRegExp.test(message);

      // src/createLogger.ts
      var createLogger = (
        options = {},
        {
          getLabel: getLabel2,
          handleError,
          finalLog: finalLog2,
          greet,
          LOG_TYPES: LOG_TYPES2,
        },
      ) => {
        let maxLevel = options.level || 'log';
        let customLabels = options.labels || {};
        let log = (type, message, ...args) => {
          if (LOG_LEVEL[LOG_TYPES2[type].level] > LOG_LEVEL[maxLevel]) {
            return;
          }
          if (message === void 0 || message === null) {
            return console.log();
          }
          let logType = LOG_TYPES2[type];
          let text = '';
          const label = getLabel2(type, logType, customLabels);
          if (message instanceof Error) {
            if (message.stack) {
              let [name, ...rest] = message.stack.split('\n');
              if (name.startsWith('Error: ')) {
                name = name.slice(7);
              }
              text = `${name}
${handleError(rest.join('\n'))}`;
            } else {
              text = message.message;
            }
          } else if (logType.level === 'error' && typeof message === 'string') {
            let lines = message.split('\n');
            text = lines
              .map((line) =>
                isErrorStackMessage(line) ? handleError(line) : line,
              )
              .join('\n');
          } else {
            text = `${message}`;
          }
          finalLog2(label, text, args, message);
        };
        let logger2 = {
          // greet
          greet: (message) => log('log', greet(message)),
        };
        Object.keys(LOG_TYPES2).forEach((key) => {
          logger2[key] = (...args) => log(key, ...args);
        });
        Object.defineProperty(logger2, 'level', {
          get: () => maxLevel,
          set(val) {
            maxLevel = val;
          },
        });
        Object.defineProperty(logger2, 'labels', {
          get: () => customLabels,
          set(val) {
            customLabels = val;
          },
        });
        logger2.override = (customLogger) => {
          Object.assign(logger2, customLogger);
        };
        return logger2;
      };

      // node_modules/.pnpm/supports-color@9.4.0/node_modules/supports-color/index.js
      var import_node_process = __toESM(
        __webpack_require__(/*! process */ 932),
      );
      var import_node_os = __toESM(__webpack_require__(/*! os */ 857));
      var import_node_tty = __toESM(__webpack_require__(/*! tty */ 18));
      function hasFlag(
        flag,
        argv = globalThis.Deno
          ? globalThis.Deno.args
          : import_node_process.default.argv,
      ) {
        const prefix = flag.startsWith('-')
          ? ''
          : flag.length === 1
            ? '-'
            : '--';
        const position = argv.indexOf(prefix + flag);
        const terminatorPosition = argv.indexOf('--');
        return (
          position !== -1 &&
          (terminatorPosition === -1 || position < terminatorPosition)
        );
      }
      var { env } = import_node_process.default;
      var flagForceColor;
      if (
        hasFlag('no-color') ||
        hasFlag('no-colors') ||
        hasFlag('color=false') ||
        hasFlag('color=never')
      ) {
        flagForceColor = 0;
      } else if (
        hasFlag('color') ||
        hasFlag('colors') ||
        hasFlag('color=true') ||
        hasFlag('color=always')
      ) {
        flagForceColor = 1;
      }
      function envForceColor() {
        if ('FORCE_COLOR' in env) {
          if (env.FORCE_COLOR === 'true') {
            return 1;
          }
          if (env.FORCE_COLOR === 'false') {
            return 0;
          }
          return env.FORCE_COLOR.length === 0
            ? 1
            : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
        }
      }
      function translateLevel(level) {
        if (level === 0) {
          return false;
        }
        return {
          level,
          hasBasic: true,
          has256: level >= 2,
          has16m: level >= 3,
        };
      }
      function _supportsColor(
        haveStream,
        { streamIsTTY, sniffFlags = true } = {},
      ) {
        const noFlagForceColor = envForceColor();
        if (noFlagForceColor !== void 0) {
          flagForceColor = noFlagForceColor;
        }
        const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
        if (forceColor === 0) {
          return 0;
        }
        if (sniffFlags) {
          if (
            hasFlag('color=16m') ||
            hasFlag('color=full') ||
            hasFlag('color=truecolor')
          ) {
            return 3;
          }
          if (hasFlag('color=256')) {
            return 2;
          }
        }
        if ('TF_BUILD' in env && 'AGENT_NAME' in env) {
          return 1;
        }
        if (haveStream && !streamIsTTY && forceColor === void 0) {
          return 0;
        }
        const min = forceColor || 0;
        if (env.TERM === 'dumb') {
          return min;
        }
        if (import_node_process.default.platform === 'win32') {
          const osRelease = import_node_os.default.release().split('.');
          if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
            return Number(osRelease[2]) >= 14931 ? 3 : 2;
          }
          return 1;
        }
        if ('CI' in env) {
          if ('GITHUB_ACTIONS' in env || 'GITEA_ACTIONS' in env) {
            return 3;
          }
          if (
            [
              'TRAVIS',
              'CIRCLECI',
              'APPVEYOR',
              'GITLAB_CI',
              'BUILDKITE',
              'DRONE',
            ].some((sign) => sign in env) ||
            env.CI_NAME === 'codeship'
          ) {
            return 1;
          }
          return min;
        }
        if ('TEAMCITY_VERSION' in env) {
          return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION)
            ? 1
            : 0;
        }
        if (env.COLORTERM === 'truecolor') {
          return 3;
        }
        if (env.TERM === 'xterm-kitty') {
          return 3;
        }
        if ('TERM_PROGRAM' in env) {
          const version = Number.parseInt(
            (env.TERM_PROGRAM_VERSION || '').split('.')[0],
            10,
          );
          switch (env.TERM_PROGRAM) {
            case 'iTerm.app': {
              return version >= 3 ? 3 : 2;
            }
            case 'Apple_Terminal': {
              return 2;
            }
          }
        }
        if (/-256(color)?$/i.test(env.TERM)) {
          return 2;
        }
        if (
          /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(
            env.TERM,
          )
        ) {
          return 1;
        }
        if ('COLORTERM' in env) {
          return 1;
        }
        return min;
      }
      function createSupportsColor(stream, options = {}) {
        const level = _supportsColor(stream, {
          streamIsTTY: stream && stream.isTTY,
          ...options,
        });
        return translateLevel(level);
      }
      var supportsColor = {
        stdout: createSupportsColor({
          isTTY: import_node_tty.default.isatty(1),
        }),
        stderr: createSupportsColor({
          isTTY: import_node_tty.default.isatty(2),
        }),
      };
      var supports_color_default = supportsColor;

      // src/node/utils.ts
      var colorLevel = supports_color_default.stdout
        ? supports_color_default.stdout.level
        : 0;
      function getLabel(type, logType, labels) {
        let label = '';
        if ('label' in logType) {
          label = (labels[type] || logType.label || '').padEnd(7);
          label = bold(logType.color ? logType.color(label)[0] : label)[0];
        }
        return [label];
      }
      function finalLog(label, text, args, message) {
        const labelStr = label[0];
        if (text && Array.isArray(message) && !(message instanceof Error)) {
          console.log(`${labelStr} ${message[0]}`);
        } else {
          console.log(labelStr.length ? `${labelStr} ${text}` : text, ...args);
        }
      }

      // src/node/color.ts
      var formatter = (open, close, replace = open) =>
        colorLevel >= 2
          ? (input) => {
              let string = '' + input;
              let index = string.indexOf(close, open.length);
              return ~index
                ? [open + replaceClose(string, close, replace, index) + close]
                : [open + string + close];
            }
          : (input) => {
              return [String(input)];
            };
      var replaceClose = (string, close, replace, index) => {
        let start = string.substring(0, index) + replace;
        let end = string.substring(index + close.length);
        let nextIndex = end.indexOf(close);
        return ~nextIndex
          ? start + replaceClose(end, close, replace, nextIndex)
          : start + end;
      };
      var bold = formatter('\x1B[1m', '\x1B[22m', '\x1B[22m\x1B[1m');
      var red = formatter('\x1B[31m', '\x1B[39m');
      var green = formatter('\x1B[32m', '\x1B[39m');
      var yellow = formatter('\x1B[33m', '\x1B[39m');
      var magenta = formatter('\x1B[35m', '\x1B[39m');
      var cyan = formatter('\x1B[36m', '\x1B[39m');
      var gray = formatter('\x1B[90m', '\x1B[39m');

      // src/node/gradient.ts
      var startColor = [189, 255, 243];
      var endColor = [74, 194, 154];
      var isWord = (char) => !/[\s\n]/.test(char);
      var gradient = (message) => {
        if (colorLevel < 3) {
          return colorLevel === 2 ? bold(cyan(message)[0]) : [message];
        }
        let chars = [...message];
        let steps = chars.filter(isWord).length;
        let r = startColor[0];
        let g = startColor[1];
        let b = startColor[2];
        let rStep = (endColor[0] - r) / steps;
        let gStep = (endColor[1] - g) / steps;
        let bStep = (endColor[2] - b) / steps;
        let output = '';
        for (let char of chars) {
          if (isWord(char)) {
            r += rStep;
            g += gStep;
            b += bStep;
          }
          output += `\x1B[38;2;${Math.round(r)};${Math.round(g)};${Math.round(
            b,
          )}m${char}\x1B[39m`;
        }
        return bold(output);
      };

      // src/node/constants.ts
      var LOG_TYPES = {
        // Level error
        error: {
          label: 'error',
          level: 'error',
          color: red,
        },
        // Level warn
        warn: {
          label: 'warn',
          level: 'warn',
          color: yellow,
        },
        // Level info
        info: {
          label: 'info',
          level: 'info',
          color: cyan,
        },
        start: {
          label: 'start',
          level: 'info',
          color: cyan,
        },
        ready: {
          label: 'ready',
          level: 'info',
          color: green,
        },
        success: {
          label: 'success',
          level: 'info',
          color: green,
        },
        // Level log
        log: {
          level: 'log',
        },
        // Level debug
        debug: {
          label: 'debug',
          level: 'verbose',
          color: magenta,
        },
      };

      // src/node/createLogger.ts
      function createLogger2(options = {}) {
        return createLogger(options, {
          handleError: (msg) => {
            const res = gray(msg);
            return Array.isArray(res) ? `${res[0]}` : `${res}`;
          },
          getLabel,
          gradient,
          finalLog,
          LOG_TYPES,
          greet: (msg) => {
            return gradient(msg)[0];
          },
        });
      }

      // src/node/index.ts
      var logger = createLogger2();
      // Annotate the CommonJS export names for ESM import in node:
      0 && 0;

      /***/
    },

  /******/
};
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
  /******/ // Check if module is in cache
  /******/ var cachedModule = __webpack_module_cache__[moduleId];
  /******/ if (cachedModule !== undefined) {
    /******/ return cachedModule.exports;
    /******/
  }
  /******/ // Create a new module (and put it into the cache)
  /******/ var module = (__webpack_module_cache__[moduleId] = {
    /******/ // no module.id needed
    /******/ // no module.loaded needed
    /******/ exports: {},
    /******/
  });
  /******/
  /******/ // Execute the module function
  /******/ var execOptions = {
    id: moduleId,
    module: module,
    factory: __webpack_modules__[moduleId],
    require: __webpack_require__,
  };
  /******/ __webpack_require__.i.forEach(function (handler) {
    handler(execOptions);
  });
  /******/ module = execOptions.module;
  /******/ execOptions.factory.call(
    module.exports,
    module,
    module.exports,
    execOptions.require,
  );
  /******/
  /******/ // Return the exports of the module
  /******/ return module.exports;
  /******/
}
/******/
/******/ // expose the modules object (__webpack_modules__)
/******/ __webpack_require__.m = __webpack_modules__;
/******/
/******/ // expose the module cache
/******/ __webpack_require__.c = __webpack_module_cache__;
/******/
/******/ // expose the module execution interceptor
/******/ __webpack_require__.i = [];
/******/
/************************************************************************/
/******/ /* webpack/runtime/federation runtime */
/******/ (() => {
  /******/ if (!__webpack_require__.federation) {
    /******/ __webpack_require__.federation = {
      /******/ initOptions: {
        name: 'layers_container_2',
        remotes: [],
        shareStrategy: 'version-first',
      },
      /******/ chunkMatcher: function (chunkId) {
        return !/^(230|425)$/.test(chunkId);
      },
      /******/ rootOutputDir: '../',
      /******/ initialConsumes: undefined,
      /******/ bundlerRuntimeOptions: {},
      /******/
    };
    /******/
  }
  /******/
})();
/******/
/******/ /* webpack/runtime/compat get default export */
/******/ (() => {
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/ __webpack_require__.n = (module) => {
    /******/ var getter =
      module && module.__esModule
        ? /******/ () => module['default']
        : /******/ () => module;
    /******/ __webpack_require__.d(getter, { a: getter });
    /******/ return getter;
    /******/
  };
  /******/
})();
/******/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
  /******/ // define getter functions for harmony exports
  /******/ __webpack_require__.d = (exports, definition) => {
    /******/ for (var key in definition) {
      /******/ if (
        __webpack_require__.o(definition, key) &&
        !__webpack_require__.o(exports, key)
      ) {
        /******/ Object.defineProperty(exports, key, {
          enumerable: true,
          get: definition[key],
        });
        /******/
      }
      /******/
    }
    /******/
  };
  /******/
})();
/******/
/******/ /* webpack/runtime/ensure chunk */
/******/ (() => {
  /******/ __webpack_require__.f = {};
  /******/ // This file contains only the entry chunk.
  /******/ // The chunk loading function for additional chunks
  /******/ __webpack_require__.e = (chunkId) => {
    /******/ return Promise.all(
      Object.keys(__webpack_require__.f).reduce((promises, key) => {
        /******/ __webpack_require__.f[key](chunkId, promises);
        /******/ return promises;
        /******/
      }, []),
    );
    /******/
  };
  /******/
})();
/******/
/******/ /* webpack/runtime/get javascript chunk filename */
/******/ (() => {
  /******/ // This function allow to reference async chunks
  /******/ __webpack_require__.u = (chunkId) => {
    /******/ // return url for filenames based on template
    /******/ return (
      'module/' +
      ({
        477: '__federation_expose_ComponentB',
        668: '__federation_expose_ComponentC',
      }[chunkId] || chunkId) +
      '.mjs'
    );
    /******/
  };
  /******/
})();
/******/
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
  /******/ __webpack_require__.o = (obj, prop) =>
    Object.prototype.hasOwnProperty.call(obj, prop);
  /******/
})();
/******/
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
  /******/ // define __esModule on exports
  /******/ __webpack_require__.r = (exports) => {
    /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      /******/ Object.defineProperty(exports, Symbol.toStringTag, {
        value: 'Module',
      });
      /******/
    }
    /******/ Object.defineProperty(exports, '__esModule', { value: true });
    /******/
  };
  /******/
})();
/******/
/******/ /* webpack/runtime/remotes loading */
/******/ (() => {
  /******/ var chunkMapping = {
    /******/ 425: [
      /******/ 146, /******/ 308,
      /******/
    ],
    /******/
  };
  /******/ var idToExternalAndNameMapping = {
    /******/ 146: [
      /******/ 'default',
      /******/ './ComponentA',
      /******/ 911,
      /******/
    ],
    /******/ 308: [
      /******/ 'default',
      /******/ './ComponentB',
      /******/ 342,
      /******/
    ],
    /******/
  };
  /******/ var idToRemoteMap = {
    /******/ 146: [
      /******/ {
        /******/ externalType: 'module',
        /******/ name: '',
        /******/ externalModuleId: 911,
        /******/
      },
      /******/
    ],
    /******/ 308: [
      /******/ {
        /******/ externalType: 'module',
        /******/ name: '',
        /******/ externalModuleId: 342,
        /******/
      },
      /******/
    ],
    /******/
  };
  /******/ __webpack_require__.federation.bundlerRuntimeOptions.remotes = {
    idToRemoteMap,
    chunkMapping,
    idToExternalAndNameMapping,
    webpackRequire: __webpack_require__,
  };
  /******/ __webpack_require__.f.remotes = (chunkId, promises) => {
    /******/ __webpack_require__.federation.bundlerRuntime.remotes({
      idToRemoteMap,
      chunkMapping,
      idToExternalAndNameMapping,
      chunkId,
      promises,
      webpackRequire: __webpack_require__,
    });
    /******/
  };
  /******/
})();
/******/
/******/ /* webpack/runtime/sharing */
/******/ (() => {
  /******/ __webpack_require__.S = {};
  /******/ var initPromises = {};
  /******/ var initTokens = {};
  /******/ __webpack_require__.I = (name, initScope) => {
    /******/ if (!initScope) initScope = [];
    /******/ // handling circular init calls
    /******/ var initToken = initTokens[name];
    /******/ if (!initToken) initToken = initTokens[name] = {};
    /******/ if (initScope.indexOf(initToken) >= 0) return;
    /******/ initScope.push(initToken);
    /******/ // only runs once
    /******/ if (initPromises[name]) return initPromises[name];
    /******/ // creates a new share scope if needed
    /******/ if (!__webpack_require__.o(__webpack_require__.S, name))
      __webpack_require__.S[name] = {};
    /******/ // runs all init snippets from all modules reachable
    /******/ var scope = __webpack_require__.S[name];
    /******/ var warn = (msg) => {
      /******/ if (typeof console !== 'undefined' && console.warn)
        console.warn(msg);
      /******/
    };
    /******/ var uniqueName = '4-layers-full-mjs';
    /******/ var register = (name, version, factory, eager) => {
      /******/ var versions = (scope[name] = scope[name] || {});
      /******/ var activeVersion = versions[version];
      /******/ if (
        !activeVersion ||
        (!activeVersion.loaded &&
          (!eager != !activeVersion.eager
            ? eager
            : uniqueName > activeVersion.from))
      )
        versions[version] = { get: factory, from: uniqueName, eager: !!eager };
      /******/
    };
    /******/ var initExternal = (id) => {
      /******/ var handleError = (err) =>
        warn('Initialization of sharing external failed: ' + err);
      /******/ try {
        /******/ var module = __webpack_require__(id);
        /******/ if (!module) return;
        /******/ var initFn = (module) =>
          module &&
          module.init &&
          module.init(__webpack_require__.S[name], initScope);
        /******/ if (module.then)
          return promises.push(module.then(initFn, handleError));
        /******/ var initResult = initFn(module);
        /******/ if (initResult && initResult.then)
          return promises.push(initResult['catch'](handleError));
        /******/
      } catch (err) {
        handleError(err);
      }
      /******/
    };
    /******/ var promises = [];
    /******/ switch (name) {
      /******/ case 'default':
        {
          /******/ register('react', '2.1.0', () =>
            __webpack_require__
              .e(979)
              .then(
                () => () =>
                  __webpack_require__(/*! ./node_modules/react.js */ 979),
              ),
          );
          /******/ initExternal(911);
          /******/ initExternal(342);
          /******/
        }
        /******/ break;
      /******/
    }
    /******/ if (!promises.length) return (initPromises[name] = 1);
    /******/ return (initPromises[name] = Promise.all(promises).then(
      () => (initPromises[name] = 1),
    ));
    /******/
  };
  /******/
})();
/******/
/******/ /* webpack/runtime/sharing */
/******/ (() => {
  /******/ __webpack_require__.federation.initOptions.shared = {
    react: [
      {
        version: '2.1.0',
        /******/ get: () =>
          __webpack_require__
            .e(979)
            .then(
              () => () =>
                __webpack_require__(/*! ./node_modules/react.js */ 979),
            ),
        /******/ scope: ['default'],
        /******/ shareConfig: {
          eager: false,
          requiredVersion: false,
          strictVersion: false,
          singleton: false,
          layer: null,
        },
      },
    ],
  };
  /******/ __webpack_require__.S = {};
  /******/ var initPromises = {};
  /******/ var initTokens = {};
  /******/ __webpack_require__.I = (name, initScope) => {
    /******/ return __webpack_require__.federation.bundlerRuntime.I({
      shareScopeName: name,
      /******/ webpackRequire: __webpack_require__,
      /******/ initPromises: initPromises,
      /******/ initTokens: initTokens,
      /******/ initScope: initScope,
      /******/
    });
    /******/
  };
  /******/
})();
/******/
/******/ /* webpack/runtime/consumes */
/******/ (() => {
  /******/ var installedModules = {};
  /******/ var moduleToHandlerMapping = {
    /******/ 230: {
      /******/ getter: () =>
        __webpack_require__
          .e(979)
          .then(() => () => __webpack_require__(/*! react */ 979)),
      /******/ shareInfo: {
        /******/ shareConfig: {
          /******/ fixedDependencies: false,
          /******/ requiredVersion: '*',
          /******/ strictVersion: true,
          /******/ singleton: false,
          /******/ eager: false,
          /******/
        },
        /******/ scope: ['default'],
        /******/
      },
      /******/ shareKey: 'react',
      /******/
    },
    /******/
  };
  /******/ // no consumes in initial chunks
  /******/ var chunkMapping = {
    /******/ 230: [
      /******/ 230,
      /******/
    ],
    /******/
  };
  /******/ __webpack_require__.f.consumes = (chunkId, promises) => {
    /******/ __webpack_require__.federation.bundlerRuntime.consumes({
      /******/ chunkMapping: chunkMapping,
      /******/ installedModules: installedModules,
      /******/ chunkId: chunkId,
      /******/ moduleToHandlerMapping: moduleToHandlerMapping,
      /******/ promises: promises,
      /******/ webpackRequire: __webpack_require__,
      /******/
    });
    /******/
  };
  /******/
})();
/******/
/******/ /* webpack/runtime/import chunk loading */
/******/ (() => {
  /******/ // no baseURI
  /******/
  /******/ // object to store loaded and loading chunks
  /******/ // undefined = chunk not loaded, null = chunk preloaded/prefetched
  /******/ // [resolve, Promise] = chunk loading, 0 = chunk loaded
  /******/ var installedChunks = {
    /******/ 266: 0,
    /******/
  };
  /******/
  /******/ var installChunk = (data) => {
    /******/ var { ids, modules, runtime } = data;
    /******/ // add "modules" to the modules object,
    /******/ // then flag all "ids" as loaded and fire callback
    /******/ var moduleId,
      chunkId,
      i = 0;
    /******/ for (moduleId in modules) {
      /******/ if (__webpack_require__.o(modules, moduleId)) {
        /******/ __webpack_require__.m[moduleId] = modules[moduleId];
        /******/
      }
      /******/
    }
    /******/ if (runtime) runtime(__webpack_require__);
    /******/ for (; i < ids.length; i++) {
      /******/ chunkId = ids[i];
      /******/ if (
        __webpack_require__.o(installedChunks, chunkId) &&
        installedChunks[chunkId]
      ) {
        /******/ installedChunks[chunkId][0]();
        /******/
      }
      /******/ installedChunks[ids[i]] = 0;
      /******/
    }
    /******/
    /******/
  };
  /******/
  /******/ __webpack_require__.f.j = (chunkId, promises) => {
    /******/ // import() chunk loading for javascript
    /******/ var installedChunkData = __webpack_require__.o(
      installedChunks,
      chunkId,
    )
      ? installedChunks[chunkId]
      : undefined;
    /******/ if (installedChunkData !== 0) {
      // 0 means "already installed".
      /******/
      /******/ // a Promise means "currently loading".
      /******/ if (installedChunkData) {
        /******/ promises.push(installedChunkData[1]);
        /******/
      } else {
        /******/ if (!/^(230|425)$/.test(chunkId)) {
          /******/ // setup Promise in chunk cache
          /******/ var promise = import(
            '../' + __webpack_require__.u(chunkId)
          ).then(installChunk, (e) => {
            /******/ if (installedChunks[chunkId] !== 0)
              installedChunks[chunkId] = undefined;
            /******/ throw e;
            /******/
          });
          /******/ var promise = Promise.race([
            promise,
            new Promise(
              (resolve) =>
                (installedChunkData = installedChunks[chunkId] = [resolve]),
            ),
          ]);
          /******/ promises.push((installedChunkData[1] = promise));
          /******/
        } else installedChunks[chunkId] = 0;
        /******/
      }
      /******/
    }
    /******/
  };
  /******/
  /******/ // no prefetching
  /******/
  /******/ // no preloaded
  /******/
  /******/ // no external install chunk
  /******/
  /******/ // no on chunks loaded
  /******/
})();
/******/
/************************************************************************/
/******/
/******/ // module cache are used so entry inlining is disabled
/******/ // startup
/******/ // Load entry module and return exports
/******/ var __webpack_exports__ = __webpack_require__(340);
/******/ var __webpack_exports__get = __webpack_exports__.get;
/******/ var __webpack_exports__init = __webpack_exports__.init;
/******/ export {
  __webpack_exports__get as get,
  __webpack_exports__init as init,
};
/******/
