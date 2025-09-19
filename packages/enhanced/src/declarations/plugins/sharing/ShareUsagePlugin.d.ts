/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `yarn special-lint-fix` to update
 */

/**
 * Options for the ShareUsagePlugin.
 */
export interface ShareUsagePluginOptions {
  /**
   * Share scope name used for all shared modules (defaults to 'default').
   */
  shareScope?: string | string[];

  /**
   * Output file path for the generated share usage report (defaults to 'share-usage.json').
   */
  outputFile?: string;

  /**
   * Include usage details for each shared module (defaults to true).
   */
  includeDetails?: boolean;

  /**
   * Include information about unused shared modules (defaults to true).
   */
  includeUnused?: boolean;
}
