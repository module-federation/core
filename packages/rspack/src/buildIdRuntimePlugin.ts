import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime-tools';

// rspack's native runtime passes no build id, so the full runtime would key its share scope by name.
export default function buildIdRuntimePlugin({
  id,
}: {
  id: string;
}): ModuleFederationRuntimePlugin {
  return {
    name: 'build-id-plugin',
    beforeInit(args) {
      args.userOptions.id ||= id;
      return args;
    },
  };
}
