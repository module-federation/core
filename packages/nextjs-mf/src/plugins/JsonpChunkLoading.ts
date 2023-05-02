// CustomWebpackPlugin.ts

import type { Compiler, Compilation, RuntimeModule, Module } from 'webpack';
import { ConcatSource } from 'webpack-sources';
// @ts-ignore
import JsonpChunkLoadingRuntimeModule from 'webpack/lib/web/JsonpChunkLoadingRuntimeModule';
import Template from '../../utils/Template';
import { DEFAULT_SHARE_SCOPE_BROWSER } from '../internal';

//@ts-ignore
function buildOutputString(dependencies) {
  //@ts-ignore
  let output = [];
  for (const key in dependencies) {
    //@ts-ignore
    if (dependencies.hasOwnProperty(key)) {
      const version = dependencies[key];
      output.push(
        `__webpack_require__.S.default[${JSON.stringify(key)}][${JSON.stringify(
          version
        )}]`
      );
    }
  }
  return output;
}
function getCustomJsonpCode(
  appName: string,
  //@ts-ignore
  RuntimeGlobals,
  initialModules: Module[]
): string {
  const loadedModules = new Set();
  const moduleMaps = [];
  for (const module of initialModules) {
    //@ts-ignore
    if (loadedModules.has(module?.options?.shareKey)) continue;
    // @ts-ignore
    loadedModules.add(module?.options?.shareKey);
    moduleMaps.push([
      // @ts-ignore
      module?.options?.shareKey,
      // @ts-ignore
      module?.options?.requiredVersion,
    ]);
  }
  console.log('moduleMaps', moduleMaps);
  const moduleArray = moduleMaps.reduce((acc, [key, version]) => {
    // @ts-ignore
    if (!acc[key] && Array.isArray(version)) {
      const trueVersion = version.slice(1);
      acc.push([key, trueVersion.join('.')]);
    } else {
      acc.push([key, undefined]);
    }
    return acc;
  }, []);

  const initalConsumes = buildOutputString(moduleArray);
  // console.log('moduleArray', moduleArray);

  const code = [
    'var chunkQueue = [];',
    'var resport = [];',
    `var cnn = ${JSON.stringify(appName)};`,
    "var chunkLoadingGlobal = self['webpackChunk' + cnn] || [];",
    `var preferredModules = ${JSON.stringify(
      Object.keys(DEFAULT_SHARE_SCOPE_BROWSER)
    )};`,
    'var asyncQueue = [];',
    // setEagerLoading function
    Template.asString([
      'function setEagerLoading(libraryName, version, fromValue) {',
      Template.indent([
        `var library = ${RuntimeGlobals.shareScopeMap}.default[libraryName];`,
        `var shareScopeMap = ${RuntimeGlobals.shareScopeMap}.default;`,
        'var alternativeVersion = Object.keys(shareScopeMap[libraryName])[0];',
        `if(!library) return;`,
        'var pickedVersion = library[version] || library[alternativeVersion]',
        'if ((pickedVersion && pickedVersion.from === fromValue) && preferredModules.includes(libraryName)) {',
        Template.indent([
          "console.log('setting eager', libraryName, pickedVersion, fromValue);",
          'pickedVersion.eager = true;',
        ]),
        '}',
      ]),
      '}',
    ]),
    // loadDependencies function
    Template.asString([
      'function loadDependencies(libKeys, cnn) {',
      'console.log("loadDependencies", libKeys, cnn);',
      Template.indent([
        'libKeys.map(function (libKey) {',
        Template.indent([
          // Extract the share key and share version from the libKey array.
          'var shareKey = libKey[0];',
          'var shareVersion = libKey[1];',

          // Get the default share scope map.
          `var shareScopeMap = ${RuntimeGlobals.shareScopeMap}.default;`,

          // Determine the alternative version of the shared module.
          'var alternativeVersion = Object.keys(shareScopeMap[shareKey])[0];',

          // Get the shared module based on the preferred version or the alternative version.
          'var lib = (preferredModules.includes(shareKey) && shareScopeMap[shareKey][shareVersion]) ? shareScopeMap[shareKey][shareVersion] : shareScopeMap[shareKey][alternativeVersion];',

          Template.indent([
            'if (!lib.loaded) {',
            Template.indent([
              'lib.loaded = 1;',
              "console.log('loading', shareKey, shareVersion);",
              'asyncQueue.push(lib.get().then(function (f) {',
              Template.indent([
                "console.log('loaded', shareKey, shareVersion);",
                'lib.get = function () { return f; };',
                'lib.loaded = 1;',
              ]),
              '}));',
            ]),
            '}',
          ]),
        ]),
        '});',
      ]),
      '}',
    ]),
    // shouldDeferLoading function
    Template.asString([
      'function shouldDeferLoading(args) {',
      Template.indent([
        'var matchesOrStartsWith = args[0].some(function (item) {',
        Template.indent([
          'return resport.some(function (resportItem) {',
          Template.indent([
            "console.log('item to test', item);",
            'return item === resportItem || item.indexOf(resportItem) === 0;',
          ]),
          '});',
        ]),
        '});',
        'return !matchesOrStartsWith;',
      ]),
      '}',
    ]),
    // asyncOperation function
    Template.asString([
      `var initialConsumes = ${JSON.stringify(moduleArray)}`,
      'function asyncOperation() {',
      Template.indent([
        '// This is just an example; replace it with your own logic.',
        'return new Promise(function (resolve) {',
        Template.indent([
          "console.log('init operation completed');",
          `var prom = ${RuntimeGlobals.initializeSharing}('default', []);`,
          `initialConsumes.forEach(function (lib) {`,
          Template.indent(['setEagerLoading(lib[0], lib[1], cnn);']),
          '});',
          'resolve(prom);',
        ]),
        '})',
        '.then(function () {',
        Template.indent([
          `console.log(${RuntimeGlobals.shareScopeMap}.default);`,
          `var libKeys = Object.keys(${RuntimeGlobals.shareScopeMap}.default)`,
          'var reactAndNextLibKeys = libKeys.filter(function (libKey) {',
          Template.indent([
            "return libKey.startsWith('react') || libKey.startsWith('next');",
          ]),
          '});',
          'var otherLibKeys = libKeys.filter(function (libKey) {',
          Template.indent([
            "return !libKey.startsWith('react') && !libKey.startsWith('next');",
          ]),
          '});',
          `loadDependencies(initialConsumes, cnn);`,
          'return Promise.all(asyncQueue);',
        ]),
        '})',
        '.then(function () {',
        Template.indent([
          "console.log('webpack is done negotiating dependency trees', cnn);",
          "console.log('number of entry points to invert startup', chunkQueue.length);",
          "console.log('startup inversion in progress', chunkQueue);",
          'while (chunkQueue.length > 0) {',
          Template.indent(['chunkLoadingGlobal.push(chunkQueue.shift());']),
          '}',
        ]),
        '});',
      ]),
      '}',
    ]),
    'var kickstart = asyncOperation();',
    // chunkLoadingGlobal.push
    Template.asString([
      'chunkLoadingGlobal.push = (function (originalPush) {',
      Template.indent([
        'return function () {',
        Template.indent([
          "console.log('push catcher called push:', arguments[0][0]);",
          'if (shouldDeferLoading(arguments[0])) {',
          Template.indent([
            "if (arguments[0][0].includes('main') || arguments[0][0].some(function (item) { return item.startsWith('pages/'); })) {",
            Template.indent([
              "console.log('thinks its main or starts with pages/');",
              'resport = Array.prototype.concat.apply(resport, arguments[0][0]);',
              'return Array.prototype.push.apply(chunkQueue, arguments);',
            ]),
            '}',
          ]),
          '}',
          "if (cnn === 'home_app') {",
          Template.indent([
            "console.log('arguments', arguments[0][0]);",
            "console.log('whole queue', chunkQueue);",
            "console.log('report queue', resport);",
          ]),
          '}',
          'webpackJsonpCallback.apply(',
          Template.indent([
            'null,',
            '[null].concat(Array.prototype.slice.call(arguments))',
          ]),
          ');',
          "console.log('else push call:', arguments[0][0]);",
          'return originalPush.apply(chunkLoadingGlobal, arguments);',
        ]),
        '};',
      ]),
      '})(chunkLoadingGlobal.push.bind(chunkLoadingGlobal));',
    ]),
  ];

  return Template.asString(code);
}

class CustomWebpackPlugin {
  private _initialModules: Set<any>;
  private _initialModulesFound: any;
  constructor() {
    this._initialModules = new Set();
    this._initialModulesFound = new Set();
  }
  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'CustomWebpackPlugin',
      (compilation: Compilation) => {
        const addModules = (modules: any[], chunk: any): void => {
          for (const m of modules) {
            const module = m;
            const id =
              compilation.chunkGraph.getModuleId(module) ||
              module.id ||
              module.debugId;
            this._initialModules.add(module);
            this._initialModulesFound.add(module.options.shareKey);
          }
        };

        compilation.hooks.optimizeChunks.tap(
          'AddModulesToRuntimeChunkPlugin',
          (chunks) => {
            for (const entrypointModule of compilation.entrypoints.values()) {
              const entrypoint = entrypointModule.getEntrypointChunk();
              if (entrypoint.name === compiler.options.output.uniqueName)
                continue;

              for (const chunk of entrypoint.getAllInitialChunks()) {
                console.log(chunk.name, this._initialModulesFound);
                const modules =
                  compilation.chunkGraph.getChunkModulesIterableBySourceType(
                    chunk,
                    'consume-shared'
                  );
                if (!modules) continue;
                // @ts-ignore
                addModules(modules, chunk);
              }
              for (const chunk of entrypoint.getAllAsyncChunks()) {
                const modules =
                  compilation.chunkGraph.getChunkModulesIterableBySourceType(
                    chunk,
                    'consume-shared'
                  );
                if (!modules) continue;
                // @ts-ignore
                modules.forEach((m) => {
                  if (
                    m.options &&
                    !this._initialModulesFound.has(m.options.shareKey)
                  ) {
                    if (m.options.shareKey === 'next/router') {
                      // only add specific modules with side effects for next
                      // these are not eager modules, they have a import boundary.
                      // but i need them to always negoticate and come from host
                      addModules([m], chunk);
                      this._initialModulesFound.add(m.options.shareKey);
                    }
                  }
                });
                //@ts-ignore
                // addModules(modules, chunk);
              }
            }
          }
        );

        compilation.hooks.runtimeModule.tap(
          'CustomWebpackPlugin',
          (runtimeModule: RuntimeModule, chunk: any) => {
            if (
              runtimeModule.constructor.name ===
                'JsonpChunkLoadingRuntimeModule' &&
              chunk.name === 'webpack'
            ) {
              const jsonpRuntimeModule = runtimeModule as unknown as any;
              if (jsonpRuntimeModule) {
                const originalSource = jsonpRuntimeModule.getGeneratedCode();
                const modifiedSource = new ConcatSource(
                  originalSource,
                  '\n',
                  '// Custom code here\n',
                  getCustomJsonpCode(
                    //@ts-ignore
                    compiler.options.output.uniqueName,
                    compiler.webpack.RuntimeGlobals,
                    this._initialModules
                  )
                );
                runtimeModule.getGeneratedCode = () => modifiedSource.source();
                console.log('adding updated runtime source');
              }
            }
          }
        );
      }
    );
  }
}

export default CustomWebpackPlugin;
