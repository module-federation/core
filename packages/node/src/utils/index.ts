export * from './flush-chunks';
export * from './hmr-client';
export * from './hmr-runtime';
export * from './custom-hmr-helpers';
export * from './hmr-runtime-patch';
export {
  getOrCreateHMRClient,
  createFetcher,
  getFetchModule,
} from './hot-reload';

/**
 * Check if revalidation should occur
 */
export async function revalidate(): Promise<boolean> {
  // Simple implementation that checks if module graph is dirty
  return globalThis.moduleGraphDirty || false;
}
