import type { moduleFederationPlugin } from '@module-federation/sdk';

type ManifestOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions['manifest'];

export const normalizeManifestOptions = (
  manifest: ManifestOptions,
  isServer: boolean,
): ManifestOptions => {
  if (manifest === false) return false;

  return {
    ...(typeof manifest === 'object' && manifest !== null ? manifest : {}),
    filePath: isServer ? '' : '/static/chunks',
  };
};
