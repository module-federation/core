import type { Compiler, RuleSetRule } from 'webpack';
import type {
  moduleFederationPlugin,
  sharePlugin,
} from '@module-federation/sdk';
import {
  DEFAULT_SHARE_SCOPE,
  DEFAULT_SHARE_SCOPE_BROWSER,
} from '../../internal';
import {
  hasLoader,
  injectRuleLoader,
  findLoaderForResource,
} from '../../loaders/helpers';
import path from 'path';
/**
 * Set up default shared values based on the environment.
 * @param {boolean} isServer - Boolean indicating if the code is running on the server.
 * @returns {SharedObject} The default share scope based on the environment.
 */
export const retrieveDefaultShared = (
  isServer: boolean,
): sharePlugin.SharedObject => {
  // If the code is running on the server, treat some Next.js internals as import false to make them external
  // This is because they will be provided by the server environment and not by the remote container
  if (isServer) {
    return DEFAULT_SHARE_SCOPE;
  }
  // If the code is running on the client/browser, always bundle Next.js internals
  return DEFAULT_SHARE_SCOPE_BROWSER;
};
export const applyPathFixes = (
  compiler: Compiler,
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions,
  options: any,
) => {
  const match = findLoaderForResource(
    compiler.options.module.rules as RuleSetRule[],
    {
      path: path.join(compiler.context, '/something/thing.js'),
      issuerLayer: undefined,
      layer: undefined,
    },
  );

  compiler.options.module.rules.forEach((rule) => {
    if (typeof rule === 'object' && rule !== null) {
      const typedRule = rule as RuleSetRule;
      // next-image-loader fix which adds remote's hostname to the assets url
      if (
        options.enableImageLoaderFix &&
        hasLoader(typedRule, 'next-image-loader')
      ) {
        injectRuleLoader(typedRule, {
          loader: require.resolve('../../loaders/fixImageLoader'),
        });
      }

      if (options.enableUrlLoaderFix && hasLoader(typedRule, 'url-loader')) {
        injectRuleLoader(typedRule, {
          loader: require.resolve('../../loaders/fixUrlLoader'),
        });
      }
    }
  });

  if (match) {
    let matchCopy: RuleSetRule;
    if (match.use) {
      matchCopy = { ...match };
      if (Array.isArray(match.use)) {
        matchCopy.use = match.use.filter((loader: any) => {
          return (
            typeof loader === 'object' &&
            loader.loader &&
            !loader.loader.includes('react')
          );
        });
      } else if (typeof match.use === 'string') {
        matchCopy.use = match.use.includes('react') ? '' : match.use;
      } else if (typeof match.use === 'object' && match.use !== null) {
        matchCopy.use =
          match.use.loader && match.use.loader.includes('react')
            ? {}
            : match.use;
      }
    } else {
      matchCopy = { ...match };
    }

    const descriptionDataRule: RuleSetRule = {
      ...matchCopy,
      descriptionData: {
        name: /^(@module-federation)/,
      },
      exclude: undefined,
      include: undefined,
    };

    const testRule: RuleSetRule = {
      ...matchCopy,
      resourceQuery: /runtimePlugin/,
      exclude: undefined,
      include: undefined,
    };

    const oneOfRule = compiler.options.module.rules.find(
      (rule): rule is RuleSetRule => {
        return !!rule && typeof rule === 'object' && 'oneOf' in rule;
      },
    ) as RuleSetRule | undefined;

    if (!oneOfRule) {
      compiler.options.module.rules.unshift({
        oneOf: [descriptionDataRule, testRule],
      });
    } else if (oneOfRule.oneOf) {
      oneOfRule.oneOf.unshift(descriptionDataRule, testRule);
    }
  }
};

export interface NextFederationPluginExtraOptions {
  enableImageLoaderFix?: boolean;
  enableUrlLoaderFix?: boolean;
  exposePages?: boolean;
  skipSharingNextInternals?: boolean;
  automaticPageStitching?: boolean;
  debug?: boolean;
}

export interface NextFederationPluginOptions
  extends moduleFederationPlugin.ModuleFederationPluginOptions {
  extraOptions: NextFederationPluginExtraOptions;
}
