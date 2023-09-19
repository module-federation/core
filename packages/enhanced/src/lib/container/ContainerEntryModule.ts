/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

'use strict';
import { AsyncDependenciesBlock } from '../../declarations/plugins/container/AsyncDependenciesBlock';
import { OriginalSource, RawSource } from 'webpack-sources';
import ContainerExposedDependency from './ContainerExposedDependency';
import { RuntimeGlobals } from 'webpack';
import StaticExportsDependency from '../../declarations/plugins/container/StaticExportsDependency';
import { ObjectDeserializerContext } from '../../declarations/plugins/container/ObjectDeserializerContext';
import { WebpackOptions } from '../../declarations/plugins/container/WebpackOptions';
import Template from '../../declarations/plugins/container/Template';
import {
  Dependency,
  ObjectSerializerContext,
} from '../../declarations/plugins/container/Dependency';

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
  /**
   * @param {string} name container entry name
   * @param {[string, ExposeOptions][]} exposes list of exposed modules
   * @param {string} shareScope name of the share scope
   */
  constructor(
    name: string,
    exposes: [string, ExposeOptions][],
    shareScope: string,
  ) {
    super(JAVASCRIPT_MODULE_TYPE_DYNAMIC, null);
    this._name = name;
    this._exposes = exposes;
    this._shareScope = shareScope;
  }
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ContainerEntryModule} deserialized container entry module
   */
  static deserialize(context: ObjectDeserializerContext): ContainerEntryModule {
    const { read } = context;
    const obj = new ContainerEntryModule(read(), read(), read());
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
    context: any | NeedBuildContext,
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

        block.addDependency(dep);
      }
      this.addBlock(block);
    }
    this.addDependency(
      new StaticExportsDependency(
        ['get', 'init'],
        false,
      ) as unknown as Dependency,
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

    for (const block of this.blocks) {
      const { dependencies } = block;

      const modules = dependencies.map((dependency) => {
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
        `var name = ${JSON.stringify(this._shareScope)}`,
        `var oldScope = ${RuntimeGlobals.shareScopeMap}[name];`,
        `if(oldScope && oldScope !== shareScope) throw new Error("Container initialization failed as it has already been initialized with a different share scope");`,
        `${RuntimeGlobals.shareScopeMap}[name] = shareScope;`,
        `return ${RuntimeGlobals.initializeSharing}(name, initScope);`,
      ])};`,
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
  override serialize(context: ObjectSerializerContext): void {
    const { write } = context;
    write(this._name);
    write(this._exposes);
    write(this._shareScope);
    super.serialize(context);
  }
}

makeSerializable(
  ContainerEntryModule,
  'webpack/lib/container/ContainerEntryModule',
);

export default ContainerEntryModule;
