import type { ConfigT } from 'metro-config';
import type Server from 'metro/private/Server';
import type { OutputOptions, RequestOptions } from 'metro/private/shared/types';
import { CLIError } from '../../utils/errors';

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
