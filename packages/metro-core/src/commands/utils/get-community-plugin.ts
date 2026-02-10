import type { ConfigT } from 'metro-config';
import { CLIError } from '../../utils/errors';
import type {
  OutputOptions,
  RequestOptions,
  Server,
} from '../../utils/metro-compat';

interface Command {
  name: string;
  description: string;
  func: () => Promise<void>;
  options: {
    name: string;
    description: string;
  }[];
}

interface CommunityCliPlugin {
  bundleCommand: Command;
  startCommand: Command;
  unstable_buildBundleWithConfig: (
    args: unknown,
    config: ConfigT,
    bundleImpl: {
      build: (
        server: InstanceType<typeof Server>,
        requestOpts: RequestOptions,
      ) => Promise<{ code: string; map: string }>;
      save: (
        bundle: { code: string; map: string },
        options: OutputOptions,
        log: (msg: string) => void,
      ) => Promise<void>;
      formatName: 'bundle';
    },
  ) => Promise<void>;
}

export function getCommunityCliPlugin(reactNativePath?: string) {
  let communityCliPlugin: CommunityCliPlugin;
  try {
    const communityCliPluginPath = require.resolve(
      '@react-native/community-cli-plugin',
      { paths: [reactNativePath ?? require.resolve('react-native')] },
    );
    communityCliPlugin = require(communityCliPluginPath);
  } catch {
    throw new CLIError('Community CLI plugin is not installed.');
  }
  return communityCliPlugin;
}
