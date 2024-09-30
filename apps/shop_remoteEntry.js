/******/ (() => {
  // webpackBootstrap
  /******/ 'use strict';
  /******/ var __webpack_modules__ = {
    /***/ './node_modules/.federation/entry.4f65ff976d8c02b3fa85e8b22bbfe43f.js':
      /*!****************************************************************************!*\
  !*** ./node_modules/.federation/entry.4f65ff976d8c02b3fa85e8b22bbfe43f.js ***!
  \****************************************************************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__,
      ) => {
        __webpack_require__.r(__webpack_exports__);
        /* harmony import */ var _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_embedded_esm_js__WEBPACK_IMPORTED_MODULE_0__ =
          __webpack_require__(
            /*! ../../packages/webpack-bundler-runtime/dist/embedded.esm.js */ '../../packages/webpack-bundler-runtime/dist/embedded.esm.js',
          );
        /* harmony import */ var _Users_bytedance_dev_universe_packages_node_dist_src_runtimePlugin_js_runtimePlugin__WEBPACK_IMPORTED_MODULE_1__ =
          __webpack_require__(
            /*! ../../packages/node/dist/src/runtimePlugin.js?runtimePlugin */ '../../packages/node/dist/src/runtimePlugin.js?runtimePlugin',
          );
        /* harmony import */ var _Users_bytedance_dev_universe_packages_nextjs_mf_dist_src_plugins_container_runtimePlugin_js_runtimePlugin__WEBPACK_IMPORTED_MODULE_2__ =
          __webpack_require__(
            /*! ../../packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.js?runtimePlugin */ '../../packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.js?runtimePlugin',
          );

        var prevFederation = __webpack_require__.federation;
        __webpack_require__.federation = {};
        for (var key in _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_embedded_esm_js__WEBPACK_IMPORTED_MODULE_0__[
          'default'
        ]) {
          __webpack_require__.federation[key] =
            _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_embedded_esm_js__WEBPACK_IMPORTED_MODULE_0__[
              'default'
            ][key];
        }
        for (var key in prevFederation) {
          __webpack_require__.federation[key] = prevFederation[key];
        }
        if (!__webpack_require__.federation.instance) {
          const pluginsToAdd = [
            _Users_bytedance_dev_universe_packages_node_dist_src_runtimePlugin_js_runtimePlugin__WEBPACK_IMPORTED_MODULE_1__[
              'default'
            ]
              ? (
                  _Users_bytedance_dev_universe_packages_node_dist_src_runtimePlugin_js_runtimePlugin__WEBPACK_IMPORTED_MODULE_1__[
                    'default'
                  ]['default'] ||
                  _Users_bytedance_dev_universe_packages_node_dist_src_runtimePlugin_js_runtimePlugin__WEBPACK_IMPORTED_MODULE_1__[
                    'default'
                  ]
                )()
              : false,
            _Users_bytedance_dev_universe_packages_nextjs_mf_dist_src_plugins_container_runtimePlugin_js_runtimePlugin__WEBPACK_IMPORTED_MODULE_2__[
              'default'
            ]
              ? (
                  _Users_bytedance_dev_universe_packages_nextjs_mf_dist_src_plugins_container_runtimePlugin_js_runtimePlugin__WEBPACK_IMPORTED_MODULE_2__[
                    'default'
                  ]['default'] ||
                  _Users_bytedance_dev_universe_packages_nextjs_mf_dist_src_plugins_container_runtimePlugin_js_runtimePlugin__WEBPACK_IMPORTED_MODULE_2__[
                    'default'
                  ]
                )()
              : false,
          ].filter(Boolean);
          __webpack_require__.federation.initOptions.plugins =
            __webpack_require__.federation.initOptions.plugins
              ? __webpack_require__.federation.initOptions.plugins.concat(
                  pluginsToAdd,
                )
              : pluginsToAdd;
          __webpack_require__.federation.instance =
            _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_embedded_esm_js__WEBPACK_IMPORTED_MODULE_0__[
              'default'
            ].runtime.init(__webpack_require__.federation.initOptions);
          if (__webpack_require__.federation.attachShareScopeMap) {
            __webpack_require__.federation.attachShareScopeMap(
              __webpack_require__,
            );
          }
          if (__webpack_require__.federation.installInitialConsumes) {
            __webpack_require__.federation.installInitialConsumes();
          }
        }

        /***/
      },

    /***/ '../../packages/sdk/dist/index.esm.js':
      /*!********************************************!*\
  !*** ../../packages/sdk/dist/index.esm.js ***!
  \********************************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__,
      ) => {
        __webpack_require__.r(__webpack_exports__);
        /* harmony export */ __webpack_require__.d(__webpack_exports__, {
          /* harmony export */ BROWSER_LOG_KEY: () =>
            /* binding */ BROWSER_LOG_KEY,
          /* harmony export */ BROWSER_LOG_VALUE: () =>
            /* binding */ BROWSER_LOG_VALUE,
          /* harmony export */ ENCODE_NAME_PREFIX: () =>
            /* binding */ ENCODE_NAME_PREFIX,
          /* harmony export */ EncodedNameTransformMap: () =>
            /* binding */ EncodedNameTransformMap,
          /* harmony export */ FederationModuleManifest: () =>
            /* binding */ FederationModuleManifest,
          /* harmony export */ Logger: () => /* binding */ Logger,
          /* harmony export */ MANIFEST_EXT: () => /* binding */ MANIFEST_EXT,
          /* harmony export */ MFModuleType: () => /* binding */ MFModuleType,
          /* harmony export */ MODULE_DEVTOOL_IDENTIFIER: () =>
            /* binding */ MODULE_DEVTOOL_IDENTIFIER,
          /* harmony export */ ManifestFileName: () =>
            /* binding */ ManifestFileName,
          /* harmony export */ NameTransformMap: () =>
            /* binding */ NameTransformMap,
          /* harmony export */ NameTransformSymbol: () =>
            /* binding */ NameTransformSymbol,
          /* harmony export */ SEPARATOR: () => /* binding */ SEPARATOR,
          /* harmony export */ StatsFileName: () => /* binding */ StatsFileName,
          /* harmony export */ TEMP_DIR: () => /* binding */ TEMP_DIR,
          /* harmony export */ assert: () => /* binding */ assert,
          /* harmony export */ composeKeyWithSeparator: () =>
            /* binding */ composeKeyWithSeparator,
          /* harmony export */ containerPlugin: () =>
            /* binding */ ContainerPlugin,
          /* harmony export */ containerReferencePlugin: () =>
            /* binding */ ContainerReferencePlugin,
          /* harmony export */ createLink: () => /* binding */ createLink,
          /* harmony export */ createScript: () => /* binding */ createScript,
          /* harmony export */ createScriptNode: () =>
            /* binding */ createScriptNode,
          /* harmony export */ decodeName: () => /* binding */ decodeName,
          /* harmony export */ encodeName: () => /* binding */ encodeName,
          /* harmony export */ error: () => /* binding */ error,
          /* harmony export */ generateExposeFilename: () =>
            /* binding */ generateExposeFilename,
          /* harmony export */ generateShareFilename: () =>
            /* binding */ generateShareFilename,
          /* harmony export */ generateSnapshotFromManifest: () =>
            /* binding */ generateSnapshotFromManifest,
          /* harmony export */ getProcessEnv: () => /* binding */ getProcessEnv,
          /* harmony export */ getResourceUrl: () =>
            /* binding */ getResourceUrl,
          /* harmony export */ inferAutoPublicPath: () =>
            /* binding */ inferAutoPublicPath,
          /* harmony export */ isBrowserEnv: () => /* binding */ isBrowserEnv,
          /* harmony export */ isDebugMode: () => /* binding */ isDebugMode,
          /* harmony export */ isManifestProvider: () =>
            /* binding */ isManifestProvider,
          /* harmony export */ isStaticResourcesEqual: () =>
            /* binding */ isStaticResourcesEqual,
          /* harmony export */ loadScript: () => /* binding */ loadScript,
          /* harmony export */ loadScriptNode: () =>
            /* binding */ loadScriptNode,
          /* harmony export */ logger: () => /* binding */ logger,
          /* harmony export */ moduleFederationPlugin: () =>
            /* binding */ ModuleFederationPlugin,
          /* harmony export */ normalizeOptions: () =>
            /* binding */ normalizeOptions,
          /* harmony export */ parseEntry: () => /* binding */ parseEntry,
          /* harmony export */ safeToString: () => /* binding */ safeToString,
          /* harmony export */ safeWrapper: () => /* binding */ safeWrapper,
          /* harmony export */ sharePlugin: () => /* binding */ SharePlugin,
          /* harmony export */ simpleJoinRemoteEntry: () =>
            /* binding */ simpleJoinRemoteEntry,
          /* harmony export */ warn: () => /* binding */ warn,
          /* harmony export */
        });
        /* harmony import */ var _polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__ =
          __webpack_require__(
            /*! ./polyfills.esm.js */ '../../packages/sdk/dist/polyfills.esm.js',
          );

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
          return 'undefined' !== 'undefined';
        }
        function isDebugMode() {
          if (
            typeof process !== 'undefined' &&
            process.env &&
            process.env['FEDERATION_DEBUG']
          ) {
            return Boolean(process.env['FEDERATION_DEBUG']);
          }
          return (
            typeof FEDERATION_DEBUG !== 'undefined' && Boolean(FEDERATION_DEBUG)
          );
        }
        const getProcessEnv = function () {
          return typeof process !== 'undefined' && process.env
            ? process.env
            : {};
        };
        const DEBUG_LOG = '[ FEDERATION DEBUG ]';
        function safeGetLocalStorageItem() {
          try {
            if (false) {
            }
          } catch (error) {
            return typeof document !== 'undefined';
          }
          return false;
        }
        let Logger = class Logger {
          info(msg, info) {
            if (this.enable) {
              const argsToString = safeToString(info) || '';
              if (isBrowserEnv()) {
                console.info(
                  `%c ${this.identifier}: ${msg} ${argsToString}`,
                  'color:#3300CC',
                );
              } else {
                console.info(
                  '\x1b[34m%s',
                  `${this.identifier}: ${msg} ${argsToString ? `\n${argsToString}` : ''}`,
                );
              }
            }
          }
          logOriginalInfo(...args) {
            if (this.enable) {
              if (isBrowserEnv()) {
                console.info(
                  `%c ${this.identifier}: OriginalInfo`,
                  'color:#3300CC',
                );
                console.log(...args);
              } else {
                console.info(
                  `%c ${this.identifier}: OriginalInfo`,
                  'color:#3300CC',
                );
                console.log(...args);
              }
            }
          }
          constructor(identifier) {
            this.enable = false;
            this.identifier = identifier || DEBUG_LOG;
            if (isBrowserEnv() && safeGetLocalStorageItem()) {
              this.enable = true;
            } else if (isDebugMode()) {
              this.enable = true;
            }
          }
        };
        const LOG_CATEGORY = '[ Federation Runtime ]';
        // entry: name:version   version : 1.0.0 | ^1.2.3
        // entry: name:entry  entry:  https://localhost:9000/federation-manifest.json
        const parseEntry = (str, devVerOrUrl, separator = SEPARATOR) => {
          const strSplit = str.split(separator);
          const devVersionOrUrl =
            getProcessEnv()['NODE_ENV'] === 'development' && devVerOrUrl;
          const defaultVersion = '*';
          const isEntry = (s) =>
            s.startsWith('http') || s.includes(MANIFEST_EXT);
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
        const logger = new Logger();
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
                EncodedNameTransformMap[
                  NameTransformMap[NameTransformSymbol.AT]
                ],
              )
              .replace(
                new RegExp(
                  `${NameTransformMap[NameTransformSymbol.SLASH]}`,
                  'g',
                ),
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
            remoteEntry: simpleJoinRemoteEntry(
              remoteEntryPath,
              remoteEntryName,
            ),
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
            basicRemoteSnapshot = (0,
            _polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)(
              {},
              basicRemoteSnapshot,
              {
                prefetchInterface,
              },
            );
          }
          if (
            (_manifest_metaData1 = manifest.metaData) == null
              ? void 0
              : _manifest_metaData1.prefetchEntry
          ) {
            const { path, name, type } = manifest.metaData.prefetchEntry;
            basicRemoteSnapshot = (0,
            _polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)(
              {},
              basicRemoteSnapshot,
              {
                prefetchEntry: simpleJoinRemoteEntry(path, name),
                prefetchEntryType: type,
              },
            );
          }
          if ('publicPath' in manifest.metaData) {
            remoteSnapshot = (0,
            _polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)(
              {},
              basicRemoteSnapshot,
              {
                publicPath: getPublicPath(),
              },
            );
          } else {
            remoteSnapshot = (0,
            _polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)(
              {},
              basicRemoteSnapshot,
              {
                getPublicPath: getPublicPath(),
              },
            );
          }
          if (ssrRemoteEntry) {
            const fullSSRRemoteEntry = simpleJoinRemoteEntry(
              ssrRemoteEntry.path,
              ssrRemoteEntry.name,
            );
            remoteSnapshot.ssrRemoteEntry = fullSSRRemoteEntry;
            remoteSnapshot.ssrRemoteEntryType = 'commonjs-module';
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
            script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = info.url;
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
            const attrs = info.attrs;
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
          const onScriptComplete = async (prev, event) => {
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
          const onLinkComplete = (prev, event) => {
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
              attrs: (0, _polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)(
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
              const res = await f(urlObj.href);
              const data = await res.text();
              const [path, vm, fs] = await Promise.all([
                importNodeModule('path'),
                importNodeModule('vm'),
                importNodeModule('fs'),
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
              let filename = path.basename(urlObj.pathname);
              if (attrs && attrs['globalName']) {
                filename = attrs['globalName'] + '_' + filename;
              }
              const dir = __dirname;
              // if(!fs.existsSync(path.join(dir, '../../../', filename))) {
              fs.writeFileSync(path.join(dir, '../../../', filename), data);
              // }
              // const script = new vm.Script(
              //   `(function(exports, module, require, __dirname, __filename) {${data}\n})`,
              //   {
              //     filename,
              //     importModuleDynamically:
              //       vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ?? importNodeModule,
              //   },
              // );
              //
              // script.runInThisContext()(
              //   scriptContext.exports,
              //   scriptContext.module,
              //   //@ts-ignore
              //   typeof __non_webpack_require__ === 'undefined' ? eval('require') : __non_webpack_require__,
              //   urlDirname,
              //   filename,
              // );
              //@ts-ignore
              const exportedInterface = require(
                path.join(dir, '../../../', filename),
              );
              // const exportedInterface: Record<string, any> =
              //   scriptContext.module.exports || scriptContext.exports;
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
            .then((f) => handleScriptFetch(f, urlObj))
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
              return (0, _polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)(
                {},
                defaultOptions,
                options,
              );
            }
            throw new Error(
              `Unexpected type for \`${key}\`, expect boolean/undefined/object, got: ${typeof options}`,
            );
          };
        }

        /***/
      },

    /***/ '../../packages/sdk/dist/polyfills.esm.js':
      /*!************************************************!*\
  !*** ../../packages/sdk/dist/polyfills.esm.js ***!
  \************************************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__,
      ) => {
        __webpack_require__.r(__webpack_exports__);
        /* harmony export */ __webpack_require__.d(__webpack_exports__, {
          /* harmony export */ _: () => /* binding */ _extends,
          /* harmony export */
        });
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

        /***/
      },

    /***/ '../../packages/webpack-bundler-runtime/dist/constant.esm.js':
      /*!*******************************************************************!*\
  !*** ../../packages/webpack-bundler-runtime/dist/constant.esm.js ***!
  \*******************************************************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__,
      ) => {
        __webpack_require__.r(__webpack_exports__);
        /* harmony export */ __webpack_require__.d(__webpack_exports__, {
          /* harmony export */ ENCODE_NAME_PREFIX: () =>
            /* reexport safe */ _module_federation_sdk__WEBPACK_IMPORTED_MODULE_0__.ENCODE_NAME_PREFIX,
          /* harmony export */ FEDERATION_SUPPORTED_TYPES: () =>
            /* binding */ FEDERATION_SUPPORTED_TYPES,
          /* harmony export */
        });
        /* harmony import */ var _module_federation_sdk__WEBPACK_IMPORTED_MODULE_0__ =
          __webpack_require__(
            /*! @module-federation/sdk */ '../../packages/sdk/dist/index.esm.js',
          );

        var FEDERATION_SUPPORTED_TYPES = ['script'];

        /***/
      },

    /***/ '../../packages/webpack-bundler-runtime/dist/embedded.esm.js':
      /*!*******************************************************************!*\
  !*** ../../packages/webpack-bundler-runtime/dist/embedded.esm.js ***!
  \*******************************************************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__,
      ) => {
        __webpack_require__.r(__webpack_exports__);
        /* harmony export */ __webpack_require__.d(__webpack_exports__, {
          /* harmony export */ default: () => /* binding */ federation,
          /* harmony export */
        });
        /* harmony import */ var _initContainerEntry_esm_js__WEBPACK_IMPORTED_MODULE_0__ =
          __webpack_require__(
            /*! ./initContainerEntry.esm.js */ '../../packages/webpack-bundler-runtime/dist/initContainerEntry.esm.js',
          );
        /* harmony import */ var _constant_esm_js__WEBPACK_IMPORTED_MODULE_1__ =
          __webpack_require__(
            /*! ./constant.esm.js */ '../../packages/webpack-bundler-runtime/dist/constant.esm.js',
          );

        // Access the shared runtime from Webpack's federation plugin
        //@ts-ignore
        var sharedRuntime = __webpack_require__.federation.sharedRuntime;
        // Create a new instance of FederationManager, handling the build identifier
        //@ts-ignore
        var federationInstance = new sharedRuntime.FederationManager(
          false ? 0 : 'shop:1.0.0',
        );
        // Bind methods of federationInstance to ensure correct `this` context
        // Without using destructuring or arrow functions
        var boundInit = federationInstance.init.bind(federationInstance);
        var boundGetInstance =
          federationInstance.getInstance.bind(federationInstance);
        var boundLoadRemote =
          federationInstance.loadRemote.bind(federationInstance);
        var boundLoadShare =
          federationInstance.loadShare.bind(federationInstance);
        var boundLoadShareSync =
          federationInstance.loadShareSync.bind(federationInstance);
        var boundPreloadRemote =
          federationInstance.preloadRemote.bind(federationInstance);
        var boundRegisterRemotes =
          federationInstance.registerRemotes.bind(federationInstance);
        var boundRegisterPlugins =
          federationInstance.registerPlugins.bind(federationInstance);
        // Assemble the federation object with bound methods
        var federation = {
          runtime: {
            // General exports safe to share
            FederationHost: sharedRuntime.FederationHost,
            registerGlobalPlugins: sharedRuntime.registerGlobalPlugins,
            getRemoteEntry: sharedRuntime.getRemoteEntry,
            getRemoteInfo: sharedRuntime.getRemoteInfo,
            loadScript: sharedRuntime.loadScript,
            loadScriptNode: sharedRuntime.loadScriptNode,
            FederationManager: sharedRuntime.FederationManager,
            // Runtime instance-specific methods with correct `this` binding
            init: boundInit,
            getInstance: boundGetInstance,
            loadRemote: boundLoadRemote,
            loadShare: boundLoadShare,
            loadShareSync: boundLoadShareSync,
            preloadRemote: boundPreloadRemote,
            registerRemotes: boundRegisterRemotes,
            registerPlugins: boundRegisterPlugins,
          },
          instance: undefined,
          initOptions: undefined,
          bundlerRuntime: {
            remotes: _initContainerEntry_esm_js__WEBPACK_IMPORTED_MODULE_0__.r,
            consumes: _initContainerEntry_esm_js__WEBPACK_IMPORTED_MODULE_0__.c,
            I: _initContainerEntry_esm_js__WEBPACK_IMPORTED_MODULE_0__.i,
            S: {},
            installInitialConsumes:
              _initContainerEntry_esm_js__WEBPACK_IMPORTED_MODULE_0__.a,
            initContainerEntry:
              _initContainerEntry_esm_js__WEBPACK_IMPORTED_MODULE_0__.b,
          },
          attachShareScopeMap:
            _initContainerEntry_esm_js__WEBPACK_IMPORTED_MODULE_0__.d,
          bundlerRuntimeOptions: {},
        };

        /***/
      },

    /***/ '../../packages/webpack-bundler-runtime/dist/initContainerEntry.esm.js':
      /*!*****************************************************************************!*\
  !*** ../../packages/webpack-bundler-runtime/dist/initContainerEntry.esm.js ***!
  \*****************************************************************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__,
      ) => {
        __webpack_require__.r(__webpack_exports__);
        /* harmony export */ __webpack_require__.d(__webpack_exports__, {
          /* harmony export */ a: () => /* binding */ installInitialConsumes,
          /* harmony export */ b: () => /* binding */ initContainerEntry,
          /* harmony export */ c: () => /* binding */ consumes,
          /* harmony export */ d: () => /* binding */ attachShareScopeMap,
          /* harmony export */ i: () => /* binding */ initializeSharing,
          /* harmony export */ r: () => /* binding */ remotes,
          /* harmony export */
        });
        /* harmony import */ var _constant_esm_js__WEBPACK_IMPORTED_MODULE_0__ =
          __webpack_require__(
            /*! ./constant.esm.js */ '../../packages/webpack-bundler-runtime/dist/constant.esm.js',
          );
        /* harmony import */ var _module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__ =
          __webpack_require__(
            /*! @module-federation/sdk */ '../../packages/sdk/dist/index.esm.js',
          );

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
          var chunkId = options.chunkId,
            promises = options.promises,
            chunkMapping = options.chunkMapping,
            idToExternalAndNameMapping = options.idToExternalAndNameMapping,
            webpackRequire = options.webpackRequire,
            idToRemoteMap = options.idToRemoteMap;
          attachShareScopeMap(webpackRequire);
          if (webpackRequire.o(chunkMapping, chunkId)) {
            chunkMapping[chunkId].forEach(function (id) {
              var getScope = webpackRequire.R;
              if (!getScope) {
                getScope = [];
              }
              var data = idToExternalAndNameMapping[id];
              var remoteInfos = idToRemoteMap[id];
              // @ts-ignore seems not work
              if (getScope.indexOf(data) >= 0) {
                return;
              }
              // @ts-ignore seems not work
              getScope.push(data);
              if (data.p) {
                return promises.push(data.p);
              }
              var onError = function (error) {
                if (!error) {
                  error = new Error('Container missing');
                }
                if (typeof error.message === 'string') {
                  error.message += '\nwhile loading "'
                    .concat(data[1], '" from ')
                    .concat(data[2]);
                }
                webpackRequire.m[id] = function () {
                  throw error;
                };
                data.p = 0;
              };
              var handleFunction = function (fn, arg1, arg2, d, next, first) {
                try {
                  var promise = fn(arg1, arg2);
                  if (promise && promise.then) {
                    var p = promise.then(function (result) {
                      return next(result, d);
                    }, onError);
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
              var onExternal = function (external, _, first) {
                return external
                  ? handleFunction(
                      webpackRequire.I,
                      data[0],
                      0,
                      external,
                      onInitialized,
                      first,
                    )
                  : onError();
              };
              // eslint-disable-next-line no-var
              var onInitialized = function (_, external, first) {
                return handleFunction(
                  external.get,
                  data[1],
                  getScope,
                  0,
                  onFactory,
                  first,
                );
              };
              // eslint-disable-next-line no-var
              var onFactory = function (factory) {
                data.p = 1;
                webpackRequire.m[id] = function (module) {
                  module.exports = factory();
                };
              };
              var onRemoteLoaded = function () {
                try {
                  var remoteName = (0,
                  _module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.decodeName)(
                    remoteInfos[0].name,
                    _module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.ENCODE_NAME_PREFIX,
                  );
                  var remoteModuleName = remoteName + data[1].slice(1);
                  return webpackRequire.federation.instance.loadRemote(
                    remoteModuleName,
                    {
                      loadFactory: false,
                      from: 'build',
                    },
                  );
                } catch (error) {
                  onError(error);
                }
              };
              var useRuntimeLoad =
                remoteInfos.length === 1 &&
                _constant_esm_js__WEBPACK_IMPORTED_MODULE_0__.FEDERATION_SUPPORTED_TYPES.includes(
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
          var chunkId = options.chunkId,
            promises = options.promises,
            chunkMapping = options.chunkMapping,
            installedModules = options.installedModules,
            moduleToHandlerMapping = options.moduleToHandlerMapping,
            webpackRequire = options.webpackRequire;
          attachShareScopeMap(webpackRequire);
          if (webpackRequire.o(chunkMapping, chunkId)) {
            chunkMapping[chunkId].forEach(function (id) {
              if (webpackRequire.o(installedModules, id)) {
                return promises.push(installedModules[id]);
              }
              var onFactory = function (factory) {
                installedModules[id] = 0;
                webpackRequire.m[id] = function (module) {
                  delete webpackRequire.c[id];
                  module.exports = factory();
                };
              };
              var onError = function (error) {
                delete installedModules[id];
                webpackRequire.m[id] = function (module) {
                  delete webpackRequire.c[id];
                  throw error;
                };
              };
              try {
                var federationInstance = webpackRequire.federation.instance;
                if (!federationInstance) {
                  throw new Error('Federation instance not found!');
                }
                var _moduleToHandlerMapping_id = moduleToHandlerMapping[id],
                  shareKey = _moduleToHandlerMapping_id.shareKey,
                  getter = _moduleToHandlerMapping_id.getter,
                  shareInfo = _moduleToHandlerMapping_id.shareInfo;
                var promise = federationInstance
                  .loadShare(shareKey, {
                    customShareInfo: shareInfo,
                  })
                  .then(function (factory) {
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
        function initializeSharing(param) {
          var shareScopeName = param.shareScopeName,
            webpackRequire = param.webpackRequire,
            initPromises = param.initPromises,
            initTokens = param.initTokens,
            initScope = param.initScope;
          if (!initScope) initScope = [];
          var mfInstance = webpackRequire.federation.instance;
          // handling circular init calls
          var initToken = initTokens[shareScopeName];
          if (!initToken)
            initToken = initTokens[shareScopeName] = {
              from: mfInstance.name,
            };
          if (initScope.indexOf(initToken) >= 0) return;
          initScope.push(initToken);
          var promise = initPromises[shareScopeName];
          if (promise) return promise;
          var warn = function (msg) {
            return (
              typeof console !== 'undefined' &&
              console.warn &&
              console.warn(msg)
            );
          };
          var initExternal = function (id) {
            var handleError = function (err) {
              return warn('Initialization of sharing external failed: ' + err);
            };
            try {
              var module = webpackRequire(id);
              if (!module) return;
              var initFn = function (module) {
                return (
                  module &&
                  module.init && // @ts-ignore compat legacy mf shared behavior
                  module.init(webpackRequire.S[shareScopeName], initScope)
                );
              };
              if (module.then)
                return promises.push(module.then(initFn, handleError));
              var initResult = initFn(module);
              // @ts-ignore
              if (
                initResult &&
                typeof initResult !== 'boolean' &&
                initResult.then
              )
                return promises.push(initResult['catch'](handleError));
            } catch (err) {
              handleError(err);
            }
          };
          var promises = mfInstance.initializeSharing(shareScopeName, {
            strategy: mfInstance.options.shareStrategy,
            initScope: initScope,
            from: 'build',
          });
          attachShareScopeMap(webpackRequire);
          var bundlerRuntimeRemotesOptions =
            webpackRequire.federation.bundlerRuntimeOptions.remotes;
          if (bundlerRuntimeRemotesOptions) {
            Object.keys(bundlerRuntimeRemotesOptions.idToRemoteMap).forEach(
              function (moduleId) {
                var info = bundlerRuntimeRemotesOptions.idToRemoteMap[moduleId];
                var externalModuleId =
                  bundlerRuntimeRemotesOptions.idToExternalAndNameMapping[
                    moduleId
                  ][2];
                if (info.length > 1) {
                  initExternal(externalModuleId);
                } else if (info.length === 1) {
                  var remoteInfo = info[0];
                  if (
                    !_constant_esm_js__WEBPACK_IMPORTED_MODULE_0__.FEDERATION_SUPPORTED_TYPES.includes(
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
            function () {
              return (initPromises[shareScopeName] = true);
            },
          ));
        }
        function handleInitialConsumes(options) {
          var moduleId = options.moduleId,
            moduleToHandlerMapping = options.moduleToHandlerMapping,
            webpackRequire = options.webpackRequire;
          var federationInstance = webpackRequire.federation.instance;
          if (!federationInstance) {
            throw new Error('Federation instance not found!');
          }
          var _moduleToHandlerMapping_moduleId =
              moduleToHandlerMapping[moduleId],
            shareKey = _moduleToHandlerMapping_moduleId.shareKey,
            shareInfo = _moduleToHandlerMapping_moduleId.shareInfo;
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
          var moduleToHandlerMapping = options.moduleToHandlerMapping,
            webpackRequire = options.webpackRequire,
            installedModules = options.installedModules,
            initialConsumes = options.initialConsumes;
          initialConsumes.forEach(function (id) {
            webpackRequire.m[id] = function (module) {
              // Handle scenario when module is used synchronously
              installedModules[id] = 0;
              delete webpackRequire.c[id];
              var factory = handleInitialConsumes({
                moduleId: id,
                moduleToHandlerMapping: moduleToHandlerMapping,
                webpackRequire: webpackRequire,
              });
              if (typeof factory !== 'function') {
                throw new Error(
                  'Shared module is not available for eager consumption: '.concat(
                    id,
                  ),
                );
              }
              module.exports = factory();
            };
          });
        }
        function _define_property(obj, key, value) {
          if (key in obj) {
            Object.defineProperty(obj, key, {
              value: value,
              enumerable: true,
              configurable: true,
              writable: true,
            });
          } else {
            obj[key] = value;
          }
          return obj;
        }
        function _object_spread(target) {
          for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            var ownKeys = Object.keys(source);
            if (typeof Object.getOwnPropertySymbols === 'function') {
              ownKeys = ownKeys.concat(
                Object.getOwnPropertySymbols(source).filter(function (sym) {
                  return Object.getOwnPropertyDescriptor(source, sym)
                    .enumerable;
                }),
              );
            }
            ownKeys.forEach(function (key) {
              _define_property(target, key, source[key]);
            });
          }
          return target;
        }
        function initContainerEntry(options) {
          var webpackRequire = options.webpackRequire,
            shareScope = options.shareScope,
            initScope = options.initScope,
            shareScopeKey = options.shareScopeKey,
            remoteEntryInitOptions = options.remoteEntryInitOptions;
          if (!webpackRequire.S) return;
          if (
            !webpackRequire.federation ||
            !webpackRequire.federation.instance ||
            !webpackRequire.federation.initOptions
          )
            return;
          var federationInstance = webpackRequire.federation.instance;
          var name = shareScopeKey || 'default';
          federationInstance.initOptions(
            _object_spread(
              {
                name: webpackRequire.federation.initOptions.name,
                remotes: [],
              },
              remoteEntryInitOptions,
            ),
          );
          federationInstance.initShareScopeMap(name, shareScope, {
            hostShareScopeMap:
              (remoteEntryInitOptions === null ||
              remoteEntryInitOptions === void 0
                ? void 0
                : remoteEntryInitOptions.shareScopeMap) || {},
          });
          if (webpackRequire.federation.attachShareScopeMap) {
            webpackRequire.federation.attachShareScopeMap(webpackRequire);
          }
          // @ts-ignore
          return webpackRequire.I(name, initScope);
        }

        /***/
      },

    /***/ 'webpack/container/entry/shop':
      /*!***********************!*\
  !*** container entry ***!
  \***********************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        var moduleMap = {
          './noop': () => {
            return __webpack_require__
              .e(/*! __federation_expose_noop */ '__federation_expose_noop')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ../../packages/nextjs-mf/dist/src/federation-noop.js */ '../../packages/nextjs-mf/dist/src/federation-noop.js',
                  ),
              );
          },
          './react': () => {
            return __webpack_require__
              .e(/*! __federation_expose_react */ 'vendor-chunks/react@18.3.1')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js */ '../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js',
                  ),
              );
          },
          './react-dom': () => {
            return Promise.all(
              /*! __federation_expose_react_dom */ [
                __webpack_require__.e('vendor-chunks/scheduler@0.23.2'),
                __webpack_require__.e(
                  'vendor-chunks/react-dom@18.3.1_react@18.3.1',
                ),
              ],
            ).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/index.js */ '../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/index.js',
                ),
            );
          },
          './next/router': () => {
            return Promise.all(
              /*! __federation_expose_next__router */ [
                __webpack_require__.e(
                  'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
                __webpack_require__.e(
                  'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.3.1_react@18.3.1',
                ),
                __webpack_require__.e('__federation_expose_next__router'),
              ],
            ).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js',
                ),
            );
          },
          './useCustomRemoteHook': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_useCustomRemoteHook */ '__federation_expose_useCustomRemoteHook',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./components/useCustomRemoteHook */ './components/useCustomRemoteHook.tsx',
                  ),
              );
          },
          './WebpackSvg': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_WebpackSvg */ '__federation_expose_WebpackSvg',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./components/WebpackSvg */ './components/WebpackSvg.tsx',
                  ),
              );
          },
          './WebpackPng': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_WebpackPng */ '__federation_expose_WebpackPng',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./components/WebpackPng */ './components/WebpackPng.tsx',
                  ),
              );
          },
          './menu': () => {
            return Promise.all(
              /*! __federation_expose_menu */ [
                __webpack_require__.e(
                  'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
                __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.5'),
                __webpack_require__.e('vendor-chunks/classnames@2.5.1'),
                __webpack_require__.e('vendor-chunks/@ctrl+tinycolor@3.6.1'),
                __webpack_require__.e(
                  'vendor-chunks/antd@5.19.1_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e(
                  'vendor-chunks/@rc-component+async-validator@5.0.4',
                ),
                __webpack_require__.e(
                  'vendor-chunks/rc-menu@9.14.1_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e(
                  'vendor-chunks/rc-field-form@2.2.1_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e(
                  'vendor-chunks/rc-motion@2.9.2_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e(
                  'vendor-chunks/@rc-component+trigger@2.2.0_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e(
                  'vendor-chunks/rc-overflow@1.3.2_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e(
                  'vendor-chunks/@rc-component+portal@1.1.2_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e(
                  'vendor-chunks/rc-resize-observer@1.4.0_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e(
                  'vendor-chunks/rc-tooltip@6.2.0_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e('vendor-chunks/react-is@18.3.1'),
                __webpack_require__.e(
                  'vendor-chunks/rc-picker@4.6.9_dayjs@1.11.12_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e(
                  'vendor-chunks/resize-observer-polyfill@1.5.1',
                ),
                __webpack_require__.e(
                  'vendor-chunks/rc-pagination@4.2.0_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e('__federation_expose_menu'),
              ],
            ).then(
              () => () =>
                __webpack_require__(
                  /*! ./components/menu */ './components/menu.tsx',
                ),
            );
          },
          './pages-map': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages_map */ '__federation_expose_pages_map',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js!../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js */ '../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js!../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js',
                  ),
              );
          },
          './pages-map-v2': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages_map_v2 */ '__federation_expose_pages_map_v2',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js?v2!../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js */ '../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js?v2!../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js',
                  ),
              );
          },
          './pages/index': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__index */ '__federation_expose_pages__index',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/index.js */ './pages/index.js',
                  ),
              );
          },
          './pages/checkout/[...slug]': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__checkout__[...slug] */ '__federation_expose_pages__checkout__[...slug]',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/checkout/[...slug].tsx */ './pages/checkout/[...slug].tsx',
                  ),
              );
          },
          './pages/checkout/[pid]': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__checkout__[pid] */ '__federation_expose_pages__checkout__[pid]',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/checkout/[pid].tsx */ './pages/checkout/[pid].tsx',
                  ),
              );
          },
          './pages/checkout/exposed-pages': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__checkout__exposed_pages */ '__federation_expose_pages__checkout__exposed_pages',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/checkout/exposed-pages.tsx */ './pages/checkout/exposed-pages.tsx',
                  ),
              );
          },
          './pages/checkout/index': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__checkout__index */ '__federation_expose_pages__checkout__index',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/checkout/index.tsx */ './pages/checkout/index.tsx',
                  ),
              );
          },
          './pages/checkout/test-check-button': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__checkout__test_check_button */ '__federation_expose_pages__checkout__test_check_button',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/checkout/test-check-button.tsx */ './pages/checkout/test-check-button.tsx',
                  ),
              );
          },
          './pages/checkout/test-title': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__checkout__test_title */ '__federation_expose_pages__checkout__test_title',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/checkout/test-title.tsx */ './pages/checkout/test-title.tsx',
                  ),
              );
          },
          './pages/home/exposed-pages': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__home__exposed_pages */ '__federation_expose_pages__home__exposed_pages',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/home/exposed-pages.tsx */ './pages/home/exposed-pages.tsx',
                  ),
              );
          },
          './pages/home/test-broken-remotes': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__home__test_broken_remotes */ '__federation_expose_pages__home__test_broken_remotes',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/home/test-broken-remotes.tsx */ './pages/home/test-broken-remotes.tsx',
                  ),
              );
          },
          './pages/home/test-remote-hook': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__home__test_remote_hook */ '__federation_expose_pages__home__test_remote_hook',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/home/test-remote-hook.tsx */ './pages/home/test-remote-hook.tsx',
                  ),
              );
          },
          './pages/home/test-shared-nav': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__home__test_shared_nav */ '__federation_expose_pages__home__test_shared_nav',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/home/test-shared-nav.tsx */ './pages/home/test-shared-nav.tsx',
                  ),
              );
          },
          './pages/shop/exposed-pages': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__shop__exposed_pages */ '__federation_expose_pages__shop__exposed_pages',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/shop/exposed-pages.tsx */ './pages/shop/exposed-pages.tsx',
                  ),
              );
          },
          './pages/shop/index': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__shop__index */ '__federation_expose_pages__shop__index',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/shop/index.tsx */ './pages/shop/index.tsx',
                  ),
              );
          },
          './pages/shop/test-webpack-png': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__shop__test_webpack_png */ '__federation_expose_pages__shop__test_webpack_png',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/shop/test-webpack-png.tsx */ './pages/shop/test-webpack-png.tsx',
                  ),
              );
          },
          './pages/shop/test-webpack-svg': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__shop__test_webpack_svg */ '__federation_expose_pages__shop__test_webpack_svg',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/shop/test-webpack-svg.tsx */ './pages/shop/test-webpack-svg.tsx',
                  ),
              );
          },
          './pages/shop/products/[...slug]': () => {
            return __webpack_require__
              .e(
                /*! __federation_expose_pages__shop__products__[...slug] */ '__federation_expose_pages__shop__products__[...slug]',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ./pages/shop/products/[...slug].tsx */ './pages/shop/products/[...slug].tsx',
                  ),
              );
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

        // This exports getters to disallow modifications
        __webpack_require__.d(exports, {
          get: () => get,
          init: () => init,
        });

        /***/
      },

    /***/ 'next/amp':
      /*!***************************!*\
  !*** external "next/amp" ***!
  \***************************/
      /***/ (module) => {
        module.exports = require('next/amp');

        /***/
      },

    /***/ 'next/dist/compiled/next-server/pages.runtime.dev.js':
      /*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
      /***/ (module) => {
        module.exports = require('next/dist/compiled/next-server/pages.runtime.dev.js');

        /***/
      },

    /***/ 'next/error':
      /*!*****************************!*\
  !*** external "next/error" ***!
  \*****************************/
      /***/ (module) => {
        module.exports = require('next/error');

        /***/
      },

    /***/ react:
      /*!************************!*\
  !*** external "react" ***!
  \************************/
      /***/ (module) => {
        module.exports = require('react');

        /***/
      },

    /***/ 'react-dom':
      /*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
      /***/ (module) => {
        module.exports = require('react-dom');

        /***/
      },

    /***/ 'styled-jsx/style':
      /*!***********************************!*\
  !*** external "styled-jsx/style" ***!
  \***********************************/
      /***/ (module) => {
        module.exports = require('styled-jsx/style');

        /***/
      },

    /***/ fs:
      /*!*********************!*\
  !*** external "fs" ***!
  \*********************/
      /***/ (module) => {
        module.exports = require('fs');

        /***/
      },

    /***/ path:
      /*!***********************!*\
  !*** external "path" ***!
  \***********************/
      /***/ (module) => {
        module.exports = require('path');

        /***/
      },

    /***/ stream:
      /*!*************************!*\
  !*** external "stream" ***!
  \*************************/
      /***/ (module) => {
        module.exports = require('stream');

        /***/
      },

    /***/ util:
      /*!***********************!*\
  !*** external "util" ***!
  \***********************/
      /***/ (module) => {
        module.exports = require('util');

        /***/
      },

    /***/ zlib:
      /*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
      /***/ (module) => {
        module.exports = require('zlib');

        /***/
      },

    /***/ 'webpack/container/reference/checkout':
      /*!*********************************************************************************!*\
  !*** external "checkout@http://localhost:3002/_next/static/ssr/remoteEntry.js" ***!
  \*********************************************************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        var __webpack_error__ = new Error();
        module.exports = new Promise((resolve, reject) => {
          if (typeof checkout !== 'undefined') return resolve();
          __webpack_require__.l(
            'http://localhost:3002/_next/static/ssr/remoteEntry.js',
            (event) => {
              if (typeof checkout !== 'undefined') return resolve();
              var errorType =
                event && (event.type === 'load' ? 'missing' : event.type);
              var realSrc = event && event.target && event.target.src;
              __webpack_error__.message =
                'Loading script failed.\n(' + errorType + ': ' + realSrc + ')';
              __webpack_error__.name = 'ScriptExternalLoadError';
              __webpack_error__.type = errorType;
              __webpack_error__.request = realSrc;
              reject(__webpack_error__);
            },
            'checkout',
          );
        }).then(() => checkout);

        /***/
      },

    /***/ 'webpack/container/reference/home':
      /*!*********************************************************************************!*\
  !*** external "home_app@http://localhost:3000/_next/static/ssr/remoteEntry.js" ***!
  \*********************************************************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        var __webpack_error__ = new Error();
        module.exports = new Promise((resolve, reject) => {
          if (typeof home_app !== 'undefined') return resolve();
          __webpack_require__.l(
            'http://localhost:3000/_next/static/ssr/remoteEntry.js',
            (event) => {
              if (typeof home_app !== 'undefined') return resolve();
              var errorType =
                event && (event.type === 'load' ? 'missing' : event.type);
              var realSrc = event && event.target && event.target.src;
              __webpack_error__.message =
                'Loading script failed.\n(' + errorType + ': ' + realSrc + ')';
              __webpack_error__.name = 'ScriptExternalLoadError';
              __webpack_error__.type = errorType;
              __webpack_error__.request = realSrc;
              reject(__webpack_error__);
            },
            'home_app',
          );
        }).then(() => home_app);

        /***/
      },

    /***/ '../../packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.js?runtimePlugin':
      /*!******************************************************************************************!*\
  !*** ../../packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.js?runtimePlugin ***!
  \******************************************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        Object.defineProperty(exports, '__esModule', {
          value: true,
        });
        exports['default'] = default_1;
        function default_1() {
          return {
            name: 'next-internal-plugin',
            createScript: function (args) {
              // Updated type
              var url = args.url;
              var attrs = args.attrs;
              if (false) {
                var script;
              }
              return undefined;
            },
            errorLoadRemote: function (args) {
              var id = args.id;
              var error = args.error;
              var from = args.from;
              console.error(id, 'offline');
              var pg = function () {
                console.error(id, 'offline', error);
                return null;
              };
              pg.getInitialProps = function (ctx) {
                // Type assertion to add getInitialProps
                return {};
              };
              var mod;
              if (from === 'build') {
                mod = function () {
                  return {
                    __esModule: true,
                    default: pg,
                    getServerSideProps: function () {
                      return {
                        props: {},
                      };
                    },
                  };
                };
              } else {
                mod = {
                  default: pg,
                  getServerSideProps: function () {
                    return {
                      props: {},
                    };
                  },
                };
              }
              return mod;
            },
            beforeInit: function (args) {
              if (!globalThis.usedChunks) globalThis.usedChunks = new Set();
              if (
                typeof __webpack_require__.j === 'string' &&
                !__webpack_require__.j.startsWith('webpack')
              ) {
                return args;
              }
              var moduleCache = args.origin.moduleCache;
              var name = args.origin.name;
              var gs = new Function('return globalThis')();
              var attachedRemote = gs[name];
              if (attachedRemote) {
                moduleCache.set(name, attachedRemote);
              }
              return args;
            },
            init: function (args) {
              return args;
            },
            beforeRequest: function (args) {
              var options = args.options;
              var id = args.id;
              var remoteName = id.split('/').shift();
              var remote = options.remotes.find(function (remote) {
                return remote.name === remoteName;
              });
              if (!remote) return args;
              if (remote && remote.entry && remote.entry.includes('?t=')) {
                return args;
              }
              remote.entry = remote.entry + '?t=' + Date.now();
              return args;
            },
            afterResolve: function (args) {
              return args;
            },
            onLoad: function (args) {
              var exposeModuleFactory = args.exposeModuleFactory;
              var exposeModule = args.exposeModule;
              var id = args.id;
              var moduleOrFactory = exposeModuleFactory || exposeModule;
              if (!moduleOrFactory) return args; // Ensure moduleOrFactory is defined
              if (true) {
                var exposedModuleExports;
                try {
                  exposedModuleExports = moduleOrFactory();
                } catch (e) {
                  exposedModuleExports = moduleOrFactory;
                }
                var handler = {
                  get: function (target, prop, receiver) {
                    // Check if accessing a static property of the function itself
                    if (
                      target === exposedModuleExports &&
                      typeof exposedModuleExports[prop] === 'function'
                    ) {
                      return function () {
                        globalThis.usedChunks.add(id);
                        return exposedModuleExports[prop].apply(
                          this,
                          arguments,
                        );
                      };
                    }
                    var originalMethod = target[prop];
                    if (typeof originalMethod === 'function') {
                      var proxiedFunction = function () {
                        globalThis.usedChunks.add(id);
                        return originalMethod.apply(this, arguments);
                      };
                      // Copy all enumerable properties from the original method to the proxied function
                      Object.keys(originalMethod).forEach(function (prop) {
                        Object.defineProperty(proxiedFunction, prop, {
                          value: originalMethod[prop],
                          writable: true,
                          enumerable: true,
                          configurable: true,
                        });
                      });
                      return proxiedFunction;
                    }
                    return Reflect.get(target, prop, receiver);
                  },
                };
                if (typeof exposedModuleExports === 'function') {
                  // If the module export is a function, we create a proxy that can handle both its
                  // call (as a function) and access to its properties (including static methods).
                  exposedModuleExports = new Proxy(
                    exposedModuleExports,
                    handler,
                  );
                  // Proxy static properties specifically
                  var staticProps =
                    Object.getOwnPropertyNames(exposedModuleExports);
                  staticProps.forEach(function (prop) {
                    if (typeof exposedModuleExports[prop] === 'function') {
                      exposedModuleExports[prop] = new Proxy(
                        exposedModuleExports[prop],
                        handler,
                      );
                    }
                  });
                  return function () {
                    return exposedModuleExports;
                  };
                } else {
                  // For objects, just wrap the exported object itself
                  exposedModuleExports = new Proxy(
                    exposedModuleExports,
                    handler,
                  );
                }
                return exposedModuleExports;
              }
              return args;
            },
            resolveShare: function (args) {
              if (
                args.pkgName !== 'react' &&
                args.pkgName !== 'react-dom' &&
                !args.pkgName.startsWith('next/')
              ) {
                return args;
              }
              var shareScopeMap = args.shareScopeMap;
              var scope = args.scope;
              var pkgName = args.pkgName;
              var version = args.version;
              var GlobalFederation = args.GlobalFederation;
              var host = GlobalFederation['__INSTANCES__'][0];
              if (!host) {
                return args;
              }
              if (!host.options.shared[pkgName]) {
                return args;
              }
              //handle react host next remote, disable resolving when not next host
              args.resolver = function () {
                shareScopeMap[scope][pkgName][version] =
                  host.options.shared[pkgName][0]; // replace local share scope manually with desired module
                return shareScopeMap[scope][pkgName][version];
              };
              return args;
            },
            beforeLoadShare: async function (args) {
              return args;
            },
          };
        } //# sourceMappingURL=runtimePlugin.js.map

        /***/
      },

    /***/ '../../packages/node/dist/src/runtimePlugin.js?runtimePlugin':
      /*!*******************************************************************!*\
  !*** ../../packages/node/dist/src/runtimePlugin.js?runtimePlugin ***!
  \*******************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        Object.defineProperty(exports, '__esModule', {
          value: true,
        });
        exports['default'] = default_1;
        function importNodeModule(name) {
          if (!name) {
            throw new Error('import specifier is required');
          }
          const importModule = new Function('name', `return import(name)`);
          return importModule(name)
            .then((res) => res.default)
            .catch((error) => {
              console.error(`Error importing module ${name}:`, error);
              throw error;
            });
        }
        function default_1() {
          return {
            name: 'node-federation-plugin',
            beforeInit(args) {
              // Patch webpack chunk loading handlers
              (() => {
                const resolveFile = (rootOutputDir, chunkId) => {
                  const path = require('path');
                  return path.join(
                    __dirname,
                    rootOutputDir + __webpack_require__.u(chunkId),
                  );
                };
                const resolveUrl = (remoteName, chunkName) => {
                  try {
                    return new URL(chunkName, __webpack_require__.p);
                  } catch {
                    const entryUrl =
                      returnFromCache(remoteName) ||
                      returnFromGlobalInstances(remoteName);
                    if (!entryUrl) return null;
                    const url = new URL(entryUrl);
                    const path = require('path');
                    url.pathname = url.pathname.replace(
                      path.basename(url.pathname),
                      chunkName,
                    );
                    return url;
                  }
                };
                const returnFromCache = (remoteName) => {
                  const globalThisVal = new Function('return globalThis')();
                  const federationInstances =
                    globalThisVal['__FEDERATION__']['__INSTANCES__'];
                  for (const instance of federationInstances) {
                    const moduleContainer =
                      instance.moduleCache.get(remoteName);
                    if (moduleContainer?.remoteInfo)
                      return moduleContainer.remoteInfo.entry;
                  }
                  return null;
                };
                const returnFromGlobalInstances = (remoteName) => {
                  const globalThisVal = new Function('return globalThis')();
                  const federationInstances =
                    globalThisVal['__FEDERATION__']['__INSTANCES__'];
                  for (const instance of federationInstances) {
                    for (const remote of instance.options.remotes) {
                      if (
                        remote.name === remoteName ||
                        remote.alias === remoteName
                      ) {
                        console.log('Backup remote entry found:', remote.entry);
                        return remote.entry;
                      }
                    }
                  }
                  return null;
                };
                const loadFromFs = (filename, callback) => {
                  const fs = require('fs');
                  const path = require('path');
                  const vm = require('vm');
                  if (fs.existsSync(filename)) {
                    fs.readFile(filename, 'utf-8', (err, content) => {
                      if (err) return callback(err, null);
                      const chunk = {};
                      try {
                        const script = new vm.Script(
                          `(function(exports, require, __dirname, __filename) {${content}\n})`,
                          {
                            filename,
                            importModuleDynamically:
                              vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ??
                              importNodeModule,
                          },
                        );
                        script.runInThisContext()(
                          chunk,
                          require,
                          path.dirname(filename),
                          filename,
                        );
                        callback(null, chunk);
                      } catch (e) {
                        console.log("'runInThisContext threw'", e);
                        callback(e, null);
                      }
                    });
                  } else {
                    callback(
                      new Error(`File ${filename} does not exist`),
                      null,
                    );
                  }
                };
                const fetchAndRun = (url, chunkName, callback) => {
                  (typeof fetch === 'undefined'
                    ? importNodeModule('node-fetch').then((mod) => mod.default)
                    : Promise.resolve(fetch)
                  )
                    .then((fetchFunction) => {
                      return args.origin.loaderHook.lifecycle.fetch
                        .emit(url.href, {})
                        .then((res) => {
                          if (!res || !(res instanceof Response)) {
                            return fetchFunction(url.href).then((response) =>
                              response.text(),
                            );
                          }
                          return res.text();
                        });
                    })
                    .then((data) => {
                      const chunk = {};
                      try {
                        eval(
                          `(function(exports, require, __dirname, __filename) {${data}\n})`,
                        )(
                          chunk,
                          require,
                          url.pathname.split('/').slice(0, -1).join('/'),
                          chunkName,
                        );
                        callback(null, chunk);
                      } catch (e) {
                        callback(e, null);
                      }
                    })
                    .catch((err) => callback(err, null));
                };
                const loadChunk = (
                  strategy,
                  chunkId,
                  rootOutputDir,
                  callback,
                ) => {
                  if (strategy === 'filesystem') {
                    return loadFromFs(
                      resolveFile(rootOutputDir, chunkId),
                      callback,
                    );
                  }
                  const url = resolveUrl(rootOutputDir, chunkId);
                  if (!url)
                    return callback(null, {
                      modules: {},
                      ids: [],
                      runtime: null,
                    });
                  fetchAndRun(url, chunkId, callback);
                };
                const installedChunks = {};
                const installChunk = (chunk) => {
                  for (const moduleId in chunk.modules) {
                    __webpack_require__.m[moduleId] = chunk.modules[moduleId];
                  }
                  if (chunk.runtime) chunk.runtime(__webpack_require__);
                  for (const chunkId of chunk.ids) {
                    if (installedChunks[chunkId]) installedChunks[chunkId][0]();
                    installedChunks[chunkId] = 0;
                  }
                };
                __webpack_require__.l = (url, done, key, chunkId) => {
                  if (!key || chunkId)
                    throw new Error(
                      `__webpack_require__.l name is required for ${url}`,
                    );
                  __webpack_require__.federation.runtime
                    .loadScriptNode(url, {
                      attrs: {
                        globalName: key,
                      },
                    })
                    .then((res) => {
                      const enhancedRemote =
                        __webpack_require__.federation.instance.initRawContainer(
                          key,
                          url,
                          res,
                        );
                      new Function('return globalThis')()[key] = enhancedRemote;
                      done(enhancedRemote);
                    })
                    .catch(done);
                };
                if (__webpack_require__.f) {
                  const handle = (chunkId, promises) => {
                    let installedChunkData = installedChunks[chunkId];
                    if (installedChunkData !== 0) {
                      if (installedChunkData) {
                        promises.push(installedChunkData[2]);
                      } else {
                        const matcher = __webpack_require__.federation
                          .chunkMatcher
                          ? __webpack_require__.federation.chunkMatcher(chunkId)
                          : true;
                        if (matcher) {
                          const promise = new Promise((resolve, reject) => {
                            installedChunkData = installedChunks[chunkId] = [
                              resolve,
                              reject,
                            ];
                            const fs =
                              typeof process !== 'undefined'
                                ? require('fs')
                                : false;
                            const filename =
                              typeof process !== 'undefined'
                                ? resolveFile(
                                    __webpack_require__.federation
                                      .rootOutputDir || '',
                                    chunkId,
                                  )
                                : false;
                            if (fs && fs.existsSync(filename)) {
                              loadChunk(
                                'filesystem',
                                chunkId,
                                __webpack_require__.federation.rootOutputDir ||
                                  '',
                                (err, chunk) => {
                                  if (err) return reject(err);
                                  if (chunk) installChunk(chunk);
                                  resolve(chunk);
                                },
                              );
                            } else {
                              const chunkName = __webpack_require__.u(chunkId);
                              const loadingStrategy =
                                typeof process === 'undefined'
                                  ? 'http-eval'
                                  : 'http-vm';
                              loadChunk(
                                loadingStrategy,
                                chunkName,
                                __webpack_require__.federation.initOptions.name,
                                (err, chunk) => {
                                  if (err) return reject(err);
                                  if (chunk) installChunk(chunk);
                                  resolve(chunk);
                                },
                              );
                            }
                          });
                          promises.push((installedChunkData[2] = promise));
                        } else {
                          installedChunks[chunkId] = 0;
                        }
                      }
                    }
                  };
                  if (__webpack_require__.f.require) {
                    console.warn(
                      '\x1b[33m%s\x1b[0m',
                      'CAUTION: build target is not set to "async-node", attempting to patch additional chunk handlers. This may not work',
                    );
                    __webpack_require__.f.require = handle;
                  }
                  if (__webpack_require__.f.readFileVm) {
                    __webpack_require__.f.readFileVm = handle;
                  }
                }
              })();
              return args;
            },
          };
        } //# sourceMappingURL=runtimePlugin.js.map

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
      /******/ id: moduleId,
      /******/ loaded: false,
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ var threw = true;
    /******/ try {
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
      /******/ threw = false;
      /******/
    } finally {
      /******/ if (threw) delete __webpack_module_cache__[moduleId];
      /******/
    }
    /******/
    /******/ // Flag the module as loaded
    /******/ module.loaded = true;
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
          name: 'shop',
          remotes: [
            {
              alias: 'home',
              name: 'home_app',
              entry: 'http://localhost:3000/_next/static/ssr/remoteEntry.js',
              shareScope: 'default',
            },
            {
              alias: 'checkout',
              name: 'checkout',
              entry: 'http://localhost:3002/_next/static/ssr/remoteEntry.js',
              shareScope: 'default',
            },
          ],
          shareStrategy: 'loaded-first',
        },
        /******/ chunkMatcher: function (chunkId) {
          return !/^(webpack_sharing_consume_default_(ant\-design_colors_ant\-design_colors\-webpack_sharing_consume_d\-(1dea55[01]|249655[01]|83d466[01]|b8eb24[01])|react_jsx\-runtime_react_jsx\-runtime\-_1fa9[012345])|__federation_expose_next__router)$/.test(
            chunkId,
          );
        },
        /******/ rootOutputDir: '',
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
        '' +
        chunkId +
        '-' +
        {
          __federation_expose_noop: '0ad5d2dc5d2d1c72',
          'vendor-chunks/react@18.3.1': 'b573aa79fc11d49c',
          'vendor-chunks/scheduler@0.23.2': 'd50272922ac8c654',
          'vendor-chunks/react-dom@18.3.1_react@18.3.1': '242b83789ddb7e31',
          'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0':
            'ac285269f7f773c7',
          'vendor-chunks/@swc+helpers@0.5.2': '402fea9dfdecf615',
          'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.3.1_react@18.3.1':
            '60a261ede7779120',
          __federation_expose_next__router: '326b865259e55f65',
          __federation_expose_useCustomRemoteHook: '3e8ce0446d188a61',
          __federation_expose_WebpackSvg: '9d33a6614a14fca8',
          __federation_expose_WebpackPng: '4691dfee68515bd6',
          'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0':
            '63b7ce133f569a28',
          'vendor-chunks/@babel+runtime@7.24.8': 'c981544d571c1144',
          'vendor-chunks/@babel+runtime@7.24.5': '6554d5ae8bd3c2c5',
          'vendor-chunks/classnames@2.5.1': '6383a9c7a75614de',
          'vendor-chunks/@ctrl+tinycolor@3.6.1': '478a8833cdc11156',
          'vendor-chunks/antd@5.19.1_react-dom@18.2.0_react@18.2.0':
            '125b0daa1e305288',
          'vendor-chunks/@rc-component+async-validator@5.0.4':
            '98132a3683dfcb25',
          'vendor-chunks/rc-menu@9.14.1_react-dom@18.2.0_react@18.2.0':
            '4e99c9a956c5007b',
          'vendor-chunks/rc-field-form@2.2.1_react-dom@18.2.0_react@18.2.0':
            '555a9eced472d2de',
          'vendor-chunks/rc-motion@2.9.2_react-dom@18.2.0_react@18.2.0':
            '54adb7f65bafed9f',
          'vendor-chunks/@rc-component+trigger@2.2.0_react-dom@18.2.0_react@18.2.0':
            'f4992f7baafbb63c',
          'vendor-chunks/rc-overflow@1.3.2_react-dom@18.2.0_react@18.2.0':
            '954aa40c9a4ba8a5',
          'vendor-chunks/@rc-component+portal@1.1.2_react-dom@18.2.0_react@18.2.0':
            'd15034dd51191fcf',
          'vendor-chunks/rc-resize-observer@1.4.0_react-dom@18.2.0_react@18.2.0':
            '24d3083be05c04a2',
          'vendor-chunks/rc-tooltip@6.2.0_react-dom@18.2.0_react@18.2.0':
            'f11ceef17e5a2417',
          'vendor-chunks/react-is@18.3.1': '8ce527371106053c',
          'vendor-chunks/rc-picker@4.6.9_dayjs@1.11.12_react-dom@18.2.0_react@18.2.0':
            '74b81ea56aca4d0b',
          'vendor-chunks/resize-observer-polyfill@1.5.1': '059e50e183ce1cc6',
          'vendor-chunks/rc-pagination@4.2.0_react-dom@18.2.0_react@18.2.0':
            '90c87c530d663680',
          __federation_expose_menu: 'a8240993a3fd1c82',
          __federation_expose_pages_map: '357ae3c1607aacdd',
          __federation_expose_pages_map_v2: '41c88806f2472dec',
          __federation_expose_pages__index: '675058d263f8417b',
          '__federation_expose_pages__checkout__[...slug]': '0f48279a2ddef1d9',
          '__federation_expose_pages__checkout__[pid]': 'd5d79e32863a59a9',
          __federation_expose_pages__checkout__exposed_pages:
            '1e4bf953e3b19def',
          __federation_expose_pages__checkout__index: '222d9179d6315730',
          __federation_expose_pages__checkout__test_check_button:
            '7648bf8b9c28826b',
          __federation_expose_pages__checkout__test_title: 'd4701a45f1a375a2',
          __federation_expose_pages__home__exposed_pages: '448613510f6a12cd',
          __federation_expose_pages__home__test_broken_remotes:
            'd7178b6112bfee2a',
          __federation_expose_pages__home__test_remote_hook: 'aca32fd48f6f2ff9',
          __federation_expose_pages__home__test_shared_nav: 'c0ab4fd973111365',
          __federation_expose_pages__shop__exposed_pages: 'a46c0acdb20de1f3',
          __federation_expose_pages__shop__index: 'c469819e963daeb7',
          __federation_expose_pages__shop__test_webpack_png: '0a0a036ae810887a',
          __federation_expose_pages__shop__test_webpack_svg: '18af714e6868e459',
          '__federation_expose_pages__shop__products__[...slug]':
            '70c4bad3fb8e3e62',
          'vendor-chunks/@ant-design+colors@7.1.0': '1d1102a1d57c51f0',
          'vendor-chunks/@ant-design+cssinjs@1.21.0_react-dom@18.2.0_react@18.2.0':
            '10b766613605bdff',
          'vendor-chunks/stylis@4.3.2': 'eac0b45822c79836',
          'vendor-chunks/@emotion+hash@0.8.0': '4224d96b572460fd',
          'vendor-chunks/@emotion+unitless@0.7.5': '6c824da849cc84e7',
          'vendor-chunks/@ant-design+icons-svg@4.4.2': 'c359bd17f6a8945c',
          'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0':
            'd521bf1e419e4781',
          'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-1dea550':
            '053fa58d53f8bd9e',
          'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-83d4660':
            'a44dc6b3c3ba270b',
          'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-b8eb240':
            '235a703edca9612f',
          'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-2496550':
            '05bd262f0f86ebef',
          'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa90':
            '4cca82d021826ab2',
          'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa91':
            '7f3ed1545756eb32',
          'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa92':
            'b69c405a6df690d6',
          'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa93':
            '473dbb3572e14b37',
          'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa94':
            '74b963f1ea5404ec',
          'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa95':
            '668aafabd7ecfd78',
          'vendor-chunks/react@18.2.0': '2d3d9f344d92a31d',
          'vendor-chunks/styled-jsx@5.1.1_@babel+core@7.24.9_react@18.2.0':
            'a2bb9d0a6d24b3ff',
          'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-1dea551':
            'ef60f5e35bf506db',
          'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-b8eb241':
            'b0f4ce46494c0d49',
          'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-2496551':
            'f30c5917c472fc9e',
          'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-83d4661':
            '2a19a082b56a9a2e',
        }[chunkId] +
        '.js'
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
  /******/ /* webpack/runtime/load script */
  /******/ (() => {
    /******/ var inProgress = {};
    /******/ var dataWebpackPrefix = 'shop:';
    /******/ // loadScript function to load a script via script tag
    /******/ __webpack_require__.l = (url, done, key, chunkId) => {
      /******/ if (inProgress[url]) {
        inProgress[url].push(done);
        return;
      }
      /******/ var script, needAttach;
      /******/ if (key !== undefined) {
        /******/ var scripts = document.getElementsByTagName('script');
        /******/ for (var i = 0; i < scripts.length; i++) {
          /******/ var s = scripts[i];
          /******/ if (
            s.getAttribute('src') == url ||
            s.getAttribute('data-webpack') == dataWebpackPrefix + key
          ) {
            script = s;
            break;
          }
          /******/
        }
        /******/
      }
      /******/ if (!script) {
        /******/ needAttach = true;
        /******/ script = document.createElement('script');
        /******/
        /******/ script.charset = 'utf-8';
        /******/ script.timeout = 120;
        /******/ if (__webpack_require__.nc) {
          /******/ script.setAttribute('nonce', __webpack_require__.nc);
          /******/
        }
        /******/ script.setAttribute('data-webpack', dataWebpackPrefix + key);
        /******/
        /******/ script.src = url;
        /******/
      }
      /******/ inProgress[url] = [done];
      /******/ var onScriptComplete = (prev, event) => {
        /******/ // avoid mem leaks in IE.
        /******/ script.onerror = script.onload = null;
        /******/ clearTimeout(timeout);
        /******/ var doneFns = inProgress[url];
        /******/ delete inProgress[url];
        /******/ script.parentNode && script.parentNode.removeChild(script);
        /******/ doneFns && doneFns.forEach((fn) => fn(event));
        /******/ if (prev) return prev(event);
        /******/
      };
      /******/ var timeout = setTimeout(
        onScriptComplete.bind(null, undefined, {
          type: 'timeout',
          target: script,
        }),
        120000,
      );
      /******/ script.onerror = onScriptComplete.bind(null, script.onerror);
      /******/ script.onload = onScriptComplete.bind(null, script.onload);
      /******/ needAttach && document.head.appendChild(script);
      /******/
    };
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
  /******/ /* webpack/runtime/node module decorator */
  /******/ (() => {
    /******/ __webpack_require__.nmd = (module) => {
      /******/ module.paths = [];
      /******/ if (!module.children) module.children = [];
      /******/ return module;
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/remotes loading */
  /******/ (() => {
    /******/ var chunkMapping = {
      /******/ __federation_expose_pages__index: [
        /******/ 'webpack/container/remote/home/pages/index',
        /******/
      ],
      /******/ '__federation_expose_pages__checkout__[...slug]': [
        /******/ 'webpack/container/remote/checkout/pages/checkout/[...slug]',
        /******/
      ],
      /******/ '__federation_expose_pages__checkout__[pid]': [
        /******/ 'webpack/container/remote/checkout/pages/checkout/[pid]',
        /******/
      ],
      /******/ __federation_expose_pages__checkout__exposed_pages: [
        /******/ 'webpack/container/remote/checkout/pages/checkout/exposed-pages',
        /******/
      ],
      /******/ __federation_expose_pages__checkout__index: [
        /******/ 'webpack/container/remote/checkout/pages/checkout/index',
        /******/
      ],
      /******/ __federation_expose_pages__checkout__test_check_button: [
        /******/ 'webpack/container/remote/checkout/pages/checkout/test-check-button',
        /******/
      ],
      /******/ __federation_expose_pages__checkout__test_title: [
        /******/ 'webpack/container/remote/checkout/pages/checkout/test-title',
        /******/
      ],
      /******/ __federation_expose_pages__home__exposed_pages: [
        /******/ 'webpack/container/remote/home/pages/home/exposed-pages',
        /******/
      ],
      /******/ __federation_expose_pages__home__test_broken_remotes: [
        /******/ 'webpack/container/remote/home/pages/home/test-broken-remotes',
        /******/
      ],
      /******/ __federation_expose_pages__home__test_remote_hook: [
        /******/ 'webpack/container/remote/home/pages/home/test-remote-hook',
        /******/
      ],
      /******/ __federation_expose_pages__home__test_shared_nav: [
        /******/ 'webpack/container/remote/home/pages/home/test-shared-nav',
        /******/
      ],
      /******/
    };
    /******/ var idToExternalAndNameMapping = {
      /******/ 'webpack/container/remote/home/pages/index': [
        /******/ 'default',
        /******/ './pages/index',
        /******/ 'webpack/container/reference/home',
        /******/
      ],
      /******/ 'webpack/container/remote/checkout/pages/checkout/[...slug]': [
        /******/ 'default',
        /******/ './pages/checkout/[...slug]',
        /******/ 'webpack/container/reference/checkout',
        /******/
      ],
      /******/ 'webpack/container/remote/checkout/pages/checkout/[pid]': [
        /******/ 'default',
        /******/ './pages/checkout/[pid]',
        /******/ 'webpack/container/reference/checkout',
        /******/
      ],
      /******/ 'webpack/container/remote/checkout/pages/checkout/exposed-pages':
        [
          /******/ 'default',
          /******/ './pages/checkout/exposed-pages',
          /******/ 'webpack/container/reference/checkout',
          /******/
        ],
      /******/ 'webpack/container/remote/checkout/pages/checkout/index': [
        /******/ 'default',
        /******/ './pages/checkout/index',
        /******/ 'webpack/container/reference/checkout',
        /******/
      ],
      /******/ 'webpack/container/remote/checkout/pages/checkout/test-check-button':
        [
          /******/ 'default',
          /******/ './pages/checkout/test-check-button',
          /******/ 'webpack/container/reference/checkout',
          /******/
        ],
      /******/ 'webpack/container/remote/checkout/pages/checkout/test-title': [
        /******/ 'default',
        /******/ './pages/checkout/test-title',
        /******/ 'webpack/container/reference/checkout',
        /******/
      ],
      /******/ 'webpack/container/remote/home/pages/home/exposed-pages': [
        /******/ 'default',
        /******/ './pages/home/exposed-pages',
        /******/ 'webpack/container/reference/home',
        /******/
      ],
      /******/ 'webpack/container/remote/home/pages/home/test-broken-remotes': [
        /******/ 'default',
        /******/ './pages/home/test-broken-remotes',
        /******/ 'webpack/container/reference/home',
        /******/
      ],
      /******/ 'webpack/container/remote/home/pages/home/test-remote-hook': [
        /******/ 'default',
        /******/ './pages/home/test-remote-hook',
        /******/ 'webpack/container/reference/home',
        /******/
      ],
      /******/ 'webpack/container/remote/home/pages/home/test-shared-nav': [
        /******/ 'default',
        /******/ './pages/home/test-shared-nav',
        /******/ 'webpack/container/reference/home',
        /******/
      ],
      /******/
    };
    /******/ var idToRemoteMap = {
      /******/ 'webpack/container/remote/home/pages/index': [
        /******/ {
          /******/ externalType: 'script',
          /******/ name: 'home_app',
          /******/ externalModuleId: 'webpack/container/reference/home',
          /******/
        },
        /******/
      ],
      /******/ 'webpack/container/remote/checkout/pages/checkout/[...slug]': [
        /******/ {
          /******/ externalType: 'script',
          /******/ name: 'checkout',
          /******/ externalModuleId: 'webpack/container/reference/checkout',
          /******/
        },
        /******/
      ],
      /******/ 'webpack/container/remote/checkout/pages/checkout/[pid]': [
        /******/ {
          /******/ externalType: 'script',
          /******/ name: 'checkout',
          /******/ externalModuleId: 'webpack/container/reference/checkout',
          /******/
        },
        /******/
      ],
      /******/ 'webpack/container/remote/checkout/pages/checkout/exposed-pages':
        [
          /******/ {
            /******/ externalType: 'script',
            /******/ name: 'checkout',
            /******/ externalModuleId: 'webpack/container/reference/checkout',
            /******/
          },
          /******/
        ],
      /******/ 'webpack/container/remote/checkout/pages/checkout/index': [
        /******/ {
          /******/ externalType: 'script',
          /******/ name: 'checkout',
          /******/ externalModuleId: 'webpack/container/reference/checkout',
          /******/
        },
        /******/
      ],
      /******/ 'webpack/container/remote/checkout/pages/checkout/test-check-button':
        [
          /******/ {
            /******/ externalType: 'script',
            /******/ name: 'checkout',
            /******/ externalModuleId: 'webpack/container/reference/checkout',
            /******/
          },
          /******/
        ],
      /******/ 'webpack/container/remote/checkout/pages/checkout/test-title': [
        /******/ {
          /******/ externalType: 'script',
          /******/ name: 'checkout',
          /******/ externalModuleId: 'webpack/container/reference/checkout',
          /******/
        },
        /******/
      ],
      /******/ 'webpack/container/remote/home/pages/home/exposed-pages': [
        /******/ {
          /******/ externalType: 'script',
          /******/ name: 'home_app',
          /******/ externalModuleId: 'webpack/container/reference/home',
          /******/
        },
        /******/
      ],
      /******/ 'webpack/container/remote/home/pages/home/test-broken-remotes': [
        /******/ {
          /******/ externalType: 'script',
          /******/ name: 'home_app',
          /******/ externalModuleId: 'webpack/container/reference/home',
          /******/
        },
        /******/
      ],
      /******/ 'webpack/container/remote/home/pages/home/test-remote-hook': [
        /******/ {
          /******/ externalType: 'script',
          /******/ name: 'home_app',
          /******/ externalModuleId: 'webpack/container/reference/home',
          /******/
        },
        /******/
      ],
      /******/ 'webpack/container/remote/home/pages/home/test-shared-nav': [
        /******/ {
          /******/ externalType: 'script',
          /******/ name: 'home_app',
          /******/ externalModuleId: 'webpack/container/reference/home',
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
  /******/ /* webpack/runtime/runtimeId */
  /******/ (() => {
    /******/ __webpack_require__.j = 'shop';
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
      /******/ var uniqueName = 'shop';
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
          versions[version] = {
            get: factory,
            from: uniqueName,
            eager: !!eager,
          };
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
            /******/ register('@ant-design/colors', '7.1.0', () =>
              Promise.all([
                __webpack_require__.e('vendor-chunks/@ctrl+tinycolor@3.6.1'),
                __webpack_require__.e('vendor-chunks/@ant-design+colors@7.1.0'),
              ]).then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/lib/index.js */ '../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/lib/index.js',
                  ),
              ),
            );
            /******/ register('@ant-design/cssinjs', '1.21.0', () =>
              Promise.all([
                __webpack_require__.e(
                  'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.5'),
                __webpack_require__.e(
                  'vendor-chunks/@ant-design+cssinjs@1.21.0_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e('vendor-chunks/stylis@4.3.2'),
                __webpack_require__.e('vendor-chunks/@emotion+hash@0.8.0'),
                __webpack_require__.e('vendor-chunks/@emotion+unitless@0.7.5'),
              ]).then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/@ant-design+cssinjs@1.21.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/cssinjs/lib/index.js */ '../../node_modules/.pnpm/@ant-design+cssinjs@1.21.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/cssinjs/lib/index.js',
                  ),
              ),
            );
            /******/ register(
              '@ant-design/icons-svg/es/asn/BarsOutlined',
              '4.4.2',
              () =>
                __webpack_require__
                  .e('vendor-chunks/@ant-design+icons-svg@4.4.2')
                  .then(
                    () => () =>
                      __webpack_require__(
                        /*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js',
                      ),
                  ),
            );
            /******/ register(
              '@ant-design/icons-svg/es/asn/EllipsisOutlined',
              '4.4.2',
              () =>
                __webpack_require__
                  .e('vendor-chunks/@ant-design+icons-svg@4.4.2')
                  .then(
                    () => () =>
                      __webpack_require__(
                        /*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js',
                      ),
                  ),
            );
            /******/ register(
              '@ant-design/icons-svg/es/asn/LeftOutlined',
              '4.4.2',
              () =>
                __webpack_require__
                  .e('vendor-chunks/@ant-design+icons-svg@4.4.2')
                  .then(
                    () => () =>
                      __webpack_require__(
                        /*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js',
                      ),
                  ),
            );
            /******/ register(
              '@ant-design/icons-svg/es/asn/RightOutlined',
              '4.4.2',
              () =>
                __webpack_require__
                  .e('vendor-chunks/@ant-design+icons-svg@4.4.2')
                  .then(
                    () => () =>
                      __webpack_require__(
                        /*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js',
                      ),
                  ),
            );
            /******/ register(
              '@ant-design/icons/es/components/Context',
              '5.4.0',
              () =>
                __webpack_require__
                  .e(
                    'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
                  )
                  .then(
                    () => () =>
                      __webpack_require__(
                        /*! ../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/components/Context.js */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/components/Context.js',
                      ),
                  ),
            );
            /******/ register(
              '@ant-design/icons/es/icons/BarsOutlined',
              '5.4.0',
              () =>
                Promise.all([
                  __webpack_require__.e(
                    'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
                  ),
                  __webpack_require__.e(
                    'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
                  ),
                  __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
                  __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.5'),
                  __webpack_require__.e('vendor-chunks/classnames@2.5.1'),
                  __webpack_require__.e(
                    'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-1dea550',
                  ),
                ]).then(
                  () => () =>
                    __webpack_require__(
                      /*! ../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/BarsOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/BarsOutlined.js',
                    ),
                ),
            );
            /******/ register(
              '@ant-design/icons/es/icons/EllipsisOutlined',
              '5.4.0',
              () =>
                Promise.all([
                  __webpack_require__.e(
                    'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
                  ),
                  __webpack_require__.e(
                    'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
                  ),
                  __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
                  __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.5'),
                  __webpack_require__.e('vendor-chunks/classnames@2.5.1'),
                  __webpack_require__.e(
                    'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-83d4660',
                  ),
                ]).then(
                  () => () =>
                    __webpack_require__(
                      /*! ../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js',
                    ),
                ),
            );
            /******/ register(
              '@ant-design/icons/es/icons/LeftOutlined',
              '5.4.0',
              () =>
                Promise.all([
                  __webpack_require__.e(
                    'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
                  ),
                  __webpack_require__.e(
                    'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
                  ),
                  __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
                  __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.5'),
                  __webpack_require__.e('vendor-chunks/classnames@2.5.1'),
                  __webpack_require__.e(
                    'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-b8eb240',
                  ),
                ]).then(
                  () => () =>
                    __webpack_require__(
                      /*! ../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/LeftOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/LeftOutlined.js',
                    ),
                ),
            );
            /******/ register(
              '@ant-design/icons/es/icons/RightOutlined',
              '5.4.0',
              () =>
                Promise.all([
                  __webpack_require__.e(
                    'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
                  ),
                  __webpack_require__.e(
                    'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
                  ),
                  __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
                  __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.5'),
                  __webpack_require__.e('vendor-chunks/classnames@2.5.1'),
                  __webpack_require__.e(
                    'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-2496550',
                  ),
                ]).then(
                  () => () =>
                    __webpack_require__(
                      /*! ../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/RightOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/RightOutlined.js',
                    ),
                ),
            );
            /******/ register('next/dynamic', '14.1.2', () =>
              Promise.all([
                __webpack_require__.e(
                  'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
                __webpack_require__.e(
                  'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa90',
                ),
              ]).then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/dynamic.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/dynamic.js',
                  ),
              ),
            );
            /******/ register('next/head', '14.1.2', () =>
              Promise.all([
                __webpack_require__.e(
                  'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
                __webpack_require__.e(
                  'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa91',
                ),
              ]).then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/head.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/head.js',
                  ),
              ),
            );
            /******/ register('next/image', '14.1.2', () =>
              Promise.all([
                __webpack_require__.e(
                  'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
                __webpack_require__.e(
                  'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa92',
                ),
              ]).then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/image.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/image.js',
                  ),
              ),
            );
            /******/ register('next/link', '14.1.2', () =>
              Promise.all([
                __webpack_require__.e(
                  'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
                __webpack_require__.e(
                  'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa93',
                ),
              ]).then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/link.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/link.js',
                  ),
              ),
            );
            /******/ register('next/router', '14.1.2', () =>
              Promise.all([
                __webpack_require__.e(
                  'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
                __webpack_require__.e(
                  'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa94',
                ),
              ]).then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/router.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/router.js',
                  ),
              ),
            );
            /******/ register('next/script', '14.1.2', () =>
              Promise.all([
                __webpack_require__.e(
                  'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
                __webpack_require__.e(
                  'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa95',
                ),
              ]).then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/script.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/script.js',
                  ),
              ),
            );
            /******/ register('react/jsx-dev-runtime', '18.2.0', () =>
              __webpack_require__
                .e('vendor-chunks/react@18.2.0')
                .then(
                  () => () =>
                    __webpack_require__(
                      /*! ../../node_modules/.pnpm/react@18.2.0/node_modules/react/jsx-dev-runtime.js */ '../../node_modules/.pnpm/react@18.2.0/node_modules/react/jsx-dev-runtime.js',
                    ),
                ),
            );
            /******/ register('react/jsx-runtime', '18.2.0', () =>
              __webpack_require__
                .e('vendor-chunks/react@18.2.0')
                .then(
                  () => () =>
                    __webpack_require__(
                      /*! ../../node_modules/.pnpm/react@18.2.0/node_modules/react/jsx-runtime.js */ '../../node_modules/.pnpm/react@18.2.0/node_modules/react/jsx-runtime.js',
                    ),
                ),
            );
            /******/ register('react/jsx-runtime', '18.3.1', () =>
              __webpack_require__
                .e('vendor-chunks/react@18.3.1')
                .then(
                  () => () =>
                    __webpack_require__(
                      /*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js */ '../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js',
                    ),
                ),
            );
            /******/ register('styled-jsx', '5.1.6', () =>
              Promise.all([
                __webpack_require__.e(
                  'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
                ),
                __webpack_require__.e(
                  'vendor-chunks/styled-jsx@5.1.1_@babel+core@7.24.9_react@18.2.0',
                ),
              ]).then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.24.9_react@18.2.0/node_modules/styled-jsx/index.js */ '../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.24.9_react@18.2.0/node_modules/styled-jsx/index.js',
                  ),
              ),
            );
            /******/ initExternal('webpack/container/reference/home');
            /******/ initExternal('webpack/container/reference/checkout');
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
      '@ant-design/colors': [
        {
          version: '7.1.0',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e('vendor-chunks/@ctrl+tinycolor@3.6.1'),
              __webpack_require__.e('vendor-chunks/@ant-design+colors@7.1.0'),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/lib/index.js */ '../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/lib/index.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      '@ant-design/cssinjs': [
        {
          version: '1.21.0',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.5'),
              __webpack_require__.e(
                'vendor-chunks/@ant-design+cssinjs@1.21.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/stylis@4.3.2'),
              __webpack_require__.e('vendor-chunks/@emotion+hash@0.8.0'),
              __webpack_require__.e('vendor-chunks/@emotion+unitless@0.7.5'),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/@ant-design+cssinjs@1.21.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/cssinjs/lib/index.js */ '../../node_modules/.pnpm/@ant-design+cssinjs@1.21.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/cssinjs/lib/index.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      '@ant-design/icons-svg/es/asn/BarsOutlined': [
        {
          version: '4.4.2',
          /******/ get: () =>
            __webpack_require__
              .e('vendor-chunks/@ant-design+icons-svg@4.4.2')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js',
                  ),
              ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      '@ant-design/icons-svg/es/asn/EllipsisOutlined': [
        {
          version: '4.4.2',
          /******/ get: () =>
            __webpack_require__
              .e('vendor-chunks/@ant-design+icons-svg@4.4.2')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js',
                  ),
              ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      '@ant-design/icons-svg/es/asn/LeftOutlined': [
        {
          version: '4.4.2',
          /******/ get: () =>
            __webpack_require__
              .e('vendor-chunks/@ant-design+icons-svg@4.4.2')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js',
                  ),
              ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      '@ant-design/icons-svg/es/asn/RightOutlined': [
        {
          version: '4.4.2',
          /******/ get: () =>
            __webpack_require__
              .e('vendor-chunks/@ant-design+icons-svg@4.4.2')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js',
                  ),
              ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      '@ant-design/icons/es/components/Context': [
        {
          version: '5.4.0',
          /******/ get: () =>
            __webpack_require__
              .e(
                'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/components/Context.js */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/components/Context.js',
                  ),
              ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      '@ant-design/icons/es/icons/BarsOutlined': [
        {
          version: '5.4.0',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e(
                'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.5'),
              __webpack_require__.e('vendor-chunks/classnames@2.5.1'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-1dea550',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/BarsOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/BarsOutlined.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      '@ant-design/icons/es/icons/EllipsisOutlined': [
        {
          version: '5.4.0',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e(
                'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.5'),
              __webpack_require__.e('vendor-chunks/classnames@2.5.1'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-83d4660',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      '@ant-design/icons/es/icons/LeftOutlined': [
        {
          version: '5.4.0',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e(
                'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.5'),
              __webpack_require__.e('vendor-chunks/classnames@2.5.1'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-b8eb240',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/LeftOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/LeftOutlined.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      '@ant-design/icons/es/icons/RightOutlined': [
        {
          version: '5.4.0',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e(
                'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.5'),
              __webpack_require__.e('vendor-chunks/classnames@2.5.1'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-2496550',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/RightOutlined.js */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/RightOutlined.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      'next/dynamic': [
        {
          version: '14.1.2',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa90',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/dynamic.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/dynamic.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      'next/head': [
        {
          version: '14.1.2',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa91',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/head.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/head.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      'next/image': [
        {
          version: '14.1.2',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa92',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/image.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/image.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      'next/link': [
        {
          version: '14.1.2',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa93',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/link.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/link.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      'next/router': [
        {
          version: '14.1.2',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa94',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/router.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/router.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      'next/script': [
        {
          version: '14.1.2',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa95',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/script.js */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/script.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      'react/jsx-dev-runtime': [
        {
          version: '18.2.0',
          /******/ get: () =>
            __webpack_require__
              .e('vendor-chunks/react@18.2.0')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/react@18.2.0/node_modules/react/jsx-dev-runtime.js */ '../../node_modules/.pnpm/react@18.2.0/node_modules/react/jsx-dev-runtime.js',
                  ),
              ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      'react/jsx-runtime': [
        {
          version: '18.2.0',
          /******/ get: () =>
            __webpack_require__
              .e('vendor-chunks/react@18.2.0')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/react@18.2.0/node_modules/react/jsx-runtime.js */ '../../node_modules/.pnpm/react@18.2.0/node_modules/react/jsx-runtime.js',
                  ),
              ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
        {
          version: '18.3.1',
          /******/ get: () =>
            __webpack_require__
              .e('vendor-chunks/react@18.3.1')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js */ '../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js',
                  ),
              ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: true,
          },
        },
      ],
      'styled-jsx': [
        {
          version: '5.1.6',
          /******/ get: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e(
                'vendor-chunks/styled-jsx@5.1.1_@babel+core@7.24.9_react@18.2.0',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! ../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.24.9_react@18.2.0/node_modules/styled-jsx/index.js */ '../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.24.9_react@18.2.0/node_modules/styled-jsx/index.js',
                ),
            ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: '^5.1.6',
            strictVersion: false,
            singleton: true,
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
  /******/ /* webpack/runtime/embed/federation */
  /******/ (() => {
    /******/ __webpack_require__.federation.sharedRuntime =
      globalThis.sharedRuntime;
    /******/ __webpack_require__(
      /*! ../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/dist/build/webpack/loaders/next-swc-loader.js??ruleSet[1].rules[6].oneOf[0].use[0]!./node_modules/.federation/entry.4f65ff976d8c02b3fa85e8b22bbfe43f.js */ './node_modules/.federation/entry.4f65ff976d8c02b3fa85e8b22bbfe43f.js',
    );
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/consumes */
  /******/ (() => {
    /******/ var installedModules = {};
    /******/ var moduleToHandlerMapping = {
      /******/ 'webpack/sharing/consume/default/next/head/next/head?8450': {
        /******/ getter: () =>
          Promise.all([
            __webpack_require__.e(
              'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
            ),
            __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
            __webpack_require__.e(
              'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa91',
            ),
          ]).then(
            () => () =>
              __webpack_require__(
                /*! next/head */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/head.js',
              ),
          ),
        /******/ shareInfo: {
          /******/ shareConfig: {
            /******/ fixedDependencies: false,
            /******/ requiredVersion: '^12 || ^13 || ^14',
            /******/ strictVersion: false,
            /******/ singleton: true,
            /******/ eager: false,
            /******/
          },
          /******/ scope: ['default'],
          /******/
        },
        /******/ shareKey: 'next/head',
        /******/
      },
      /******/ 'webpack/sharing/consume/default/next/router/next/router': {
        /******/ getter: () =>
          Promise.all([
            __webpack_require__.e(
              'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
            ),
            __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
            __webpack_require__.e(
              'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa94',
            ),
          ]).then(
            () => () =>
              __webpack_require__(
                /*! next/router */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/router.js',
              ),
          ),
        /******/ shareInfo: {
          /******/ shareConfig: {
            /******/ fixedDependencies: false,
            /******/ requiredVersion: false,
            /******/ strictVersion: false,
            /******/ singleton: true,
            /******/ eager: false,
            /******/
          },
          /******/ scope: ['default'],
          /******/
        },
        /******/ shareKey: 'next/router',
        /******/
      },
      /******/ 'webpack/sharing/consume/default/next/link/next/link': {
        /******/ getter: () =>
          Promise.all([
            __webpack_require__.e(
              'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
            ),
            __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
            __webpack_require__.e(
              'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa93',
            ),
          ]).then(
            () => () =>
              __webpack_require__(
                /*! next/link */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/link.js',
              ),
          ),
        /******/ shareInfo: {
          /******/ shareConfig: {
            /******/ fixedDependencies: false,
            /******/ requiredVersion: '^12 || ^13 || ^14',
            /******/ strictVersion: false,
            /******/ singleton: true,
            /******/ eager: false,
            /******/
          },
          /******/ scope: ['default'],
          /******/
        },
        /******/ shareKey: 'next/link',
        /******/
      },
      /******/ 'webpack/sharing/consume/default/next/script/next/script': {
        /******/ getter: () =>
          Promise.all([
            __webpack_require__.e(
              'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
            ),
            __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
            __webpack_require__.e(
              'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa95',
            ),
          ]).then(
            () => () =>
              __webpack_require__(
                /*! next/script */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/script.js',
              ),
          ),
        /******/ shareInfo: {
          /******/ shareConfig: {
            /******/ fixedDependencies: false,
            /******/ requiredVersion: '^12 || ^13 || ^14',
            /******/ strictVersion: false,
            /******/ singleton: true,
            /******/ eager: false,
            /******/
          },
          /******/ scope: ['default'],
          /******/
        },
        /******/ shareKey: 'next/script',
        /******/
      },
      /******/ 'webpack/sharing/consume/default/next/image/next/image': {
        /******/ getter: () =>
          Promise.all([
            __webpack_require__.e(
              'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
            ),
            __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
            __webpack_require__.e(
              'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa92',
            ),
          ]).then(
            () => () =>
              __webpack_require__(
                /*! next/image */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/image.js',
              ),
          ),
        /******/ shareInfo: {
          /******/ shareConfig: {
            /******/ fixedDependencies: false,
            /******/ requiredVersion: '^12 || ^13 || ^14',
            /******/ strictVersion: false,
            /******/ singleton: true,
            /******/ eager: false,
            /******/
          },
          /******/ scope: ['default'],
          /******/
        },
        /******/ shareKey: 'next/image',
        /******/
      },
      /******/ 'webpack/sharing/consume/default/next/dynamic/next/dynamic': {
        /******/ getter: () =>
          Promise.all([
            __webpack_require__.e(
              'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
            ),
            __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
            __webpack_require__.e(
              'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa90',
            ),
          ]).then(
            () => () =>
              __webpack_require__(
                /*! next/dynamic */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/dynamic.js',
              ),
          ),
        /******/ shareInfo: {
          /******/ shareConfig: {
            /******/ fixedDependencies: false,
            /******/ requiredVersion: '^12 || ^13 || ^14',
            /******/ strictVersion: false,
            /******/ singleton: true,
            /******/ eager: false,
            /******/
          },
          /******/ scope: ['default'],
          /******/
        },
        /******/ shareKey: 'next/dynamic',
        /******/
      },
      /******/ 'webpack/sharing/consume/default/styled-jsx/styled-jsx': {
        /******/ getter: () =>
          Promise.all([
            __webpack_require__.e(
              'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
            ),
            __webpack_require__.e(
              'vendor-chunks/styled-jsx@5.1.1_@babel+core@7.24.9_react@18.2.0',
            ),
          ]).then(
            () => () =>
              __webpack_require__(
                /*! styled-jsx */ '../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.24.9_react@18.2.0/node_modules/styled-jsx/index.js',
              ),
          ),
        /******/ shareInfo: {
          /******/ shareConfig: {
            /******/ fixedDependencies: false,
            /******/ requiredVersion: '^5.1.6',
            /******/ strictVersion: false,
            /******/ singleton: true,
            /******/ eager: false,
            /******/
          },
          /******/ scope: ['default'],
          /******/
        },
        /******/ shareKey: 'styled-jsx',
        /******/
      },
      /******/ 'webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime?c892':
        {
          /******/ getter: () =>
            __webpack_require__
              .e('vendor-chunks/react@18.3.1')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! react/jsx-runtime */ '../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js',
                  ),
              ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: false,
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: 'react/jsx-runtime',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime':
        {
          /******/ getter: () =>
            __webpack_require__
              .e('vendor-chunks/react@18.2.0')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! react/jsx-dev-runtime */ '../../node_modules/.pnpm/react@18.2.0/node_modules/react/jsx-dev-runtime.js',
                  ),
              ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: false,
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: 'react/jsx-dev-runtime',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined':
        {
          /******/ getter: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e(
                'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-1dea551',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! @ant-design/icons/es/icons/BarsOutlined */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/BarsOutlined.js',
                ),
            ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: '^5.3.7',
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: '@ant-design/icons/es/icons/BarsOutlined',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined':
        {
          /******/ getter: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e(
                'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-b8eb241',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! @ant-design/icons/es/icons/LeftOutlined */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/LeftOutlined.js',
                ),
            ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: '^5.3.7',
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: '@ant-design/icons/es/icons/LeftOutlined',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined':
        {
          /******/ getter: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e(
                'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-2496551',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! @ant-design/icons/es/icons/RightOutlined */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/RightOutlined.js',
                ),
            ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: '^5.3.7',
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: '@ant-design/icons/es/icons/RightOutlined',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs':
        {
          /******/ getter: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/@ant-design+cssinjs@1.21.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/stylis@4.3.2'),
              __webpack_require__.e('vendor-chunks/@emotion+hash@0.8.0'),
              __webpack_require__.e('vendor-chunks/@emotion+unitless@0.7.5'),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! @ant-design/cssinjs */ '../../node_modules/.pnpm/@ant-design+cssinjs@1.21.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/cssinjs/lib/index.js',
                ),
            ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: '^1.21.0',
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: '@ant-design/cssinjs',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context':
        {
          /******/ getter: () =>
            __webpack_require__
              .e(
                'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
              )
              .then(
                () => () =>
                  __webpack_require__(
                    /*! @ant-design/icons/es/components/Context */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/components/Context.js',
                  ),
              ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: '^5.3.7',
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: '@ant-design/icons/es/components/Context',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?f464':
        {
          /******/ getter: () =>
            __webpack_require__
              .e('vendor-chunks/@ant-design+colors@7.1.0')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! @ant-design/colors */ '../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/lib/index.js',
                  ),
              ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: '^7.1.0',
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: '@ant-design/colors',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined':
        {
          /******/ getter: () =>
            Promise.all([
              __webpack_require__.e(
                'vendor-chunks/rc-util@5.43.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e(
                'vendor-chunks/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0',
              ),
              __webpack_require__.e('vendor-chunks/@babel+runtime@7.24.8'),
              __webpack_require__.e(
                'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-83d4661',
              ),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! @ant-design/icons/es/icons/EllipsisOutlined */ '../../node_modules/.pnpm/@ant-design+icons@5.4.0_react-dom@18.2.0_react@18.2.0/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js',
                ),
            ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: '^5.3.7',
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: '@ant-design/icons/es/icons/EllipsisOutlined',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/next/head/next/head?2efa': {
        /******/ getter: () =>
          Promise.all([
            __webpack_require__.e(
              'vendor-chunks/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0',
            ),
            __webpack_require__.e('vendor-chunks/@swc+helpers@0.5.2'),
            __webpack_require__.e(
              'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa91',
            ),
          ]).then(
            () => () =>
              __webpack_require__(
                /*! next/head */ '../../node_modules/.pnpm/next@14.1.2_@babel+core@7.24.9_react-dom@18.2.0_react@18.2.0/node_modules/next/head.js',
              ),
          ),
        /******/ shareInfo: {
          /******/ shareConfig: {
            /******/ fixedDependencies: false,
            /******/ requiredVersion: '14.1.2',
            /******/ strictVersion: false,
            /******/ singleton: true,
            /******/ eager: false,
            /******/
          },
          /******/ scope: ['default'],
          /******/
        },
        /******/ shareKey: 'next/head',
        /******/
      },
      /******/ 'webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?220b':
        {
          /******/ getter: () =>
            Promise.all([
              __webpack_require__.e('vendor-chunks/@ctrl+tinycolor@3.6.1'),
              __webpack_require__.e('vendor-chunks/@ant-design+colors@7.1.0'),
            ]).then(
              () => () =>
                __webpack_require__(
                  /*! @ant-design/colors */ '../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/lib/index.js',
                ),
            ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: '^7.0.0',
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: '@ant-design/colors',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/BarsOutlined/@ant-design/icons-svg/es/asn/BarsOutlined':
        {
          /******/ getter: () =>
            __webpack_require__
              .e('vendor-chunks/@ant-design+icons-svg@4.4.2')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! @ant-design/icons-svg/es/asn/BarsOutlined */ '../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js',
                  ),
              ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: '^4.4.0',
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: '@ant-design/icons-svg/es/asn/BarsOutlined',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/EllipsisOutlined/@ant-design/icons-svg/es/asn/EllipsisOutlined':
        {
          /******/ getter: () =>
            __webpack_require__
              .e('vendor-chunks/@ant-design+icons-svg@4.4.2')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! @ant-design/icons-svg/es/asn/EllipsisOutlined */ '../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js',
                  ),
              ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: '^4.4.0',
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: '@ant-design/icons-svg/es/asn/EllipsisOutlined',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/LeftOutlined/@ant-design/icons-svg/es/asn/LeftOutlined':
        {
          /******/ getter: () =>
            __webpack_require__
              .e('vendor-chunks/@ant-design+icons-svg@4.4.2')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! @ant-design/icons-svg/es/asn/LeftOutlined */ '../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js',
                  ),
              ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: '^4.4.0',
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: '@ant-design/icons-svg/es/asn/LeftOutlined',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/RightOutlined/@ant-design/icons-svg/es/asn/RightOutlined':
        {
          /******/ getter: () =>
            __webpack_require__
              .e('vendor-chunks/@ant-design+icons-svg@4.4.2')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! @ant-design/icons-svg/es/asn/RightOutlined */ '../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js',
                  ),
              ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: '^4.4.0',
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: '@ant-design/icons-svg/es/asn/RightOutlined',
          /******/
        },
      /******/ 'webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime?1fa9':
        {
          /******/ getter: () =>
            __webpack_require__
              .e('vendor-chunks/react@18.2.0')
              .then(
                () => () =>
                  __webpack_require__(
                    /*! react/jsx-runtime */ '../../node_modules/.pnpm/react@18.2.0/node_modules/react/jsx-runtime.js',
                  ),
              ),
          /******/ shareInfo: {
            /******/ shareConfig: {
              /******/ fixedDependencies: false,
              /******/ requiredVersion: false,
              /******/ strictVersion: false,
              /******/ singleton: true,
              /******/ eager: false,
              /******/
            },
            /******/ scope: ['default'],
            /******/
          },
          /******/ shareKey: 'react/jsx-runtime',
          /******/
        },
      /******/
    };
    /******/ // no consumes in initial chunks
    /******/ var chunkMapping = {
      /******/ __federation_expose_noop: [
        /******/ 'webpack/sharing/consume/default/next/head/next/head?8450',
        /******/ 'webpack/sharing/consume/default/next/router/next/router',
        /******/ 'webpack/sharing/consume/default/next/link/next/link',
        /******/ 'webpack/sharing/consume/default/next/script/next/script',
        /******/ 'webpack/sharing/consume/default/next/image/next/image',
        /******/ 'webpack/sharing/consume/default/next/dynamic/next/dynamic',
        /******/ 'webpack/sharing/consume/default/styled-jsx/styled-jsx',
        /******/ 'webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime?c892',
        /******/
      ],
      /******/ __federation_expose_next__router: [
        /******/ 'webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime?c892',
        /******/
      ],
      /******/ __federation_expose_WebpackSvg: [
        /******/ 'webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime',
        /******/
      ],
      /******/ __federation_expose_WebpackPng: [
        /******/ 'webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime',
        /******/
      ],
      /******/ __federation_expose_menu: [
        /******/ 'webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime',
        /******/ 'webpack/sharing/consume/default/next/router/next/router',
        /******/ 'webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined',
        /******/ 'webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined',
        /******/ 'webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined',
        /******/ 'webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs',
        /******/ 'webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context',
        /******/ 'webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?f464',
        /******/ 'webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined',
        /******/
      ],
      /******/ __federation_expose_pages__shop__exposed_pages: [
        /******/ 'webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime',
        /******/
      ],
      /******/ __federation_expose_pages__shop__index: [
        /******/ 'webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime',
        /******/ 'webpack/sharing/consume/default/next/head/next/head?2efa',
        /******/
      ],
      /******/ __federation_expose_pages__shop__test_webpack_png: [
        /******/ 'webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime',
        /******/
      ],
      /******/ __federation_expose_pages__shop__test_webpack_svg: [
        /******/ 'webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime',
        /******/
      ],
      /******/ '__federation_expose_pages__shop__products__[...slug]': [
        /******/ 'webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime',
        /******/ 'webpack/sharing/consume/default/next/router/next/router',
        /******/
      ],
      /******/ 'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-1dea550':
        [
          /******/ 'webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?220b',
          /******/ 'webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/BarsOutlined/@ant-design/icons-svg/es/asn/BarsOutlined',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-83d4660':
        [
          /******/ 'webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?220b',
          /******/ 'webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/EllipsisOutlined/@ant-design/icons-svg/es/asn/EllipsisOutlined',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-b8eb240':
        [
          /******/ 'webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?220b',
          /******/ 'webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/LeftOutlined/@ant-design/icons-svg/es/asn/LeftOutlined',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-2496550':
        [
          /******/ 'webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?220b',
          /******/ 'webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/RightOutlined/@ant-design/icons-svg/es/asn/RightOutlined',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa90':
        [
          /******/ 'webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime?1fa9',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa91':
        [
          /******/ 'webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime?1fa9',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa92':
        [
          /******/ 'webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime?1fa9',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa93':
        [
          /******/ 'webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime?1fa9',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa94':
        [
          /******/ 'webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime?1fa9',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_1fa95':
        [
          /******/ 'webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime?1fa9',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-1dea551':
        [
          /******/ 'webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?220b',
          /******/ 'webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/BarsOutlined/@ant-design/icons-svg/es/asn/BarsOutlined',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-b8eb241':
        [
          /******/ 'webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?220b',
          /******/ 'webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/LeftOutlined/@ant-design/icons-svg/es/asn/LeftOutlined',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-2496551':
        [
          /******/ 'webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?220b',
          /******/ 'webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/RightOutlined/@ant-design/icons-svg/es/asn/RightOutlined',
          /******/
        ],
      /******/ 'webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-83d4661':
        [
          /******/ 'webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?220b',
          /******/ 'webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/EllipsisOutlined/@ant-design/icons-svg/es/asn/EllipsisOutlined',
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
  /******/ /* webpack/runtime/readFile chunk loading */
  /******/ (() => {
    /******/ // no baseURI
    /******/
    /******/ // object to store loaded chunks
    /******/ // "0" means "already loaded", Promise means loading
    /******/ var installedChunks = {
      /******/ shop: 0,
      /******/
    };
    /******/
    /******/ // no on chunks loaded
    /******/
    /******/ var installChunk = (chunk) => {
      /******/ var moreModules = chunk.modules,
        chunkIds = chunk.ids,
        runtime = chunk.runtime;
      /******/ for (var moduleId in moreModules) {
        /******/ if (__webpack_require__.o(moreModules, moduleId)) {
          /******/ __webpack_require__.m[moduleId] = moreModules[moduleId];
          /******/
        }
        /******/
      }
      /******/ if (runtime) runtime(__webpack_require__);
      /******/ for (var i = 0; i < chunkIds.length; i++) {
        /******/ if (installedChunks[chunkIds[i]]) {
          /******/ installedChunks[chunkIds[i]][0]();
          /******/
        }
        /******/ installedChunks[chunkIds[i]] = 0;
        /******/
      }
      /******/
      /******/
    };
    /******/
    /******/ // ReadFile + VM.run chunk loading for javascript
    /******/ __webpack_require__.f.readFileVm = function (chunkId, promises) {
      /******/
      /******/ var installedChunkData = installedChunks[chunkId];
      /******/ if (installedChunkData !== 0) {
        // 0 means "already installed".
        /******/ // array of [resolve, reject, promise] means "currently loading"
        /******/ if (installedChunkData) {
          /******/ promises.push(installedChunkData[2]);
          /******/
        } else {
          /******/ if (
            !/^(webpack_sharing_consume_default_(ant\-design_colors_ant\-design_colors\-webpack_sharing_consume_d\-(1dea55[01]|249655[01]|83d466[01]|b8eb24[01])|react_jsx\-runtime_react_jsx\-runtime\-_1fa9[012345])|__federation_expose_next__router)$/.test(
              chunkId,
            )
          ) {
            /******/ // load the chunk and return promise to it
            /******/ var promise = new Promise(function (resolve, reject) {
              /******/ installedChunkData = installedChunks[chunkId] = [
                resolve,
                reject,
              ];
              /******/ var filename = require('path').join(
                __dirname,
                '' + __webpack_require__.u(chunkId),
              );
              /******/ require('fs').readFile(
                filename,
                'utf-8',
                function (err, content) {
                  /******/ if (err) return reject(err);
                  /******/ var chunk = {};
                  /******/ require('vm').runInThisContext(
                    '(function(exports, require, __dirname, __filename) {' +
                      content +
                      '\n})',
                    filename,
                  )(
                    chunk,
                    require,
                    require('path').dirname(filename),
                    filename,
                  );
                  /******/ installChunk(chunk);
                  /******/
                },
              );
              /******/
            });
            /******/ promises.push((installedChunkData[2] = promise));
            /******/
          } else installedChunks[chunkId] = 0;
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
    /******/ // no external install chunk
    /******/
    /******/ // no HMR
    /******/
    /******/ // no HMR manifest
    /******/
  })();
  /******/
  /************************************************************************/
  /******/
  /******/ // module cache are used so entry inlining is disabled
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ var __webpack_exports__ = __webpack_require__(
    'webpack/container/entry/shop',
  );
  /******/ module.exports.shop = __webpack_exports__;
  /******/
  /******/
})();
