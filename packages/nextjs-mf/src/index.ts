import type { Compiler } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import withNextFederation, {
  applyResolvedNextFederationConfig,
} from './withNextFederation';
import {
  assertLocalWebpackEnabled,
  isNextBuildOrDevCommand,
  normalizeNextFederationOptions,
} from './core/options';
import type {
  NextFederationCompilerContext,
  NextFederationMode,
  NextFederationOptionsV9,
  ResolvedNextFederationOptions,
} from './types';

type LegacyExtraOptions = {
  exposePages?: boolean;
  skipSharingNextInternals?: boolean;
  debug?: boolean;
  automaticPageStitching?: boolean;
  enableImageLoaderFix?: boolean;
  enableUrlLoaderFix?: boolean;
};

type LegacyNextFederationPluginOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions & {
    extraOptions?: LegacyExtraOptions;
  };

function toLegacyCompatOptions(
  input: LegacyNextFederationPluginOptions,
): NextFederationOptionsV9 {
  const { extraOptions, ...federation } = input;

  return {
    ...federation,
    mode: 'pages',
    pages: {
      exposePages: extraOptions?.exposePages ?? false,
    },
    sharing: {
      includeNextInternals: !extraOptions?.skipSharingNextInternals,
    },
    diagnostics: extraOptions?.debug ? { level: 'debug' } : undefined,
  };
}

export class NextFederationPlugin {
  private readonly resolved: ResolvedNextFederationOptions;

  public readonly name = 'ModuleFederationPlugin';

  constructor(private readonly options: LegacyNextFederationPluginOptions) {
    this.resolved = normalizeNextFederationOptions(
      toLegacyCompatOptions(options),
    );
  }

  apply(compiler: Compiler): void {
    if (isNextBuildOrDevCommand() && this.resolved.mode !== 'app') {
      assertLocalWebpackEnabled();
    }

    if (!process.env['FEDERATION_WEBPACK_PATH']) {
      process.env['FEDERATION_WEBPACK_PATH'] = getWebpackPath(compiler, {
        framework: 'nextjs',
      });
    }

    applyResolvedNextFederationConfig(
      compiler.options,
      {
        dir: compiler.context,
        isServer: compiler.options.name === 'server',
        nextRuntime:
          compiler.options.name === 'edge-server' ? 'edge' : 'nodejs',
        webpack: compiler.webpack,
      },
      this.resolved,
      false,
    );
  }
}

export type {
  NextFederationCompilerContext,
  NextFederationMode,
  NextFederationOptionsV9,
} from './types';

export { withNextFederation };
export default withNextFederation;

module.exports = NextFederationPlugin;
module.exports.NextFederationPlugin = NextFederationPlugin;
module.exports.withNextFederation = withNextFederation;
