/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

'use strict';
import AsyncDependenciesBlock from 'webpack/lib/AsyncDependenciesBlock';
import Dependency from 'webpack/lib/Dependency';
import Template from 'webpack/lib/Template';
import Module from 'webpack/lib/Module';
import * as RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import { OriginalSource, RawSource } from 'webpack-sources';
import { JAVASCRIPT_MODULE_TYPE_DYNAMIC } from 'webpack/lib/ModuleTypeConstants';
import ContainerExposedDependency from './ContainerExposedDependency';
import StaticExportsDependency from 'webpack/lib/dependencies/StaticExportsDependency';
import type Compilation from 'webpack/lib/Compilation';
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
import makeSerializable from 'webpack/lib/util/makeSerializable';
import FederationRuntimePlugin from './runtime/FederationRuntimePlugin';
import { getFederationGlobalScope } from './runtime/utils';
import EntryDependency from 'webpack/lib/dependencies/EntryDependency';

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
  private _runtimePlugins: string[];
  /**
   * @param {string} name container entry name
   * @param {[string, ExposeOptions][]} exposes list of exposed modules
   * @param {string} shareScope name of the share scope
   */
  constructor(
    name: string,
    exposes: [string, ExposeOptions][],
    shareScope: string,
    runtimePlugins: string[],
  ) {
    super(JAVASCRIPT_MODULE_TYPE_DYNAMIC, null);
    this._name = name;
    this._exposes = exposes;
    this._shareScope = shareScope;
    this._runtimePlugins = runtimePlugins;
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

    this.addDependency(
      new EntryDependency(
        FederationRuntimePlugin.getFilePath(this._name, this._runtimePlugins),
      ),
    );

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
    //@ts-ignore
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
      //@ts-ignore
      if (modules.some((m) => !m.module)) {
        str = runtimeTemplate.throwMissingModuleErrorBlock({
          //@ts-ignore
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
    const initRuntimeModuleGetter = runtimeTemplate.moduleRaw({
      module: moduleGraph.getModule(initRuntimeDep),
      chunkGraph,
      // @ts-expect-error
      request: initRuntimeDep.userRequest,
      weak: false,
      runtimeRequirements,
    });
    const federationGlobal = getFederationGlobalScope(RuntimeGlobals || {});

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
      `var init = ${runtimeTemplate.basicFunction('shareScope, initScope', [
        `if (!${RuntimeGlobals.shareScopeMap}) return;`,
        `if (!${federationGlobal}) return;`,
        `var name = ${JSON.stringify(this._shareScope)}`,
        `${federationGlobal}.instance.initOptions({name:${federationGlobal}.initOptions.name, })`,
        `${federationGlobal}.instance.initShareScopeMap(name,shareScope)`,
      `if (${RuntimeGlobals.global}.__FEDERATION__.__SHARE__.default){`,
      Template.indent([
        `${federationGlobal}.instance.initShareScopeMap(name,${RuntimeGlobals.global}.__FEDERATION__.__SHARE__.default)`,
      ]),
      '}',
      `${federationGlobal}.proxyShareScopeMap(${RuntimeGlobals.require});`,
        `return ${RuntimeGlobals.initializeSharing}(name, initScope);`,
      ])};`,
      `${initRuntimeModuleGetter}`,
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
        ? new OriginalSource(source, 'webpack/container-entry')
        : new RawSource(source),
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
  //@ts-ignore
  override serialize(context: ObjectSerializerContext): void {
    const { write } = context;
    write(this._name);
    write(this._exposes);
    write(this._shareScope);
    write(this._runtimePlugins);
    //@ts-ignore
    super.serialize(context);
  }
}
//@ts-ignore
makeSerializable(
  ContainerEntryModule,
  'enhanced/lib/container/ContainerEntryModule',
);

export default ContainerEntryModule;
