/**
 * HMR Client - Simple Library Interface for Custom Hot Module Replacement
 *
 * This library provides a clean, intuitive API for controlling custom HMR operations.
 * It wraps the complexity of the underlying HMR implementation and provides easy-to-use
 * methods for developers who want basic HMR control.
 */

import { applyHotUpdateFromStringsByPatching } from './custom-hmr-helpers';
import type {
  HMRWebpackRequire,
  ModuleObject,
  HMRClientOptions,
  HMRUpdate,
  UpdateProvider,
  CheckResult,
  HMRStats,
  HMRStatus,
  PollingOptions,
  PollingControl,
  ForceUpdateOptions
} from '../types/hmr';

declare const __webpack_require__: HMRWebpackRequire | undefined;
declare const module: ModuleObject | undefined;

class HMRClient {
  private options: Required<HMRClientOptions>;
  private isAttached = false;
  private updateProvider: UpdateProvider | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private stats: HMRStats;

  constructor(options: HMRClientOptions = {}) {
    this.options = {
      autoAttach: true,
      logging: true,
      pollingInterval: 1000,
      maxRetries: 3,
      ...options
    };

    this.stats = {
      totalUpdates: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      lastUpdateTime: null
    };

    if (this.options.autoAttach) {
      this.attach();
    }
  }

  /**
   * Initialize and attach the HMR runtime to the current environment
   * @returns Success status
   */
  attach(): boolean {
    try {
      if (this.isAttached) {
        this.log('HMR Client already attached');
        return true;
      }

      // Check if we're in a webpack environment
      if (typeof __webpack_require__ === 'undefined') {
        this.log('Warning: __webpack_require__ not available. HMR functionality may be limited.');
      }

      // Check if module.hot is available
      if (typeof module === 'undefined' || !module.hot) {
        this.log('Warning: module.hot not available. Some HMR features may not work.');
      }

      this.isAttached = true;
      this.log('HMR Client successfully attached');
      return true;
    } catch (error) {
      this.log('Failed to attach HMR Client:', (error as Error).message);
      return false;
    }
  }

  /**
   * Detach the HMR client and cleanup resources
   */
  detach(): void {
    this.stopPolling();
    this.updateProvider = null;
    this.isAttached = false;
    this.log('HMR Client detached');
  }

  /**
   * Set an update provider function
   * @param provider - Function that returns update data
   */
  setUpdateProvider(provider: UpdateProvider): void {
    if (typeof provider !== 'function') {
      throw new Error('Update provider must be a function');
    }
    this.updateProvider = provider;
    this.log('Update provider configured');
  }

  /**
   * Check for updates and apply them if available
   * @param options - Check options
   * @returns Result object with success status and details
   */
  async checkForUpdates(options: { autoApply?: boolean } = {}): Promise<CheckResult> {
    const opts = { autoApply: true, ...options };

    try {
      if (!this.updateProvider) {
        return {
          success: false,
          reason: 'no_provider',
          message: 'No update provider configured'
        };
      }

      this.log('Checking for updates...');
      const updateData = await this.updateProvider();

      if (!updateData || !updateData.update) {
        return {
          success: false,
          reason: 'no_updates',
          message: 'No updates available'
        };
      }

      if (opts.autoApply) {
        return await this.applyUpdate(updateData);
      } else {
        return {
          success: true,
          reason: 'updates_available',
          message: 'Updates available but not applied',
          updateData
        };
      }
    } catch (error) {
      this.stats.failedUpdates++;
      this.log('Error checking for updates:', (error as Error).message);
      return {
        success: false,
        reason: 'check_error',
        message: (error as Error).message,
        error: error as Error
      };
    }
  }

  /**
   * Apply a specific update
   * @param updateData - Update data to apply
   * @returns Result object
   */
  async applyUpdate(updateData: HMRUpdate): Promise<CheckResult> {
    try {
      if (!this.isAttached) {
        throw new Error('HMR Client not attached. Call attach() first.');
      }

      this.stats.totalUpdates++;
      this.log('Applying update...');

      const update = updateData.update;
      if (!update) {
        throw new Error('Update data is null');
      }
      const manifestJsonString = JSON.stringify(update.manifest);
      const chunkJsStringsMap = this.prepareChunkMap(update);

      await applyHotUpdateFromStringsByPatching(
        module!,
        typeof __webpack_require__ !== 'undefined' ? __webpack_require__ : null,
        manifestJsonString,
        chunkJsStringsMap
      );

      this.stats.successfulUpdates++;
      this.stats.lastUpdateTime = new Date().toISOString();

      this.log('Update applied successfully');
      return {
        success: true,
        reason: 'update_applied',
        message: 'Update applied successfully',
        updateId: update.originalInfo?.updateId,
        stats: this.getStats()
      };
    } catch (error) {
      this.stats.failedUpdates++;
      this.log('Failed to apply update:', (error as Error).message);
      return {
        success: false,
        reason: 'apply_error',
        message: (error as Error).message,
        error: error as Error
      };
    }
  }

  /**
   * Force a hot update regardless of whether updates are available
   * @param options - Force update options
   * @returns Result object
   */
  async forceUpdate(options: ForceUpdateOptions = {}): Promise<CheckResult> {
    const opts = {
      createMinimalUpdate: true,
      ...options
    };

    try {
      this.log('Forcing update...');

      let updateData = opts.updateData;

      if (!updateData && opts.createMinimalUpdate) {
        // Create a minimal update for testing/force scenarios
        updateData = {
          update: {
            manifest: {
              h: typeof __webpack_require__ !== 'undefined' ? (__webpack_require__ as any).h() : 'force-hash-' + Date.now(),
              c: this.getCurrentChunks(),
              r: this.getCurrentChunks(),
              m: this.getCurrentModules()
            },
            script: this.createMinimalScript(),
            originalInfo: {
              updateId: 'force-update-' + Date.now(),
              webpackHash: typeof __webpack_require__ !== 'undefined' ? (__webpack_require__ as any).h() : 'force-hash'
            }
          }
        };
      }

      if (!updateData) {
        throw new Error('No update data available and createMinimalUpdate is disabled');
      }

      return await this.applyUpdate(updateData);
    } catch (error) {
      this.log('Force update failed:', (error as Error).message);
      return {
        success: false,
        reason: 'force_error',
        message: (error as Error).message,
        error: error as Error
      };
    }
  }

  /**
   * Start automatic polling for updates
   * @param options - Polling options
   * @returns Polling control object
   */
  startPolling(options: PollingOptions = {}): PollingControl {
    const opts = {
      interval: this.options.pollingInterval,
      forceMode: false,
      onUpdate: null,
      onError: null,
      ...options
    };

    if (this.pollingInterval) {
      this.log('Polling already active');
      return { stop: () => this.stopPolling() };
    }

    this.log(`Starting update polling (interval: ${opts.interval}ms, force: ${opts.forceMode})`);

    const pollFunction = async (): Promise<void> => {
      try {
        let result: CheckResult;

        if (opts.forceMode) {
          result = await this.forceUpdate();
        } else {
          result = await this.checkForUpdates();
        }

        if (result.success && opts.onUpdate) {
          opts.onUpdate(result);
        } else if (!result.success && opts.onError) {
          opts.onError(result);
        }
      } catch (error) {
        this.log('Polling error:', (error as Error).message);
        if (opts.onError) {
          opts.onError({
            success: false,
            reason: 'check_error',
            message: (error as Error).message,
            error: error as Error
          });
        }
      }
    };

    // Run initial check
    pollFunction();

    // Start interval
    this.pollingInterval = setInterval(pollFunction, opts.interval);

    return {
      stop: () => this.stopPolling()
    };
  }

  /**
   * Stop automatic polling
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.log('Polling stopped');
    }
  }

  /**
   * Get current HMR status and statistics
   * @returns Status object
   */
  getStatus(): HMRStatus {
    return {
      isAttached: this.isAttached,
      hasWebpackRequire: typeof __webpack_require__ !== 'undefined',
      hasModuleHot: typeof module !== 'undefined' && !!module.hot,
      hotStatus: this.getHotStatus(),
      webpackHash: this.getWebpackHash(),
      isPolling: !!this.pollingInterval,
      hasUpdateProvider: !!this.updateProvider,
      stats: this.getStats()
    };
  }

  /**
   * Get update statistics
   * @returns Stats object
   */
  getStats(): HMRStats {
    return { ...this.stats };
  }

  /**
   * Create a simple update provider from a URL endpoint
   * @param url - Update endpoint URL
   * @param options - Fetch options
   * @returns Update provider function
   */
  static createHttpUpdateProvider(url: string, options: RequestInit = {}): UpdateProvider {
    return async function httpUpdateProvider(): Promise<HMRUpdate> {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>)
          },
          ...options
        });

        if (!response.ok) {
          return { update: null };
        }

        const data = await response.json() as HMRUpdate;
        return data;
      } catch (error) {
        console.error('HTTP update provider error:', error);
        return { update: null };
      }
    };
  }

  /**
   * Create an update provider from a queue of predefined updates
   * @param updates - Array of update objects
   * @returns Update provider function
   */
  static createQueueUpdateProvider(updates: HMRUpdate['update'][] = []): UpdateProvider {
    let index = 0;
    return async function queueUpdateProvider(): Promise<HMRUpdate> {
      if (index < updates.length) {
        const update = updates[index];
        index++;
        return { update };
      }
      return { update: null };
    };
  }

  /**
   * Create an update provider from a callback function
   * @param callback - Callback function
   * @returns Update provider function
   */
  static createCallbackUpdateProvider(callback: (currentHash: string | null) => Promise<HMRUpdate>): UpdateProvider {
    return async function callbackUpdateProvider(): Promise<HMRUpdate> {
      try {
        const currentHash = typeof __webpack_require__ !== 'undefined' ? (__webpack_require__ as any).h() : null;
        const result = await callback(currentHash);
        return result || { update: null };
      } catch (error) {
        return { update: null };
      }
    };
  }

  // Private helper methods
  private log(message: string, ...args: any[]): void {
    if (this.options.logging) {
      console.log(`[HMR Client] ${message}`, ...args);
    }
  }

  private getHotStatus(): string {
    try {
      return (typeof module !== 'undefined' && module.hot) ? module.hot.status() : 'unavailable';
    } catch (error) {
      return 'error';
    }
  }

  private getWebpackHash(): string | null {
    try {
      return typeof __webpack_require__ !== 'undefined' ? (__webpack_require__ as any).h() : null;
    } catch (error) {
      return null;
    }
  }

  private getCurrentChunks(): string[] {
    try {
      return typeof __webpack_require__ !== 'undefined'
        ? Object.keys((__webpack_require__ as any).hmrS_readFileVm || {})
        : ['index'];
    } catch (error) {
      return ['index'];
    }
  }

  private getCurrentModules(): string[] {
    try {
      return typeof __webpack_require__ !== 'undefined'
        ? Object.keys((__webpack_require__ as any).c || {})
        : [];
    } catch (error) {
      return [];
    }
  }

  private prepareChunkMap(update: NonNullable<HMRUpdate['update']>): { [chunkId: string]: string } {
    return {
      index: update.script || 'exports.modules = {}; exports.runtime = function() {};'
    };
  }

  private createMinimalScript(): string {
    return `
      exports.modules = {};
      exports.runtime = function(__webpack_require__) {
        // Minimal runtime update for force mode
        console.log('[HMR] Force update applied');
      };
    `;
  }
}

// Convenience function to create a new HMR client instance
function createHMRClient(options?: HMRClientOptions): HMRClient {
  return new HMRClient(options);
}

// Export the class and convenience function
export {
  HMRClient,
  createHMRClient,
  type HMRClientOptions,
  type HMRUpdate,
  type UpdateProvider,
  type CheckResult,
  type HMRStats,
  type HMRStatus,
  type PollingOptions,
  type PollingControl,
  type ForceUpdateOptions,
};
