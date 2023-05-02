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
    'var asyncInFlight = false;',
    'function asyncOperation(originalPush) {',
    Template.indent([
      'if(asyncInFlight) return asyncInFlight;',
      '// This is just an example; replace it with your own logic.',
      'asyncInFlight =  new Promise(function (resolve) {',
      Template.indent([
        `var prom = ${RuntimeGlobals.initializeSharing}('default', []);`,
        `initialConsumes.forEach(function (lib) {`,
        Template.indent(['setEagerLoading(lib[0], lib[1], cnn);']),
        '});',
        'resolve(prom);',
      ]),
      '})',
      '.then(function () {',
      Template.indent([
        "console.log('init operation completed');",
        `console.log(${RuntimeGlobals.shareScopeMap}.default);`,
        `loadDependencies(initialConsumes, cnn);`,
        'return Promise.all(asyncQueue);',
      ]),
      '})',
      '.then(function () {',
      Template.indent([
        "console.log('webpack is done negotiating dependency trees', cnn);",
        "console.log('number of entry points to invert startup', chunkQueue.length);",
        "console.log('startup inversion in progress', chunkQueue);",
        'asyncInFlight = false;',
        'while (chunkQueue.length > 0) {',
        // 'originalPush.apply(chunkLoadingGlobal, arguments);',
        'const queueArgs = chunkQueue.shift();',
        "console.log('pushing deffered chunk into runtime', queueArgs[0]);",
        'webpackJsonpCallback.apply(',
        Template.indent([
          'null,',
          '[null].concat(Array.prototype.slice.call([queueArgs]))',
        ]),
        ');',
        Template.indent(['originalPush.apply(originalPush,[queueArgs]);']),
        '}',
      ]),
      '});',
    ]),
    'return asyncInFlight;',
    '}',
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
        'if(resport.length === 0) return true;',
        'if(resport.length !== 0 && chunkQueue.length === 0) return false;',
        'var matchesOrStartsWith = args[0].some(function (item) {',
        Template.indent([
          'return resport.some(function (resportItem) {',
          Template.indent([
            'return item === resportItem || item.indexOf(resportItem) === 0;',
          ]),
          '});',
        ]),
        '});',
        "console.log('shouldDeferLoading', !matchesOrStartsWith, args[0], resport);",
        'return !matchesOrStartsWith;',
      ]),
      '}',
    ]),
    // asyncOperation function
    asyncOperationTemplate(moduleArray, RuntimeGlobals),
    // chunkLoadingGlobal.push
    Template.asString([
      'asyncOperation(chunkLoadingGlobal.push.bind(chunkLoadingGlobal));',
      'chunkLoadingGlobal.push = (function (originalPush) {',
      Template.indent([
        'return function () {',
        `if (!__webpack_require__.S.default) {
          console.log(
            '%cshare is blank: %s',
            'color: red; font-size: 20px;',
           !__webpack_require__.S.default
          );
        }`,
        "console.log('chunk was pushed', arguments[0][0]);",
        "if (arguments[0][0].includes('main') || arguments[0][0].some(function (item) { return item.startsWith('pages/'); })) {",
        'resport = Array.prototype.concat.apply(resport, arguments[0][0]);',
        'var pushEvent =  Array.prototype.push.apply(chunkQueue, arguments);',
        'return asyncOperation(originalPush);',
        '}',
        'if(!__webpack_require__.S.default) {asyncOperation(originalPush);}',
        "console.log('queue size:', chunkQueue.length);",
        "console.log('pushing chunk into webpack runtime:', arguments[0][0]);",
        'webpackJsonpCallback.apply(',
        Template.indent([
          'null,',
          '[null].concat(Array.prototype.slice.call(arguments))',
        ]),
        ');',
        'return originalPush.apply(chunkLoadingGlobal, arguments);',
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
