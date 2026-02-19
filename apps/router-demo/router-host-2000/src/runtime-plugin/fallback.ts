import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';
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
): ModuleFederationRuntimePlugin => {
  const {
    backupEntryUrl = 'http://localhost:2002/mf-manifest.json',
    errorMessage = 'Module loading failed, please try again later',
    // The router demo e2e expects a visible error state when a remote fails to load.
    // The lifecycle-based strategy may recover by loading a backup manifest, which
    // makes the demo resilient but breaks the "resource-error" test expectation.
    strategy = 'simple',
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
