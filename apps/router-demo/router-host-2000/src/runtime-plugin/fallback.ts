import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import {
  createLifecycleBasedPlugin,
  createSimplePlugin,
} from './error-handling';

interface FallbackConfig {
  // Backup service address
  backupEntryUrl?: string;
  // Custom error message
  errorMessage?: string;
  // Error handling strategy: 'simple' | 'lifecycle-based'
  strategy?: 'simple' | 'lifecycle-based';
}

const fallbackPlugin = (
  config: FallbackConfig = {},
): FederationRuntimePlugin => {
  const {
    backupEntryUrl = 'http://localhost:2002/mf-manifest.json',
    errorMessage = 'Module loading failed, please try again later',
    strategy = 'lifecycle-based',
  } = config;

  // Use the selected error handling strategy
  if (strategy === 'simple') {
    return createSimplePlugin({ errorMessage });
  }

  return createLifecycleBasedPlugin({
    backupEntryUrl,
    errorMessage,
  });
};

export default fallbackPlugin;
