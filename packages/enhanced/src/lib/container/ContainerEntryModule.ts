/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

'use strict';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Dependency, Compilation } from 'webpack';
import ContainerExposedDependency from './ContainerExposedDependency';
import type {
  LibIdentOptions,
  NeedBuildContext,
  RequestShortener,
  ObjectDeserializerContext,
  ObjectSerializerContext,
  WebpackOptions,
  InputFileSystem,
  ResolverWithOptions,
} from 'webpack/lib/Module';
import type WebpackError from 'webpack/lib/WebpackError';
import { getFederationGlobalScope } from './runtime/utils';
import { JAVASCRIPT_MODULE_TYPE_DYNAMIC } from '../Constants';

const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
) as typeof import('webpack/lib/util/makeSerializable');
const { sources: webpackSources } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const { AsyncDependenciesBlock, Template, Module, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const StaticExportsDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/StaticExportsDependency'),
) as typeof import('webpack/lib/dependencies/StaticExportsDependency');
const EntryDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/EntryDependency'),
) as typeof import('webpack/lib/dependencies/EntryDependency');

const SOURCE_TYPES = new Set(['javascript']);

export type ExposeOptions = {
  /**
   * requests to exposed modules (last one is exported)
   */
  import: string[];
  /**
   * custom chunk name for the exposed module
   */
  name: string;
};

class ContainerEntryModule extends Module {
  private _name: string;
  private _exposes: [string, ExposeOptions][];
  private _shareScope: string;
  private _injectRuntimeEntry: string;
  /**
   * @param {string} name container entry name
   * @param {[string, ExposeOptions][]} exposes list of exposed modules
   * @param {string} shareScope name of the share scope
   */
  constructor(
    name: string,
    exposes: [string, ExposeOptions][],
    shareScope: string,
    injectRuntimeEntry: string,
  ) {
    super(JAVASCRIPT_MODULE_TYPE_DYNAMIC, null);
    this._name = name;
    this._exposes = exposes;
    this._shareScope = shareScope;
    this._injectRuntimeEntry = injectRuntimeEntry;
  }
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ContainerEntryModule} deserialized container entry module
   */
  static deserialize(context: ObjectDeserializerContext): ContainerEntryModule {
    const { read } = context;
    const obj = new ContainerEntryModule(read(), read(), read(), read());
    //@ts-ignore
    obj.deserialize(context);
    return obj;
  }

  /**
   * @returns {Set<string>} types available (do not mutate)
   */
  override getSourceTypes(): Set<string> {
    return SOURCE_TYPES;
  }
  /**
   * @returns {string} a unique identifier of the module
   */
  override identifier(): string {
    return `container entry (${this._shareScope}) ${JSON.stringify(
      this._exposes,
    )}`;
  }
  /**
   * @param {RequestShortener} requestShortener the request shortener
   * @returns {string} a user readable identifier of the module
   */
  override readableIdentifier(requestShortener: RequestShortener): string {
    return 'container entry';
  }
  /**
   * @param {LibIdentOptions} options options
   * @returns {string | null} an identifier for library inclusion
   */
  override libIdent(options: LibIdentOptions): string | null {
    return `${this.layer ? `(${this.layer})/` : ''}webpack/container/entry/${
      this._name
    }`;
  }
  /**
   * @param {NeedBuildContext} context context info
   * @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
   * @returns {void}
   */
  // @ts-ignore typeof webpack/lib !== typeof webpack/types
  override needBuild(
    context: NeedBuildContext,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: boolean | undefined,
    ) => void,
  ): void {
    const baseContext = context as NeedBuildContext;
    callback(null, !this.buildMeta);
  }
  /**
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {ResolverWithOptions} resolver the resolver
   * @param {InputFileSystem} fs the file system
   * @param {function(WebpackError): void} callback callback function
   * @returns {void}
   */
  // @ts-ignore typeof webpack/lib !== typeof webpack/types
  override build(
    options: WebpackOptions,
    compilation: Compilation,
    resolver: ResolverWithOptions,
    fs: InputFileSystem,
    callback: (err?: WebpackError) => void,
  ): void {
    this.buildMeta = {};
    this.buildInfo = {
      strict: true,
      topLevelDeclarations: new Set(['moduleMap', 'get', 'init']),
    };
    this.buildMeta.exportsType = 'namespace';
    //@ts-ignore
    this.clearDependenciesAndBlocks();

    for (const [name, options] of this._exposes) {
      const block = new AsyncDependenciesBlock(
        {
          name: options.name,
        },
        { name },
        options.import[options.import.length - 1],
      );
      let idx = 0;
      for (const request of options.import) {
        const dep = new ContainerExposedDependency(name, request);
        dep.loc = {
          name,
          index: idx++,
        };
        //@ts-ignore
        block.addDependency(dep);
      }
      //@ts-ignore
      this.addBlock(block);
    }
    //@ts-ignore
    this.addDependency(
      //@ts-ignore
      new StaticExportsDependency(
        ['get', 'init'],
        false,
      ) as unknown as Dependency,
    );

    // this.addDependency(
    //   // @ts-ignore
    //   new EntryDependency(this._injectRuntimeEntry),
    // );
    callback();
  }

  /**
   * @param {CodeGenerationContext} context context for code generation
   * @returns {CodeGenerationResult} result
   */
  //@ts-ignore
  override codeGeneration({ moduleGraph, chunkGraph, runtimeTemplate }) {
    const sources = new Map();
    const runtimeRequirements = new Set([
      RuntimeGlobals.definePropertyGetters,
      RuntimeGlobals.hasOwnProperty,
      RuntimeGlobals.exports,
    ]);
    const getters = [];
    for (const block of this.blocks) {
      const { dependencies } = block;

      const modules = dependencies.map((dependency: Dependency) => {
        const dep = dependency as unknown as ContainerExposedDependency;
        return {
          name: dep.exposedName,
          module: moduleGraph.getModule(dep),
          request: dep.userRequest,
        };
      });

      let str;
      if (modules.some((m) => !m.module)) {
        str = runtimeTemplate.throwMissingModuleErrorBlock({
          request: modules.map((m) => m.request).join(', '),
        });
      } else {
        str = `return ${runtimeTemplate.blockPromise({
          block,
          message: '',
          chunkGraph,
          runtimeRequirements,
        })}.then(${runtimeTemplate.returningFunction(
          runtimeTemplate.returningFunction(
            `(${modules
              //@ts-ignore
              .map(({ module, request }) =>
                runtimeTemplate.moduleRaw({
                  module,
                  chunkGraph,
                  request,
                  weak: false,
                  runtimeRequirements,
                }),
              )
              .join(', ')})`,
          ),
        )});`;
      }

      getters.push(
        `${JSON.stringify(modules[0].name)}: ${runtimeTemplate.basicFunction(
          '',
          str,
        )}`,
      );
    }

    const initRuntimeDep = this.dependencies[1];
    // const initRuntimeModuleGetter = runtimeTemplate.moduleRaw({
    //   module: moduleGraph.getModule(initRuntimeDep),
    //   chunkGraph,
    //   // @ts-expect-error
    //   request: initRuntimeDep.userRequest,
    //   weak: false,
    //   runtimeRequirements,
    // });
    const federationGlobal = getFederationGlobalScope(
      RuntimeGlobals || ({} as typeof RuntimeGlobals),
    );

    const source = Template.asString([
      `var moduleMap = {`,
      Template.indent(getters.join(',\n')),
      '};',
      `var get = ${runtimeTemplate.basicFunction('module, getScope', [
        `${RuntimeGlobals.currentRemoteGetScope} = getScope;`,
        // reusing the getScope variable to avoid creating a new var (and module is also used later)
        'getScope = (',
        Template.indent([
          `${RuntimeGlobals.hasOwnProperty}(moduleMap, module)`,
          Template.indent([
            '? moduleMap[module]()',
            `: Promise.resolve().then(${runtimeTemplate.basicFunction(
              '',
              "throw new Error('Module \"' + module + '\" does not exist in container.');",
            )})`,
          ]),
        ]),
        ');',
        `${RuntimeGlobals.currentRemoteGetScope} = undefined;`,
        'return getScope;',
      ])};`,
      `var init = ${runtimeTemplate.basicFunction(
        'shareScope, initScope, remoteEntryInitOptions',
        [
          `return ${federationGlobal}.bundlerRuntime.initContainerEntry({${Template.indent(
            [
              `webpackRequire: ${RuntimeGlobals.require},`,
              `shareScope: shareScope,`,
              `initScope: initScope,`,
              `remoteEntryInitOptions: remoteEntryInitOptions,`,
              `shareScopeKey: ${JSON.stringify(this._shareScope)}`,
            ],
          )}`,
          '})',
        ],
      )};`,
      // `${initRuntimeModuleGetter}`,
      '',
      '// This exports getters to disallow modifications',
      `${RuntimeGlobals.definePropertyGetters}(exports, {`,
      Template.indent([
        `get: ${runtimeTemplate.returningFunction('get')},`,
        `init: ${runtimeTemplate.returningFunction('init')}`,
      ]),
      '});',
    ]);

    sources.set(
      'javascript',
      this.useSourceMap || this.useSimpleSourceMap
        ? new webpackSources.OriginalSource(source, 'webpack/container-entry')
        : new webpackSources.RawSource(source),
    );

    return {
      sources,
      runtimeRequirements,
    };
  }

  /**
   * @param {string=} type the source type for which the size should be estimated
   * @returns {number} the estimated size of the module (must be non-zero)
   */
  override size(type?: string): number {
    return 42;
  }
  /**
   * @param {ObjectSerializerContext} context context
   */
  override serialize(context: ObjectSerializerContext): void {
    const { write } = context;
    write(this._name);
    write(this._exposes);
    write(this._shareScope);
    write(this._injectRuntimeEntry);
    super.serialize(context);
  }
}
makeSerializable(
  ContainerEntryModule,
  'enhanced/lib/container/ContainerEntryModule',
);

export default ContainerEntryModule;
