import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { container, Compiler, RuleSetRule } from 'webpack';
import type {
  ModuleFederationPluginOptions,
  SharedObject,
} from '@module-federation/utilities';
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
const RuleSetCompiler = require(
  normalizeWebpackPath('webpack/lib/rules/RuleSetCompiler'),
) as typeof import('webpack/lib/rules/RuleSetCompiler');
const { getScheme } = require(
  normalizeWebpackPath('webpack/lib/util/URLAbsoluteSpecifier'),
) as typeof import('webpack/lib/util/URLAbsoluteSpecifier');

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
export const applyPathFixes = (
  compiler: Compiler,
  pluginOptions: ModuleFederationPluginOptions,
  options: any,
) => {
  const mfp = compiler.options.plugins.find((p) => {
    if (!p) return false;
    return p.name === 'ModuleFederationPlugin';
  });

  const runtimeModulePath = require
    .resolve('@module-federation/webpack-bundler-runtime/vendor')
    .replace('cjs', 'esm')
    .replace('.js', '.cjs');
  //@ts-ignore
  const match = findLoaderForResource(compiler.options.module.rules, {
    path: path.join(compiler.context, '/something/thing.js'),
    issuerLayer: undefined,
    layer: undefined,
  });

  // Get ruleset from normalModuleFactory
  // compiler.hooks.normalModuleFactory.tap('NextFederationPlugin', (nmf) => {
  //   const ruleSet = nmf.ruleSet;
  //   return;
  //   console.log(runtimeModulePath);
  //   const result = ruleSet.exec({
  //     resource: runtimeModulePath,
  //     realResource: runtimeModulePath,
  //     resourceQuery: undefined,
  //     resourceFragment: undefined,
  //     scheme: getScheme(runtimeModulePath),
  //     assertions: undefined,
  //     mimetype: 'text/javascript',
  //     dependency: 'commonjs',
  //     descriptionData: undefined,
  //     issuer: undefined,
  //     compiler: compiler.name,
  //     issuerLayer: ''
  //   });
  //   console.log(result);
  //   debugger;
  // });

  compiler.options.module.rules.forEach((rule) => {
    // next-image-loader fix which adds remote's hostname to the assets url
    if (options.enableImageLoaderFix && hasLoader(rule, 'next-image-loader')) {
      injectRuleLoader(rule, {
        loader: require.resolve('../../loaders/fixImageLoader'),
      });
    }

    // url-loader fix for which adds remote's hostname to the assets url
    if (options.enableUrlLoaderFix && hasLoader(rule, 'url-loader')) {
      injectRuleLoader(rule, {
        loader: require.resolve('../../loaders/fixUrlLoader'),
      });
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
        if (match.use.includes('react')) {
          matchCopy.use = '';
        } else {
          matchCopy.use = match.use;
        }
      } else if (typeof match.use === 'object' && match.use !== null) {
        if (match.use.loader && match.use.loader.includes('react')) {
          matchCopy.use = {};
        } else {
          matchCopy.use = match.use;
        }
      }
    } else {
      matchCopy = { ...match };
    }

    // Create the first new rule using descriptionData
    const descriptionDataRule: RuleSetRule = {
      ...matchCopy,
      descriptionData: {
        name: /^(@module-federation)/,
      },
      exclude: undefined,
      include: undefined,
    };

    // Create the second new rule using test on regex for /runtimePlugin/
    const testRule: RuleSetRule = {
      ...matchCopy,
      resourceQuery: /runtimePlugin/,
      exclude: undefined,
      include: undefined,
    };

    const oneOfRule = compiler.options.module.rules.find((rule) => {
      return rule && typeof rule === 'object' && 'oneOf' in rule;
    }) as RuleSetRule;

    if (!oneOfRule) {
      compiler.options.module.rules.unshift({
        oneOf: [descriptionDataRule, testRule],
      });
    } else if (oneOfRule.oneOf) {
      oneOfRule.oneOf.unshift(descriptionDataRule, testRule);
    }
  }
};
