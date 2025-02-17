/**
 * Error Handling Strategies for Module Federation
 *
 * This module provides different strategies for handling remote module loading errors.
 * Choose the strategy that best fits your needs:
 *
 * 1. Lifecycle-based Strategy:
 *    - Handles errors differently based on the lifecycle stage
 *    - Provides backup service support for entry file errors
 *    - More granular control over error handling
 *
 * 2. Simple Strategy:
 *    - Single fallback component for all error types
 *    - Consistent error presentation
 *    - Minimal configuration required
 *
 * Example usage:
 * ```typescript
 * import { createLifecycleBasedPlugin, createSimplePlugin } from './error-handling';
 *
 * // Use lifecycle-based strategy
 * const plugin1 = createLifecycleBasedPlugin({
 *   backupEntryUrl: 'http://backup-server/manifest.json',
 *   errorMessage: 'Custom error message'
 * });
 *
 * // Use simple strategy
 * const plugin2 = createSimplePlugin({
 *   errorMessage: 'Module failed to load'
 * });
 * ```
 */

export * from './lifecycle-based';
export * from './simple';
