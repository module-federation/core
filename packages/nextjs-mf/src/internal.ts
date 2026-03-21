import type { moduleFederationPlugin } from '@module-federation/sdk';

const styledJsxVersion = require('styled-jsx/package.json').version as string;

const createSingletonShare = (
  config: Partial<moduleFederationPlugin.SharedConfig> = {},
): moduleFederationPlugin.SharedConfig => ({
  singleton: true,
  ...config,
});

export const DEFAULT_SHARE_SCOPE: moduleFederationPlugin.SharedObject = {
  'next/dynamic': createSingletonShare({
    requiredVersion: undefined,
    import: undefined,
  }),
  'next/head': createSingletonShare({
    requiredVersion: undefined,
    import: undefined,
  }),
  'next/image': createSingletonShare({
    requiredVersion: undefined,
    import: undefined,
  }),
  'next/link': createSingletonShare({
    requiredVersion: undefined,
    import: undefined,
  }),
  'next/router': createSingletonShare({
    requiredVersion: false,
    import: undefined,
  }),
  'next/script': createSingletonShare({
    requiredVersion: undefined,
    import: undefined,
  }),
  react: createSingletonShare({
    requiredVersion: false,
    import: false,
  }),
  'react/': createSingletonShare({
    requiredVersion: false,
    import: false,
  }),
  'react-dom': createSingletonShare({
    requiredVersion: false,
    import: false,
  }),
  'react-dom/': createSingletonShare({
    requiredVersion: false,
    import: false,
  }),
  'react/jsx-dev-runtime': createSingletonShare({
    requiredVersion: false,
  }),
  'react/jsx-runtime': createSingletonShare({
    requiredVersion: false,
  }),
  'styled-jsx': createSingletonShare({
    import: undefined,
    version: styledJsxVersion,
    requiredVersion: `^${styledJsxVersion}`,
  }),
  'styled-jsx/css': createSingletonShare({
    import: undefined,
    version: styledJsxVersion,
    requiredVersion: `^${styledJsxVersion}`,
  }),
  'styled-jsx/style': createSingletonShare({
    import: false,
    version: styledJsxVersion,
    requiredVersion: `^${styledJsxVersion}`,
  }),
};

export const DEFAULT_SHARE_SCOPE_BROWSER: moduleFederationPlugin.SharedObject =
  Object.fromEntries(
    Object.entries(DEFAULT_SHARE_SCOPE).map(([key, value]) => [
      key,
      Object.assign({}, value as moduleFederationPlugin.SharedConfig, {
        import: undefined,
      }),
    ]),
  ) as moduleFederationPlugin.SharedObject;
