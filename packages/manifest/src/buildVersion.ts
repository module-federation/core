import type { Compilation, Compiler } from 'webpack';
import { utils } from '@module-federation/managers';
import { composeKeyWithSeparator } from '@module-federation/sdk';

let version = 0;
const versions = new WeakMap<object, string>();

/** Frameworks assign a shared build identity before federation compilation hooks run. */
export function setCompilationBuildVersion(
  compilation: object,
  buildVersion: string,
): void {
  const previous = versions.get(compilation);
  if (previous && previous !== buildVersion) {
    throw new Error(
      'A compilation build version cannot change after assignment.',
    );
  }
  versions.set(compilation, buildVersion);
}

/** One identity per compilation, shared by the container and its manifest. */
export function getCompilationBuildVersion(compilation: Compilation): string {
  let value = versions.get(compilation);
  if (!value) {
    value =
      compilation.options.mode === 'development'
        ? String((version = Math.max(Date.now(), version + 1)))
        : utils.getBuildVersion(compilation.compiler.context);
    versions.set(compilation, value);
  }
  return value;
}

/** Runtime data changes on watch rebuilds even when module parsing is cached. */
export function getFederationBuildIdentifier(
  compiler: Compiler,
  name: string,
): string {
  if (compiler.options.mode !== 'development') {
    return JSON.stringify(
      composeKeyWithSeparator(name, utils.getBuildVersion(compiler.context)),
    );
  }
  const { RuntimeModule } = compiler.webpack;
  class BuildVersionRuntimeModule extends RuntimeModule {
    constructor(private version: string) {
      // Run before federation initialization (stage -1).
      super('federation build version', -2);
    }
    override generate() {
      return `__webpack_require__.mfBuildVersion = ${JSON.stringify(this.version)};`;
    }
  }
  compiler.hooks.thisCompilation.tap(
    'FederationBuildVersion',
    (compilation) => {
      const value = getCompilationBuildVersion(compilation);
      compilation.hooks.additionalTreeRuntimeRequirements.tap(
        'FederationBuildVersion',
        (chunk) => {
          compilation.addRuntimeModule(
            chunk,
            new BuildVersionRuntimeModule(value),
          );
        },
      );
    },
  );
  return `(${JSON.stringify(`${name}:`)} + __webpack_require__.mfBuildVersion)`;
}
