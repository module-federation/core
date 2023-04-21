import type { Compiler } from 'webpack';
import type {
  ModuleFederationPluginOptions,
  SharedConfig,
  SharedObject,
} from '@module-federation/utilities';
import { createDelegatedModule } from '@module-federation/utilities';

import path from 'path';

import { isRequiredVersion } from 'webpack/lib/sharing/utils';
import { parseOptions } from 'webpack/lib/container/options';

// the share scope we attach by default
// in hosts we re-key them to prevent webpack moving the modules into their own chunks (cause eager error)
// in remote these are marked as import:false as we always expect the host to prove them
export const DEFAULT_SHARE_SCOPE: SharedObject = {
  react: {
    singleton: true,
    requiredVersion: false,
    eager: false,
    import: false,
  },
  'react/jsx-runtime': {
    singleton: true,
    requiredVersion: false,
    import: false,
    eager: false,
  },
  'react/jsx-dev-runtime': {
    singleton: true,
    requiredVersion: false,
    import: false,
    eager: true,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: false,
    eager: false,
    import: false,
  },
  'next/dynamic': {
    eager: true,
    requiredVersion: false,
    singleton: true,
    import: false,
  },
  'styled-jsx': {
    requiredVersion: false,
    singleton: true,
    import: false,
    eager: true,
  },
  'styled-jsx/style': {
    requiredVersion: false,
    singleton: true,
    import: false,
    eager: true,
  },
  'next/link': {
    requiredVersion: false,
    singleton: true,
    import: false,
    eager: true,
  },
  'next/router': {
    requiredVersion: false,
    singleton: true,
    import: false,
    eager: true,
  },
  'next/script': {
    requiredVersion: false,
    singleton: true,
    import: false,
    eager: true,
  },
  'next/head': {
    requiredVersion: false,
    singleton: true,
    import: false,
    eager: true,
  },
};

export const DEFAULT_SHARE_SCOPE_BROWSER: SharedObject = Object.entries(
  DEFAULT_SHARE_SCOPE
).reduce((acc, item) => {
  const [key, value] = item as [string, SharedConfig];

  acc[key] = { ...value, eager: true };

  return acc;
}, {} as SharedObject);

export const externalizedShares: SharedObject = Object.entries(
  DEFAULT_SHARE_SCOPE
).reduce((acc, item) => {
  const [key, value] = item as [string, SharedConfig];

  acc[key] = { ...value, import: false };

  if (key === 'react/jsx-runtime') {
    delete (acc[key] as SharedConfig).import;
  }

  return acc;
}, {} as SharedObject);

// determine output base path, derives .next folder location
export const getOutputPath = (compiler: Compiler) => {
  const isServer = compiler.options.target !== 'client';
  let outputPath: string | string[] | undefined =
    compiler.options.output.path?.split(path.sep);

  const foundIndex = outputPath?.lastIndexOf(isServer ? 'server' : 'static');

  outputPath = outputPath
    ?.slice(0, foundIndex && foundIndex > 0 ? foundIndex : outputPath.length)
    .join(path.sep);

  return outputPath as string;
};

export const removePlugins = [
  'NextJsRequireCacheHotReloader',
  'BuildManifestPlugin',
  'WellKnownErrorsPlugin',
  'WebpackBuildEventsPlugin',
  'HotModuleReplacementPlugin',
  'NextMiniCssExtractPlugin',
  'NextFederationPlugin',
  'CopyFilePlugin',
  'ProfilingPlugin',
  'DropClientPage',
  'ReactFreshWebpackPlugin',
  'NextMedusaPlugin',
];

/*
 This code is doing the following It's iterating over all remotes and checking if
 they are using a custom promise template or not If it's a custom promise template
 we're parsing the remote syntax to get the module name and version number
  */
export const parseRemotes = (remotes: Record<string, any>) =>
  Object.entries(remotes).reduce((acc, [key, value]) => {
    // check if user is passing a internal "delegate module" reference
    if (value.startsWith('internal ') || value.startsWith('promise ')) {
      return { ...acc, [key]: value };
    }
    // check if user is passing standard remote syntax, if so use default delegate
    if (value.includes('@')) {
      return {
        ...acc,
        [key]: createDelegatedModule(require.resolve('./default-delegate.js'), {
          remote: value,
        }),
      };
    }
    // return standard template otherwise
    return { ...acc, [key]: value };
  }, {} as Record<string, string>);

export const getDelegates = (remotes: Record<string, any>) => {
  return Object.entries(remotes).reduce((acc, [key, value]) => {
    // check if user is passing a internal "delegate module" reference
    if (value.startsWith('internal ')) {
      return { ...acc, [key]: value };
    }

    return acc;
  }, {} as Record<string, string>);
};

/*
 This code is parsing the options shared object and creating a new object with all
 of the shared configs Then it is iterating over each key in this new object and
 assigning them to an array that will be returned by this function This array contains
 objects that are used as values for the shared property of Module Federation Plugin
 Options The first thing we do here is check if the item passed into shared was a
 string or not if it\'s an array If it wasn\'t then throw an error because there should
 only be strings in there Otherwise continue on with our code below
  */
const parseShareOptions = (options: ModuleFederationPluginOptions) => {
  const sharedOptions: [string, SharedConfig][] = parseOptions(
    options.shared,
    (item: string, key: string) => {
      if (typeof item !== 'string')
        throw new Error('Unexpected array in shared');

      return item === key || !isRequiredVersion(item)
        ? {
            import: item,
          }
        : {
            import: key,
            requiredVersion: item,
          };
    },
    (item: any) => item
  );

  return sharedOptions.reduce((acc, [key, options]) => {
    acc[key] = {
      import: options.import,
      shareKey: options.shareKey || key,
      shareScope: options.shareScope,
      requiredVersion: options.requiredVersion,
      strictVersion: options.strictVersion,
      singleton: options.singleton,
      packageName: options.packageName,
      eager: options.eager,
    };
    return acc;
  }, {} as Record<string, SharedConfig>);
};

export const toDisplayErrors = (err: Error[]) =>
  err
    .map((error) => {
      let { message } = error;
      if (error.stack) {
        message += `\n${error.stack}`;
      }
      return message;
    })
    .join('\n');
