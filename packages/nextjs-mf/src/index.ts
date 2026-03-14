import type { Compiler, WebpackPluginInstance } from 'webpack';
import type { NextFederationPluginOptions } from './plugins/NextFederationPlugin/next-fragments';

type NextFederationPluginCtor =
  typeof import('./plugins/NextFederationPlugin').default;
type NextFederationPluginModule =
  | NextFederationPluginCtor
  | {
      default?: NextFederationPluginCtor;
      NextFederationPlugin?: NextFederationPluginCtor;
    };

const runtimeRequireFromModule = new Function(
  'moduleRef',
  'id',
  'return moduleRef && moduleRef.require ? moduleRef.require(id) : undefined',
) as (moduleRef: { require(id: string): any } | undefined, id: string) => any;

const runtimeRequire = (id: string) =>
  runtimeRequireFromModule(
    typeof module !== 'undefined' ? module : undefined,
    id,
  );

const loadNextFederationPlugin = (): NextFederationPluginCtor => {
  const pluginModule = runtimeRequire(
    './plugins/NextFederationPlugin',
  ) as NextFederationPluginModule;

  if ((pluginModule as { default?: NextFederationPluginCtor }).default) {
    return (pluginModule as { default: NextFederationPluginCtor }).default;
  }

  if (
    (pluginModule as { NextFederationPlugin?: NextFederationPluginCtor })
      .NextFederationPlugin
  ) {
    return (pluginModule as { NextFederationPlugin: NextFederationPluginCtor })
      .NextFederationPlugin;
  }

  return pluginModule as NextFederationPluginCtor;
};

export class NextFederationPlugin implements WebpackPluginInstance {
  private readonly options: NextFederationPluginOptions;
  private instance?: WebpackPluginInstance & { name?: string };
  public name = 'ModuleFederationPlugin';

  constructor(options: NextFederationPluginOptions) {
    this.options = options;
  }

  private getInstance(): WebpackPluginInstance & { name?: string } {
    if (!this.instance) {
      const RealNextFederationPlugin = loadNextFederationPlugin();
      this.instance = new RealNextFederationPlugin(
        this.options,
      ) as WebpackPluginInstance & { name?: string };
      this.name = this.instance.name ?? this.name;
    }

    return this.instance;
  }

  apply(compiler: Compiler) {
    return this.getInstance().apply(compiler);
  }
}

export default NextFederationPlugin;

if (
  process.env['IS_ESM_BUILD'] !== 'true' &&
  typeof module !== 'undefined' &&
  typeof module.exports !== 'undefined'
) {
  module.exports = NextFederationPlugin;
  module.exports.NextFederationPlugin = NextFederationPlugin;
}
