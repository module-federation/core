// CustomWebpackPlugin.ts
import type {
  Chunk,
  Compilation,
  Compiler,
  Module,
  RuntimeModule,
} from 'webpack';
import { ConcatSource } from 'webpack-sources';
// @ts-ignore
import JsonpChunkLoadingRuntimeModule from 'webpack/lib/web/JsonpChunkLoadingRuntimeModule';
import Template from '../../utils/Template';
import { DEFAULT_SHARE_SCOPE_BROWSER } from '../internal';
import { loadDependenciesTemplate } from './LoadDependenciesTemplate';

// @ts-ignore
export const setEagerLoading = (RuntimeGlobals) => {
  return Template.asString([
    'function setEagerLoading(libraryName, version, fromValue) {',
    Template.indent([
      'var library = ' +
        RuntimeGlobals.shareScopeMap +
        '.default[libraryName];',
      'var shareScopeMap = ' + RuntimeGlobals.shareScopeMap + '.default;',
      'var alternativeVersion = Object.keys(shareScopeMap[libraryName])[0];',
      'if(!library) return;',
      'var pickedVersion = library[version] || library[alternativeVersion];',
      'if ((pickedVersion && pickedVersion.from === fromValue) && preferredModules.includes(libraryName)) {',
      Template.indent([
        "console.log('setting eager', libraryName, pickedVersion, fromValue);",
        'pickedVersion.eager = true;',
      ]),
      '}',
    ]),
    '}',
  ]);
};

function asyncOperationTemplate(
  moduleArray: any[],
  //@ts-ignore
  RuntimeGlobals: any
): Template {
  return Template.asString([
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
    'var kickstart = asyncOperation();',
  ]);
}

function getCustomJsonpCode(
  appName: string,
  RuntimeGlobals: any,
  initialModules: Iterable<Module>
): string {
  const moduleMaps = [...initialModules]
    .map((module) => [
      // @ts-ignore
      module?.options?.shareKey,
      // @ts-ignore
      module?.options?.requiredVersion,
    ])
    .filter(([key], i, arr) => arr.findIndex(([k]) => k === key) === i);

  const moduleArray = moduleMaps.map(([key, version]) => {
    if (!Array.isArray(version)) return [key, undefined];
    const trueVersion = version.slice(1);
    return [key, trueVersion.join('.')];
  });

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
    setEagerLoading(RuntimeGlobals),
    // loadDependencies function
    loadDependenciesTemplate(RuntimeGlobals),
    // shouldDeferLoading function
    Template.asString([
      'function shouldDeferLoading(args) {',
      Template.indent([
        'var matchesOrStartsWith = args[0].some(function (item) {',
        Template.indent([
          'return resport.some(function (resportItem) {',
          Template.indent([
            "console.log('testing chunk to defer:',item === resportItem || item.indexOf(resportItem) === 0, item, resportItem);",
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
    asyncOperationTemplate(moduleArray, RuntimeGlobals),
    // chunkLoadingGlobal.push
    Template.asString([
      'chunkLoadingGlobal.push = (function (originalPush) {',
      Template.indent([
        'return function () {',
        "console.log('queue size:', chunkQueue.length);",
        Template.indent([
          'if (shouldDeferLoading(arguments[0])) {',
          Template.indent([
            "if (arguments[0][0].includes('main') || arguments[0][0].some(function (item) { return item.startsWith('pages/'); })) {",
            "console.log('pushing chunk to inverted boot queue', arguments[0][0]);",
            Template.indent([
              'resport = Array.prototype.concat.apply(resport, arguments[0][0]);',
              'return Array.prototype.push.apply(chunkQueue, arguments);',
            ]),
            '}',
          ]),
          '}',
          'if(chunkQueue.length === 0) {',
          "console.log('chunk queue is empty, pushing as normal', arguments[0][0]);",
          Template.indent([
            'webpackJsonpCallback.apply(',
            Template.indent([
              'null,',
              '[null].concat(Array.prototype.slice.call(arguments))',
            ]),
            ');',
            'return originalPush.apply(chunkLoadingGlobal, arguments);',
          ]),
          '}',
          // Template.indent([
          //   "console.log('current push args', arguments[0][0]);",
          //   "console.log('whole queue', chunkQueue);",
          //   "console.log('report queue', resport);",
          // ]),
          "console.log('pushing chunk into webpack runtime:', arguments[0][0]);",
          'webpackJsonpCallback.apply(',
          Template.indent([
            'null,',
            '[null].concat(Array.prototype.slice.call(arguments))',
          ]),
          ');',
          'return originalPush.apply(chunkLoadingGlobal, arguments);',
        ]),
        '};',
      ]),
      '})(chunkLoadingGlobal.push.bind(chunkLoadingGlobal));',
    ]),
  ];

  return Template.asString(code);
}

function buildOutputString(dependencies: Record<string, any>): string[] {
  const output: string[] = [];
  for (const [key, version] of Object.entries(dependencies)) {
    output.push(
      `__webpack_require__.S.default[${JSON.stringify(key)}][${JSON.stringify(
        version
      )}]`
    );
  }
  return output;
}

class CustomWebpackPlugin {
  private initialModules: Set<any>;
  private initialModulesFound: Set<any>;

  constructor() {
    this.initialModules = new Set();
    this.initialModulesFound = new Set();
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'CustomWebpackPlugin',
      (compilation: Compilation) => {
        const addModules = (modules: Iterable<Module>, chunk: Chunk): void => {
          for (const module of modules) {
            // const id =
            //   compilation.chunkGraph.getModuleId(module) ||
            //   module.id ||
            //   module.debugId;
            this.initialModules.add(module);
            // @ts-ignore
            this.initialModulesFound.add(module?.options?.shareKey);
          }
        };

        compilation.hooks.optimizeChunks.tap(
          'AddModulesToRuntimeChunkPlugin',
          (chunks) => {
            for (const entrypointModule of compilation.entrypoints.values()) {
              const entrypoint = entrypointModule.getEntrypointChunk();
              if (entrypoint.name === compiler.options.output.uniqueName)
                continue;

              const processChunks = (
                chunks: Set<Chunk>,
                callback: (modules: Iterable<Module>, chunk: any) => void
              ): void => {
                for (const chunk of chunks) {
                  const modules =
                    compilation.chunkGraph.getChunkModulesIterableBySourceType(
                      chunk,
                      'consume-shared'
                    );
                  if (modules) callback(modules, chunk);
                }
              };

              processChunks(entrypoint.getAllInitialChunks(), addModules);
              processChunks(
                entrypoint.getAllAsyncChunks(),
                (modules, chunk) => {
                  for (const m of modules) {
                    if (
                      // @ts-ignore
                      m?.options &&
                      // @ts-ignore
                      !this.initialModulesFound.has(m?.options?.shareKey) &&
                      // @ts-ignore
                      m?.options?.shareKey === 'next/router'
                    ) {
                      addModules([m], chunk);
                      // @ts-ignore
                      this.initialModulesFound.add(m?.options?.shareKey);
                    }
                  }
                }
              );
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
              const originalSource = runtimeModule.getGeneratedCode();
              // @ts-ignore
              const modifiedSource = new ConcatSource(
                originalSource,
                '\n',
                '// Custom code here\n',
                getCustomJsonpCode(
                  //@ts-ignore
                  compiler.options.output.uniqueName,
                  compiler.webpack.RuntimeGlobals,
                  // @ts-ignore
                  this.initialModules
                )
              );
              runtimeModule.getGeneratedCode = () => modifiedSource.source();
              console.log('adding updated runtime source');
            }
          }
        );
      }
    );
  }
}

export default CustomWebpackPlugin;
