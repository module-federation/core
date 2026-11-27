import fs from 'node:fs';
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
      {
        // The plugin is a dependency of react-native, so it is looked up from
        // where react-native is installed. React Native Community CLI passes
        // <project>/node_modules/react-native, which is a symlink under pnpm,
        // and Node.js doesn't follow it when looking up from `paths`.
        paths: [
          reactNativePath
            ? fs.realpathSync(reactNativePath)
            : require.resolve('react-native'),
        ],
      },
    );
  } catch {
    throw new CLIError('Community CLI plugin is not installed.');
  }
  return require(communityCliPluginPath) as CommunityCliPlugin;
}
