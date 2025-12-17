/**
 * @license React
 * react-server-dom-webpack-plugin.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';
var path = require('path'),
  url = require('url'),
  asyncLib = require('neo-async'),
  acorn = require('acorn-loose'),
  ModuleDependency = require('webpack/lib/dependencies/ModuleDependency'),
  NullDependency = require('webpack/lib/dependencies/NullDependency'),
  Template = require('webpack/lib/Template'),
  webpack = require('webpack'),
  fs = require('fs');

function _unsupportedIterableToArray(o, minLen) {
  if (o) {
    if ('string' === typeof o) return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    'Object' === n && o.constructor && (n = o.constructor.name);
    if ('Map' === n || 'Set' === n) return Array.from(o);
    if ('Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return _arrayLikeToArray(o, minLen);
  }
}
function _arrayLikeToArray(arr, len) {
  if (null == len || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it =
    ('undefined' !== typeof Symbol && o[Symbol.iterator]) || o['@@iterator'];
  if (!it) {
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && 'number' === typeof o.length)
    ) {
      it && (o = it);
      var i = 0;
      allowArrayLike = function () {};
      return {
        s: allowArrayLike,
        n: function () {
          return i >= o.length ? { done: !0 } : { done: !1, value: o[i++] };
        },
        e: function (e) {
          throw e;
        },
        f: allowArrayLike,
      };
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
    );
  }
  var normalCompletion = !0,
    didErr = !1,
    err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = !0;
      err = e;
    },
    f: function () {
      try {
        normalCompletion || null == it.return || it.return();
      } finally {
        if (didErr) throw err;
      }
    },
  };
}

const isArrayImpl = Array.isArray;

class ClientReferenceDependency extends ModuleDependency {
  constructor(request) {
    super(request);
  }
  get type() {
    return 'client-reference';
  }
}

class ServerReferenceDependency extends ModuleDependency {
  constructor(request) {
    super(request);
  }
  get type() {
    return 'server-reference';
  }
}

const clientFileName = require.resolve('../client.browser.js');

function hasDirective(source, directive) {
  if (-1 === source.indexOf(directive)) return false;
  let body;
  try {
    body = acorn.parse(source, {
      ecmaVersion: '2024',
      sourceType: 'module',
    }).body;
  } catch (x) {
    return false;
  }
  for (let i = 0; i < body.length; i++) {
    const node = body[i];
    if ('ExpressionStatement' !== node.type || !node.directive) break;
    if (directive === node.directive) return true;
  }
  return false;
}

function getExports(source) {
  const exports = [];
  let body;
  try {
    body = acorn.parse(source, {
      ecmaVersion: '2024',
      sourceType: 'module',
    }).body;
  } catch (x) {
    return exports;
  }
  for (const node of body) {
    if (node.type === 'ExportNamedDeclaration' && node.declaration) {
      if (
        node.declaration.type === 'FunctionDeclaration' &&
        node.declaration.id
      ) {
        exports.push(node.declaration.id.name);
      }
      if (node.declaration.type === 'VariableDeclaration') {
        for (const decl of node.declaration.declarations) {
          if (decl.id && decl.id.type === 'Identifier') {
            exports.push(decl.id.name);
          }
        }
      }
    }
    if (node.type === 'ExportDefaultDeclaration') {
      exports.push('default');
    }
  }
  return exports;
}

class ReactFlightWebpackPlugin {
  constructor(options) {
    this.serverConsumerManifestFilename =
      this.clientManifestFilename =
      this.serverActionsManifestFilename =
      this.chunkName =
      this.clientReferences =
      this.serverReferences =
        void 0;

    if (!options || 'boolean' !== typeof options.isServer)
      throw Error(
        'ReactFlightPlugin: You must specify the isServer option as a boolean.',
      );

    this.isServer = options.isServer;

    // Client references config (for client compiler)
    options.clientReferences
      ? 'string' !== typeof options.clientReferences &&
        isArrayImpl(options.clientReferences)
        ? (this.clientReferences = options.clientReferences)
        : (this.clientReferences = [options.clientReferences])
      : (this.clientReferences = [
          { directory: '.', recursive: !0, include: /\.(js|ts|jsx|tsx)$/ },
        ]);

    // Server references config (for server compiler)
    options.serverReferences
      ? 'string' !== typeof options.serverReferences &&
        isArrayImpl(options.serverReferences)
        ? (this.serverReferences = options.serverReferences)
        : (this.serverReferences = [options.serverReferences])
      : (this.serverReferences = [
          { directory: '.', recursive: !0, include: /\.(js|ts|jsx|tsx)$/ },
        ]);

    'string' === typeof options.chunkName
      ? ((this.chunkName = options.chunkName),
        /\[(index|request)\]/.test(this.chunkName) ||
          (this.chunkName += '[index]'))
      : (this.chunkName = 'client[index]');

    this.clientManifestFilename =
      options.clientManifestFilename || 'react-client-manifest.json';
    this.serverConsumerManifestFilename =
      options.serverConsumerManifestFilename || 'react-ssr-manifest.json';
    this.serverActionsManifestFilename =
      options.serverActionsManifestFilename ||
      'react-server-actions-manifest.json';
    this.extraServerActionsManifests =
      options.extraServerActionsManifests || [];
    this.discoveredClientRefs = options.discoveredClientRefs || [];
  }

  apply(compiler) {
    if (this.isServer) {
      this.applyServer(compiler);
    } else {
      this.applyClient(compiler);
    }
  }

  applyServer(compiler) {
    const _this = this;
    const serverActions = new Map();

    // Helper to get serverReferencesMap at runtime (after loaders have populated it)
    function getServerReferencesMap() {
      try {
        return require('./rsc-client-loader').serverReferencesMap;
      } catch (e) {
        return new Map();
      }
    }

    // Helper to get inlineServerActionsMap from server loader
    function getInlineServerActionsMap() {
      try {
        return require('./rsc-server-loader').inlineServerActionsMap;
      } catch (e) {
        return new Map();
      }
    }

    // Scan for 'use server' modules during compilation
    compiler.hooks.thisCompilation.tap(
      'ReactFlightPlugin',
      (compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          ServerReferenceDependency,
          normalModuleFactory,
        );
        compilation.dependencyTemplates.set(
          ServerReferenceDependency,
          new NullDependency.Template(),
        );

        const handler = (parser) => {
          parser.hooks.program.tap('ReactFlightPlugin', (ast) => {
            const module = parser.state.module;
            if (!module.resource) return;

            // Check for 'use server' directive
            let hasUseServer = false;
            for (const node of ast.body) {
              if (node.type !== 'ExpressionStatement' || !node.directive) break;
              if (node.directive === 'use server') {
                hasUseServer = true;
                break;
              }
            }

            if (!hasUseServer) return;

            // Collect exports from this module
            const exports = [];
            for (const node of ast.body) {
              if (node.type === 'ExportNamedDeclaration' && node.declaration) {
                if (
                  node.declaration.type === 'FunctionDeclaration' &&
                  node.declaration.id
                ) {
                  exports.push(node.declaration.id.name);
                }
                if (node.declaration.type === 'VariableDeclaration') {
                  for (const decl of node.declaration.declarations) {
                    if (decl.id && decl.id.type === 'Identifier') {
                      exports.push(decl.id.name);
                    }
                  }
                }
              }
              if (node.type === 'ExportDefaultDeclaration') {
                exports.push('default');
              }
            }

            if (exports.length > 0) {
              serverActions.set(module.resource, exports);
            }
          });
        };

        normalModuleFactory.hooks.parser
          .for('javascript/auto')
          .tap('ReactFlightPlugin', handler);
        normalModuleFactory.hooks.parser
          .for('javascript/esm')
          .tap('ReactFlightPlugin', handler);
        normalModuleFactory.hooks.parser
          .for('javascript/dynamic')
          .tap('ReactFlightPlugin', handler);
      },
    );

    // Generate server actions manifest
    compiler.hooks.make.tap('ReactFlightPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'ReactFlightPlugin',
          // Emit server-actions manifest early so downstream plugins (e.g. MF additionalData
          // at OPTIMIZE_TRANSFER/3000) can read it. SUMMARIZE is 1000.
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        function () {
          const manifest = {};

          // Include actions detected by AST parsing
          for (const [resourcePath, exports] of serverActions) {
            const moduleUrl = url.pathToFileURL(resourcePath).href;

            for (const exportName of exports) {
              const actionId =
                exportName === 'default'
                  ? `${moduleUrl}#default`
                  : `${moduleUrl}#${exportName}`;

              manifest[actionId] = {
                id: moduleUrl,
                name: exportName,
                chunks: [],
              };
            }
          }

          // Include actions registered by the client loader via shared map
          const serverReferencesMap = getServerReferencesMap();
          if (serverReferencesMap && serverReferencesMap.size > 0) {
            for (const [actionId, entry] of serverReferencesMap) {
              if (!manifest[actionId]) {
                manifest[actionId] = entry;
              }
            }
          }

          // Include inline server actions registered by the server loader
          const inlineServerActionsMap = getInlineServerActionsMap();
          if (inlineServerActionsMap && inlineServerActionsMap.size > 0) {
            for (const [actionId, entry] of inlineServerActionsMap) {
              if (!manifest[actionId]) {
                manifest[actionId] = entry;
              }
            }
          }

          // Merge any extra server action manifests (e.g. from MF remotes)
          if (Array.isArray(_this.extraServerActionsManifests)) {
            for (const manifestPath of _this.extraServerActionsManifests) {
              if (!manifestPath) continue;
              try {
                if (!fs.existsSync(manifestPath)) continue;
                const json = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                for (const [actionId, entry] of Object.entries(json)) {
                  if (!manifest[actionId]) {
                    manifest[actionId] = entry;
                  }
                }
              } catch (e) {
                compilation.warnings.push(
                  new webpack.WebpackError(
                    'ReactFlightPlugin: Failed to merge server actions manifest from ' +
                      manifestPath +
                      ': ' +
                      e.message,
                  ),
                );
              }
            }
          }

          const output = JSON.stringify(manifest, null, 2);
          compilation.emitAsset(
            _this.serverActionsManifestFilename,
            new webpack.sources.RawSource(output, false),
          );

          const actionCount = Object.keys(manifest).length;
          if (actionCount > 0) {
            console.log(
              `[ReactFlightPlugin] Generated ${_this.serverActionsManifestFilename} with ${actionCount} action(s)`,
            );
          }
        },
      );
    });
  }

  applyClient(compiler) {
    const _this = this;
    let resolvedClientReferences,
      clientFileNameFound = !1;

    compiler.hooks.beforeCompile.tapAsync(
      'ReactFlightPlugin',
      (_ref, callback) => {
        _ref = _ref.contextModuleFactory;
        const contextResolver = compiler.resolverFactory.get('context', {}),
          normalResolver = compiler.resolverFactory.get('normal');
        _this.resolveAllClientFiles(
          compiler.context,
          contextResolver,
          normalResolver,
          compiler.inputFileSystem,
          _ref,
          function (err, resolvedClientRefs) {
            err
              ? callback(err)
              : ((resolvedClientReferences = resolvedClientRefs), callback());
          },
        );
      },
    );

    compiler.hooks.thisCompilation.tap(
      'ReactFlightPlugin',
      (compilation, _ref2) => {
        _ref2 = _ref2.normalModuleFactory;
        compilation.dependencyFactories.set(ClientReferenceDependency, _ref2);
        compilation.dependencyTemplates.set(
          ClientReferenceDependency,
          new NullDependency.Template(),
        );
        compilation = (parser) => {
          parser.hooks.program.tap('ReactFlightPlugin', () => {
            const module = parser.state.module;
            if (
              module.resource === clientFileName &&
              ((clientFileNameFound = !0), resolvedClientReferences)
            )
              for (let i = 0; i < resolvedClientReferences.length; i++) {
                const dep = resolvedClientReferences[i];
                var chunkName = _this.chunkName
                  .replace(/\[index\]/g, '' + i)
                  .replace(/\[request\]/g, Template.toPath(dep.userRequest));
                chunkName = new webpack.AsyncDependenciesBlock(
                  { name: chunkName },
                  null,
                  dep.request,
                );
                chunkName.addDependency(dep);
                module.addBlock(chunkName);
              }
          });
        };
        _ref2.hooks.parser
          .for('javascript/auto')
          .tap('HarmonyModulesPlugin', compilation);
        _ref2.hooks.parser
          .for('javascript/esm')
          .tap('HarmonyModulesPlugin', compilation);
        _ref2.hooks.parser
          .for('javascript/dynamic')
          .tap('HarmonyModulesPlugin', compilation);
      },
    );

    compiler.hooks.make.tap('ReactFlightPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'ReactFlightPlugin',
          // Use SUMMARIZE (1000) instead of REPORT (5000) so react-client-manifest.json
          // is available for MF's additionalData hook at OPTIMIZE_TRANSFER (3000)
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        function () {
          if (!1 === clientFileNameFound)
            compilation.warnings.push(
              new webpack.WebpackError(
                'Client runtime at react-server-dom-webpack/client was not found. React Server Components module map file ' +
                  _this.clientManifestFilename +
                  ' was not created.',
              ),
            );
          else {
            var configuredCrossOriginLoading =
              compilation.outputOptions.crossOriginLoading;
            configuredCrossOriginLoading =
              'string' === typeof configuredCrossOriginLoading
                ? 'use-credentials' === configuredCrossOriginLoading
                  ? configuredCrossOriginLoading
                  : 'anonymous'
                : null;
            var resolvedClientFiles = new Set(
                (resolvedClientReferences || []).map((ref) => ref.request),
              ),
              discoveredClientRefs = new Set(
                Array.isArray(_this.discoveredClientRefs)
                  ? _this.discoveredClientRefs
                  : [],
              ),
              clientManifest = {},
              moduleMap = {};
            configuredCrossOriginLoading = {
              moduleLoading: {
                prefix: compilation.outputOptions.publicPath || '',
                crossOrigin: configuredCrossOriginLoading,
              },
              moduleMap,
            };
            var runtimeChunkFiles = new Set();
            compilation.entrypoints.forEach((entrypoint) => {
              (entrypoint = entrypoint.getRuntimeChunk()) &&
                entrypoint.files.forEach((runtimeFile) => {
                  runtimeChunkFiles.add(runtimeFile);
                });
            });
            compilation.chunkGroups.forEach(function (chunkGroup) {
              function recordModule(id, module) {
                if (!module) return;

                function visit(mod) {
                  if (!mod) return;
                  const isClient =
                    mod.buildInfo &&
                    mod.buildInfo.rscDirective === 'use client';

                  if (
                    isClient ||
                    (mod.resource && discoveredClientRefs.has(mod.resource)) ||
                    (mod.resource && resolvedClientFiles.has(mod.resource))
                  ) {
                    const resource = mod.resource;
                    if (resource) {
                      const href = url.pathToFileURL(resource).href;
                      const ssrExports = {};
                      clientManifest[href] = { id, chunks, name: '*' };
                      ssrExports['*'] = { specifier: href, name: '*' };
                      moduleMap[id] = ssrExports;
                    }
                  }

                  if (mod.modules && Array.isArray(mod.modules)) {
                    mod.modules.forEach(visit);
                  }
                }

                visit(module);
              }
              const chunks = [];
              chunkGroup.chunks.forEach(function (c) {
                var _iterator = _createForOfIteratorHelper(c.files),
                  _step;
                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                    const file = _step.value;
                    if (!file.endsWith('.js') && !file.endsWith('.mjs')) break;
                    if (
                      file.endsWith('.hot-update.js') ||
                      file.endsWith('.hot-update.mjs')
                    )
                      break;
                    chunks.push(c.id, file);
                    break;
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }
              });
              chunkGroup.chunks.forEach(function (chunk) {
                chunk = compilation.chunkGraph.getChunkModulesIterable(chunk);
                Array.from(chunk).forEach(function (module) {
                  const moduleId = compilation.chunkGraph.getModuleId(module);
                  recordModule(moduleId, module);
                  module.modules &&
                    module.modules.forEach((concatenatedMod) => {
                      recordModule(moduleId, concatenatedMod);
                    });
                });
              });
            });
            var clientOutput = JSON.stringify(clientManifest, null, 2);
            compilation.emitAsset(
              _this.clientManifestFilename,
              new webpack.sources.RawSource(clientOutput, !1),
            );
            configuredCrossOriginLoading = JSON.stringify(
              configuredCrossOriginLoading,
              null,
              2,
            );
            compilation.emitAsset(
              _this.serverConsumerManifestFilename,
              new webpack.sources.RawSource(configuredCrossOriginLoading, !1),
            );
          }
        },
      );
    });
  }

  resolveAllClientFiles(
    context,
    contextResolver,
    normalResolver,
    fs,
    contextModuleFactory,
    callback,
  ) {
    function hasUseClientDirective(source) {
      return hasDirective(source, 'use client');
    }
    asyncLib.map(
      this.clientReferences,
      (clientReferencePath, cb) => {
        'string' === typeof clientReferencePath
          ? cb(null, [new ClientReferenceDependency(clientReferencePath)])
          : contextResolver.resolve(
              {},
              context,
              clientReferencePath.directory,
              {},
              (err, resolvedDirectory) => {
                if (err) return cb(err);
                contextModuleFactory.resolveDependencies(
                  fs,
                  {
                    resource: resolvedDirectory,
                    resourceQuery: '',
                    recursive:
                      void 0 === clientReferencePath.recursive
                        ? !0
                        : clientReferencePath.recursive,
                    regExp: clientReferencePath.include,
                    include: void 0,
                    exclude: clientReferencePath.exclude,
                  },
                  (err2, deps) => {
                    if (err2) return cb(err2);
                    err2 = deps.map((dep) => {
                      var request = path.join(
                        resolvedDirectory,
                        dep.userRequest,
                      );
                      request = new ClientReferenceDependency(request);
                      request.userRequest = dep.userRequest;
                      return request;
                    });
                    asyncLib.filter(
                      err2,
                      (clientRefDep, filterCb) => {
                        normalResolver.resolve(
                          {},
                          context,
                          clientRefDep.request,
                          {},
                          (err3, resolvedPath) => {
                            if (err3 || 'string' !== typeof resolvedPath)
                              return filterCb(null, !1);
                            fs.readFile(
                              resolvedPath,
                              'utf-8',
                              (err4, content) => {
                                if (err4 || 'string' !== typeof content)
                                  return filterCb(null, !1);
                                err4 = hasUseClientDirective(content);
                                filterCb(null, err4);
                              },
                            );
                          },
                        );
                      },
                      cb,
                    );
                  },
                );
              },
            );
      },
      (err, result) => {
        if (err) return callback(err);
        err = [];
        for (let i = 0; i < result.length; i++) err.push.apply(err, result[i]);
        callback(null, err);
      },
    );
  }
}

module.exports = ReactFlightWebpackPlugin;
