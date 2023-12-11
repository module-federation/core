import type { container, Compiler } from 'webpack';
import type {
  ModuleFederationPluginOptions,
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
 * Apply remote delegates.
 *
 * This function adds the remote delegates feature by configuring and injecting the appropriate loader that will look
 * for internal delegate hoist or delegate hoist container and load it using a custom delegateLoader.
 * Once loaded, it will then look for the available delegates that will be used to configure the remote
 * that the hoisted module will be dependent upon.
 *
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 * @param {Compiler} compiler - The Webpack compiler instance.
 */
export function applyRemoteDelegates(
  options: ModuleFederationPluginOptions,
  compiler: Compiler,
) {
  if (options.remotes) {
    // Get the available delegates
    const delegates = getDelegates(options.remotes);
    compiler.options.module.rules.push({
      enforce: 'pre',
      test: [/_app/],
      loader: require.resolve('../../loaders/patchDefaultSharedLoader'),
    });
    // Add the delegate loader for hoist and container to the module rules
    compiler.options.module.rules.push({
      enforce: 'pre',
      test: [/internal-delegate-hoist/, /delegate-hoist-container/],
      include: [
        compiler.context,
        /internal-delegate-hoist/,
        /delegate-hoist-container/,
        //eslint-disable-next-line
        /next[\/]dist/,
      ],
      loader: require.resolve('../../loaders/delegateLoader'),
      options: {
        delegates,
      },
    });
  }
}

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
        if (hasLoader(oneOfRule, 'react-refresh-utils')) {
          oneOfRule.exclude = [
            oneOfRule.exclude,
            /enhanced\/src/,
            /nextjs-mf\/src/,
          ];
        }
      });
    }
  });
};
