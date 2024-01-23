import type { container, Compiler } from 'webpack';
import type {
  ModuleFederationPluginOptions,
  Shared,
  SharedObject,
} from '@module-federation/utilities';
import {
  DEFAULT_SHARE_SCOPE,
  DEFAULT_SHARE_SCOPE_BROWSER,
  getDelegates,
} from '../../internal';
import { hasLoader, injectRuleLoader } from '../../loaders/helpers';

/**
 * Set up default shared values based on the environment.
 * @param {boolean} isServer - Boolean indicating if the code is running on the server.
 * @returns {SharedObject} The default share scope based on the environment.
 */
export const retrieveDefaultShared = (isServer: boolean): SharedObject => {
  // If the code is running on the server, treat some Next.js internals as import false to make them external
  // This is because they will be provided by the server environment and not by the remote container
  if (isServer) {
    return DEFAULT_SHARE_SCOPE;
  }

  // If the code is running on the client/browser, always bundle Next.js internals
  return DEFAULT_SHARE_SCOPE_BROWSER;
};

/**
 * Apply path fixes.
 *
 * This function applies fixes to the path for certain loaders. It checks if the fix is enabled in the options
 * and if the loader is present in the rule. If both conditions are met, it injects the fix loader.
 *
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @param {any} options - The ModuleFederationPluginOptions instance.
 */
export const applyPathFixes = (compiler: Compiler, options: any) => {
  //@ts-ignore
  compiler.options.module.rules.forEach((rule) => {
    // next-image-loader fix which adds remote's hostname to the assets url
    //@ts-ignore
    if (options.enableImageLoaderFix && hasLoader(rule, 'next-image-loader')) {
      // childCompiler.options.module.parser.javascript?.url = 'relative';
      //@ts-ignore
      injectRuleLoader(rule, {
        loader: require.resolve('../../loaders/fixImageLoader'),
      });
    }

    // url-loader fix for which adds remote's hostname to the assets url
    //@ts-ignore
    if (options.enableUrlLoaderFix && hasLoader(rule, 'url-loader')) {
      injectRuleLoader({
        loader: require.resolve('../../loaders/fixUrlLoader'),
      });
    }
    //@ts-ignore
    if (rule?.oneOf) {
      //@ts-ignore
      rule.oneOf.forEach((oneOfRule) => {
        if (hasLoader(oneOfRule, 'react-refresh-utils') && oneOfRule.exclude) {
          oneOfRule.exclude = [oneOfRule.exclude, /universe\/packages/];
        }
      });
    }
  });
};

export const hasAppDir = (compiler: Compiler) => {
  return Object.keys(compiler.options.resolve.alias || {}).includes(
    'private-next-app-dir',
  );
};
