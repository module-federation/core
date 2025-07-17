import { getAllKnownRemotes } from './flush-chunks';
import { createHMRClient } from './hmr-client';
import type { HMRClient } from '../types/hmr';
import crypto from 'crypto';
import helpers from '@module-federation/runtime/helpers';

declare global {
  var mfHashMap: Record<string, string> | undefined;
  var moduleGraphDirty: boolean;
  var mfHMRClient: HMRClient | undefined;
}

const hashmap = globalThis.mfHashMap || ({} as Record<string, string>);
globalThis.moduleGraphDirty = false;

/**
 * Initialize or get the global HMR client instance for Module Federation hot reload
 */
export function getOrCreateHMRClient(): HMRClient {
  if (!globalThis.mfHMRClient) {
    globalThis.mfHMRClient = createHMRClient();
  }
  return globalThis.mfHMRClient;
}

/**
 * Initializes HMR runtime patching from the provided arguments.
 * Sets up hot reloading for Module Federation in a Node.js environment.
 * @param args - Runtime initialization arguments containing HMR configuration
 */
export function initializeHMRRuntimePatchingFromArgs(args: any): void {
  const hmrConfig = args?.hmr;
  if (!hmrConfig) {
    console.log('[MF] HMR not configured, skipping HMR setup');
    return;
  }

  console.log('[MF] Setting up HMR with config:', hmrConfig);
  const hmrClient = getOrCreateHMRClient();

  // Apply HMR configuration to the client
  if (hmrConfig.port) {
    hmrClient.setPort(hmrConfig.port);
  }

  // Start HMR client if it's not already running
  if (!hmrClient.isConnected()) {
    hmrClient.connect();
  }
}

/**
 * Create a fetcher for remote entry hash tracking
 */
export function createFetcher(
  entry: string,
  fetchModule: any,
  name: string,
  callback: (hash: string) => void,
): Promise<void> {
  return Promise.resolve().then(() => {
    // Extract hash from entry URL or use current timestamp as fallback
    const hashMatch = entry.match(/hash[=:]([a-f0-9]+)/i);
    const hash = hashMatch ? hashMatch[1] : Date.now().toString();
    callback(hash);
  });
}

/**
 * Get fetch module helper
 */
export function getFetchModule(): any {
  return {
    fetch: globalThis.fetch || (() => Promise.resolve({ text: () => '' })),
  };
}
