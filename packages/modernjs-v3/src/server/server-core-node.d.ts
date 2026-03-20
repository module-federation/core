/**
 * Type declarations for @modern-js/server-core/node when the published
 * package may not yet export registerBundleLoaderStrategy / BundleLoaderStrategy.
 * Used for RSC + async startup loader strategy registration.
 */
declare module '@modern-js/server-core/node' {
  export type BundleLoaderStrategy = (
    filepath: string,
    context?: {
      monitors?: { error?: (msg: string, ...args: unknown[]) => void };
    },
  ) => Promise<unknown | undefined>;

  export function registerBundleLoaderStrategy(
    strategy: BundleLoaderStrategy,
  ): void;
}
