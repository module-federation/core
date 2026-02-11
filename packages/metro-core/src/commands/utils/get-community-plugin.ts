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
        server: Server,
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
  let communityCliPluginPath: string;
  try {
    communityCliPluginPath = require.resolve(
      '@react-native/community-cli-plugin',
      { paths: [reactNativePath ?? require.resolve('react-native')] },
    );
  } catch {
    throw new CLIError('Community CLI plugin is not installed.');
  }
  return require(communityCliPluginPath) as CommunityCliPlugin;
}
