/**
 * HMR Client - Simple Library Interface for Custom Hot Module Replacement
 * 
 * This library provides a clean, intuitive API for controlling custom HMR operations.
 * It wraps the complexity of the underlying HMR implementation and provides easy-to-use
 * methods for developers who want basic HMR control.
 */

const { applyHotUpdateFromStringsByPatching } = require('./custom-hmr-helpers');

class HMRClient {
  constructor(options = {}) {
    this.options = {
      autoAttach: true,
      logging: true,
      pollingInterval: 1000,
      maxRetries: 3,
      ...options
    };
    
    this.isAttached = false;
    this.updateProvider = null;
    this.pollingInterval = null;
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
   * @returns {boolean} Success status
   */
  attach() {
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
      this.log('Failed to attach HMR Client:', error.message);
      return false;
    }
  }

  /**
   * Detach the HMR client and cleanup resources
   */
  detach() {
    this.stopPolling();
    this.updateProvider = null;
    this.isAttached = false;
    this.log('HMR Client detached');
  }

  /**
   * Set an update provider function
   * @param {Function} provider - Function that returns update data
   */
  setUpdateProvider(provider) {
    if (typeof provider !== 'function') {
      throw new Error('Update provider must be a function');
    }
    this.updateProvider = provider;
    this.log('Update provider configured');
  }

  /**
   * Check for updates and apply them if available
   * @param {Object} options - Check options
   * @returns {Promise<Object>} Result object with success status and details
   */
  async checkForUpdates(options = {}) {
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
      this.log('Error checking for updates:', error.message);
      return {
        success: false,
        reason: 'check_error',
        message: error.message,
        error
      };
    }
  }

  /**
   * Apply a specific update
   * @param {Object} updateData - Update data to apply
   * @returns {Promise<Object>} Result object
   */
  async applyUpdate(updateData) {
    try {
      if (!this.isAttached) {
        throw new Error('HMR Client not attached. Call attach() first.');
      }

      this.stats.totalUpdates++;
      this.log('Applying update...');

      const update = updateData.update;
      const manifestJsonString = JSON.stringify(update.manifest);
      const chunkJsStringsMap = this.prepareChunkMap(update);

      await applyHotUpdateFromStringsByPatching(
        module,
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
      this.log('Failed to apply update:', error.message);
      return {
        success: false,
        reason: 'apply_error',
        message: error.message,
        error
      };
    }
  }

  /**
   * Force a hot update regardless of whether updates are available
   * @param {Object} options - Force update options
   * @returns {Promise<Object>} Result object
   */
  async forceUpdate(options = {}) {
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
              h: typeof __webpack_require__ !== 'undefined' ? __webpack_require__.h() : 'force-hash-' + Date.now(),
              c: this.getCurrentChunks(),
              r: this.getCurrentChunks(),
              m: this.getCurrentModules()
            },
            script: this.createMinimalScript(),
            originalInfo: {
              updateId: 'force-update-' + Date.now(),
              webpackHash: typeof __webpack_require__ !== 'undefined' ? __webpack_require__.h() : 'force-hash'
            }
          }
        };
      }

      return await this.applyUpdate(updateData);
    } catch (error) {
      this.log('Force update failed:', error.message);
      return {
        success: false,
        reason: 'force_error',
        message: error.message,
        error
      };
    }
  }

  /**
   * Start automatic polling for updates
   * @param {Object} options - Polling options
   * @returns {Object} Polling control object
   */
  startPolling(options = {}) {
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

    const pollFunction = async () => {
      try {
        let result;
        
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
        this.log('Polling error:', error.message);
        if (opts.onError) {
          opts.onError({ success: false, error });
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
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.log('Polling stopped');
    }
  }

  /**
   * Get current HMR status and statistics
   * @returns {Object} Status object
   */
  getStatus() {
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
   * @returns {Object} Stats object
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Create a simple update provider from a URL endpoint
   * @param {string} url - Update endpoint URL
   * @param {Object} options - Fetch options
   * @returns {Function} Update provider function
   */
  static createHttpUpdateProvider(url, options = {}) {
    return async function httpUpdateProvider() {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        });
        
        if (!response.ok) {
          return { update: null };
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('HTTP update provider error:', error);
        return { update: null };
      }
    };
  }

  /**
   * Create an update provider from a queue of predefined updates
   * @param {Array} updates - Array of update objects
   * @returns {Function} Update provider function
   */
  static createQueueUpdateProvider(updates = []) {
    let index = 0;
    return async function queueUpdateProvider() {
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
   * @param {Function} callback - Callback function
   * @returns {Function} Update provider function
   */
  static createCallbackUpdateProvider(callback) {
    return async function callbackUpdateProvider() {
      try {
        const currentHash = typeof __webpack_require__ !== 'undefined' ? __webpack_require__.h() : null;
        const result = await callback(currentHash);
        return result || { update: null };
      } catch (error) {
        return { update: null };
      }
    };
  }

  // Private helper methods
  log(message, ...args) {
    if (this.options.logging) {
      console.log(`[HMR Client] ${message}`, ...args);
    }
  }

  getHotStatus() {
    try {
      return (typeof module !== 'undefined' && module.hot) ? module.hot.status() : 'unavailable';
    } catch (error) {
      return 'error';
    }
  }

  getWebpackHash() {
    try {
      return typeof __webpack_require__ !== 'undefined' ? __webpack_require__.h() : null;
    } catch (error) {
      return null;
    }
  }

  getCurrentChunks() {
    try {
      return typeof __webpack_require__ !== 'undefined' 
        ? Object.keys(__webpack_require__.hmrS_readFileVm || {})
        : ['index'];
    } catch (error) {
      return ['index'];
    }
  }

  getCurrentModules() {
    try {
      return typeof __webpack_require__ !== 'undefined'
        ? Object.keys(__webpack_require__.c || {})
        : [];
    } catch (error) {
      return [];
    }
  }

  prepareChunkMap(update) {
    return {
      index: update.script || 'exports.modules = {}; exports.runtime = function() {};'
    };
  }

  createMinimalScript() {
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
function createHMRClient(options) {
  return new HMRClient(options);
}

// Export the class and convenience function
module.exports = {
  HMRClient,
  createHMRClient
};