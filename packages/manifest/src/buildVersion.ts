import type { Compiler } from 'webpack';
import {
  composeKeyWithSeparator,
  type moduleFederationPlugin,
} from '@module-federation/sdk';

type BuildVersion = NonNullable<
  moduleFederationPlugin.ModuleFederationPluginOptions['experiments']
>['buildVersion'];
const versions = new WeakMap<object, string>();

/** Freeze the framework's version before building modules, not while emitting assets. */
export function getCompilationBuildVersion(
  compilation: object,
  source: BuildVersion,
): string | undefined {
  if (source === undefined) return undefined;
  let version = versions.get(compilation);
  if (version === undefined) {
    version = typeof source === 'function' ? source() : source;
    if (typeof version !== 'string' || !version.length) {
      throw new Error(
        '[Module Federation] experiments.buildVersion must resolve to a non-empty string.',
      );
    }
    versions.set(compilation, version);
  }
  return version;
}

/** The runtime module changes each watch build without invalidating cached application modules. */
export class BuildVersionPlugin {
  constructor(
    private readonly name: string,
    private readonly source: BuildVersion,
  ) {}

  apply(compiler: Compiler): void {
    const { RuntimeModule, RuntimeGlobals, DefinePlugin } = compiler.webpack;
    const identifier = `${RuntimeGlobals.require}.federationBuildIdentifier`;
    new DefinePlugin({ FEDERATION_BUILD_IDENTIFIER: identifier }).apply(
      compiler,
    );
    compiler.hooks.thisCompilation.tap(
      'FederationBuildVersion',
      (compilation) => {
        const version = getCompilationBuildVersion(compilation, this.source)!;
        const value = composeKeyWithSeparator(this.name, version);
        class BuildVersionRuntimeModule extends RuntimeModule {
          constructor() {
            super(
              'federation build identifier',
              RuntimeModule.STAGE_NORMAL - 1,
            );
          }
          override generate() {
            return `${identifier} = ${JSON.stringify(value)};`;
          }
        }
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'FederationBuildVersion',
          (chunk, requirements) => {
            requirements.add(RuntimeGlobals.requireScope);
            compilation.addRuntimeModule(
              chunk,
              new BuildVersionRuntimeModule(),
            );
          },
        );
      },
    );
  }
}
