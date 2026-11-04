import type { ModuleFederationRuntimePlugin } from '@module-federation/modern-js-v3/runtime';
export default function metadataPlugin(): ModuleFederationRuntimePlugin {
  return {
    name: 'unified-react-expose-metadata',
    loadRemoteSnapshot(args) {
      if (args.manifestJson) {
        Object.assign(args.remoteSnapshot, {
          reactExposes: (args.manifestJson.metaData as any).reactExposes,
          reactMetadataSource: 'manifest',
        });
      }
      console.log('[unified demo] snapshot source:', args.from);
      return args;
    },
  };
}
