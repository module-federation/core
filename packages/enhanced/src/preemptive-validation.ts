/**
 * Preemptive Validation Strategies for Module Federation
 *
 * Catches errors early through comprehensive validation before they can cause
 * runtime failures. Includes manifest validation, dependency checking, and
 * proactive health monitoring.
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

export interface ValidationConfig {
  /** Enable manifest structure validation */
  validateManifest?: boolean;
  /** Enable dependency compatibility checking */
  validateDependencies?: boolean;
  /** Enable remote endpoint health checks */
  validateEndpoints?: boolean;
  /** Enable version compatibility validation */
  validateVersions?: boolean;
  /** Enable shared module validation */
  validateSharedModules?: boolean;
  /** Validation timeout (ms) */
  validationTimeout?: number;
  /** Parallel validation threads */
  parallelValidation?: boolean;
  /** Custom validation rules */
  customValidators?: ValidationRule[];
  /** Validation cache duration (ms) */
  cacheDuration?: number;
  /** Enable detailed logging */
  enableLogging?: boolean;
  /** Fail fast on validation errors */
  failFast?: boolean;
  /** Validation retry attempts */
  retryAttempts?: number;
}

export interface ValidationRule {
  name: string;
  priority: 'high' | 'medium' | 'low';
  validator: (
    context: ValidationContext,
  ) => Promise<ValidationResult> | ValidationResult;
}

export interface ValidationContext {
  url: string;
  manifest?: any;
  moduleName: string;
  dependencies?: Record<string, string>;
  remoteEntry?: string;
  shared?: any[];
  exposes?: any[];
  metadata?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
  details?: Record<string, any>;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'critical' | 'major' | 'minor';
  field?: string;
  value?: any;
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  value?: any;
  suggestion?: string;
}

/**
 * Built-in validation rules
 */
const BUILT_IN_VALIDATORS: ValidationRule[] = [
  {
    name: 'manifest-structure',
    priority: 'high',
    validator: validateManifestStructure,
  },
  {
    name: 'required-fields',
    priority: 'high',
    validator: validateRequiredFields,
  },
  {
    name: 'metadata-integrity',
    priority: 'medium',
    validator: validateMetadataIntegrity,
  },
  {
    name: 'expose-definitions',
    priority: 'medium',
    validator: validateExposeDefinitions,
  },
  {
    name: 'shared-dependencies',
    priority: 'medium',
    validator: validateSharedDependencies,
  },
  {
    name: 'version-compatibility',
    priority: 'low',
    validator: validateVersionCompatibility,
  },
  {
    name: 'remote-entry-accessibility',
    priority: 'high',
    validator: validateRemoteEntryAccessibility,
  },
  {
    name: 'asset-availability',
    priority: 'medium',
    validator: validateAssetAvailability,
  },
];

/**
 * Manifest structure validation
 */
async function validateManifestStructure(
  context: ValidationContext,
): Promise<ValidationResult> {
  const { manifest } = context;
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!manifest || typeof manifest !== 'object') {
    errors.push({
      code: 'INVALID_MANIFEST_TYPE',
      message: 'Manifest must be a valid JSON object',
      severity: 'critical',
      suggestion: 'Ensure the manifest.json file contains valid JSON',
    });
    return { valid: false, errors, warnings, score: 0 };
  }

  // Check for null prototype pollution
  if (Object.getPrototypeOf(manifest) !== Object.prototype) {
    warnings.push({
      code: 'PROTOTYPE_POLLUTION_RISK',
      message: 'Manifest object has non-standard prototype',
      suggestion: 'Use JSON.parse() to create clean objects',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: errors.length === 0 ? 100 : 50,
  };
}

/**
 * Required fields validation
 */
async function validateRequiredFields(
  context: ValidationContext,
): Promise<ValidationResult> {
  const { manifest } = context;
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const requiredFields = ['id', 'name', 'metaData', 'exposes', 'shared'];
  const missingFields = requiredFields.filter((field) => !(field in manifest));

  missingFields.forEach((field) => {
    errors.push({
      code: 'MISSING_REQUIRED_FIELD',
      message: `Required field '${field}' is missing`,
      severity: 'critical',
      field,
      suggestion: `Add the '${field}' field to your manifest`,
    });
  });

  // Check metaData required fields
  if (manifest.metaData) {
    const requiredMetaFields = ['name', 'type', 'remoteEntry', 'publicPath'];
    const missingMetaFields = requiredMetaFields.filter(
      (field) => !(field in manifest.metaData),
    );

    missingMetaFields.forEach((field) => {
      errors.push({
        code: 'MISSING_REQUIRED_META_FIELD',
        message: `Required metaData field '${field}' is missing`,
        severity: 'major',
        field: `metaData.${field}`,
        suggestion: `Add the '${field}' field to your metaData`,
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - errors.length * 20),
  };
}

/**
 * Metadata integrity validation
 */
async function validateMetadataIntegrity(
  context: ValidationContext,
): Promise<ValidationResult> {
  const { manifest } = context;
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!manifest.metaData) {
    return { valid: true, errors, warnings, score: 100 };
  }

  const { metaData } = manifest;

  // Validate build info
  if (metaData.buildInfo) {
    if (!metaData.buildInfo.buildVersion) {
      warnings.push({
        code: 'MISSING_BUILD_VERSION',
        message: 'Build version is missing from buildInfo',
        field: 'metaData.buildInfo.buildVersion',
        suggestion: 'Add build version for better debugging',
      });
    }

    if (!metaData.buildInfo.buildName) {
      warnings.push({
        code: 'MISSING_BUILD_NAME',
        message: 'Build name is missing from buildInfo',
        field: 'metaData.buildInfo.buildName',
        suggestion: 'Add build name for identification',
      });
    }
  }

  // Validate remote entry
  if (metaData.remoteEntry) {
    if (!metaData.remoteEntry.name) {
      errors.push({
        code: 'MISSING_REMOTE_ENTRY_NAME',
        message: 'Remote entry name is required',
        severity: 'major',
        field: 'metaData.remoteEntry.name',
        suggestion: 'Specify the remote entry filename',
      });
    }

    if (!metaData.remoteEntry.type) {
      warnings.push({
        code: 'MISSING_REMOTE_ENTRY_TYPE',
        message: 'Remote entry type is recommended',
        field: 'metaData.remoteEntry.type',
        suggestion: 'Specify "esm" or "var" for better compatibility',
      });
    }
  }

  // Validate plugin version
  if (!metaData.pluginVersion) {
    warnings.push({
      code: 'MISSING_PLUGIN_VERSION',
      message: 'Plugin version is missing',
      field: 'metaData.pluginVersion',
      suggestion: 'Add plugin version for compatibility tracking',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - errors.length * 15 - warnings.length * 5),
  };
}

/**
 * Expose definitions validation
 */
async function validateExposeDefinitions(
  context: ValidationContext,
): Promise<ValidationResult> {
  const { manifest } = context;
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!Array.isArray(manifest.exposes)) {
    errors.push({
      code: 'INVALID_EXPOSES_TYPE',
      message: 'Exposes must be an array',
      severity: 'major',
      field: 'exposes',
      suggestion: 'Change exposes to an array of exposed modules',
    });
    return { valid: false, errors, warnings, score: 0 };
  }

  manifest.exposes.forEach((expose: any, index: number) => {
    if (!expose.id) {
      errors.push({
        code: 'MISSING_EXPOSE_ID',
        message: `Expose at index ${index} is missing id`,
        severity: 'major',
        field: `exposes[${index}].id`,
        suggestion: 'Add unique id for each exposed module',
      });
    }

    if (!expose.name) {
      errors.push({
        code: 'MISSING_EXPOSE_NAME',
        message: `Expose at index ${index} is missing name`,
        severity: 'major',
        field: `exposes[${index}].name`,
        suggestion: 'Add name for each exposed module',
      });
    }

    if (!expose.path) {
      errors.push({
        code: 'MISSING_EXPOSE_PATH',
        message: `Expose at index ${index} is missing path`,
        severity: 'major',
        field: `exposes[${index}].path`,
        suggestion: 'Add path for each exposed module',
      });
    }

    // Validate assets
    if (expose.assets) {
      if (!expose.assets.js || !expose.assets.css) {
        warnings.push({
          code: 'INCOMPLETE_EXPOSE_ASSETS',
          message: `Expose at index ${index} has incomplete assets`,
          field: `exposes[${index}].assets`,
          suggestion: 'Ensure both js and css assets are defined',
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - errors.length * 10 - warnings.length * 3),
  };
}

/**
 * Shared dependencies validation
 */
async function validateSharedDependencies(
  context: ValidationContext,
): Promise<ValidationResult> {
  const { manifest } = context;
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!Array.isArray(manifest.shared)) {
    warnings.push({
      code: 'INVALID_SHARED_TYPE',
      message: 'Shared should be an array',
      field: 'shared',
      suggestion: 'Change shared to an array of shared dependencies',
    });
    return { valid: true, errors, warnings, score: 80 };
  }

  manifest.shared.forEach((shared: any, index: number) => {
    if (!shared.id) {
      errors.push({
        code: 'MISSING_SHARED_ID',
        message: `Shared dependency at index ${index} is missing id`,
        severity: 'major',
        field: `shared[${index}].id`,
        suggestion: 'Add unique id for each shared dependency',
      });
    }

    if (!shared.name) {
      errors.push({
        code: 'MISSING_SHARED_NAME',
        message: `Shared dependency at index ${index} is missing name`,
        severity: 'major',
        field: `shared[${index}].name`,
        suggestion: 'Add name for each shared dependency',
      });
    }

    if (!shared.version) {
      warnings.push({
        code: 'MISSING_SHARED_VERSION',
        message: `Shared dependency at index ${index} is missing version`,
        field: `shared[${index}].version`,
        suggestion: 'Add version for better compatibility checking',
      });
    }

    // Validate version format
    if (shared.version && !isValidSemver(shared.version)) {
      warnings.push({
        code: 'INVALID_VERSION_FORMAT',
        message: `Shared dependency at index ${index} has invalid version format`,
        field: `shared[${index}].version`,
        value: shared.version,
        suggestion: 'Use valid semver format (e.g., "1.0.0")',
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - errors.length * 10 - warnings.length * 2),
  };
}

/**
 * Version compatibility validation
 */
async function validateVersionCompatibility(
  context: ValidationContext,
): Promise<ValidationResult> {
  const { manifest } = context;
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // This is a basic implementation - you'd extend this based on your needs
  if (manifest.metaData?.pluginVersion) {
    const version = manifest.metaData.pluginVersion;
    if (!isValidSemver(version)) {
      warnings.push({
        code: 'INVALID_PLUGIN_VERSION',
        message: 'Plugin version format is invalid',
        field: 'metaData.pluginVersion',
        value: version,
        suggestion: 'Use valid semver format',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - warnings.length * 5),
  };
}

/**
 * Remote entry accessibility validation
 */
async function validateRemoteEntryAccessibility(
  context: ValidationContext,
): Promise<ValidationResult> {
  const { manifest, url } = context;
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!manifest.metaData?.remoteEntry?.name) {
    return { valid: true, errors, warnings, score: 100 };
  }

  try {
    const baseUrl = url.replace(/\/[^\/]*$/, '');
    const remoteEntryUrl = `${baseUrl}/${manifest.metaData.remoteEntry.name}`;

    // Quick HEAD request to check accessibility
    const response = await fetch(remoteEntryUrl, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      errors.push({
        code: 'REMOTE_ENTRY_NOT_ACCESSIBLE',
        message: `Remote entry file is not accessible: ${response.status}`,
        severity: 'critical',
        field: 'metaData.remoteEntry.name',
        value: remoteEntryUrl,
        suggestion:
          'Ensure the remote entry file is properly built and accessible',
      });
    }
  } catch (error) {
    warnings.push({
      code: 'REMOTE_ENTRY_CHECK_FAILED',
      message: 'Could not verify remote entry accessibility',
      field: 'metaData.remoteEntry.name',
      suggestion: 'Check network connectivity and file availability',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - errors.length * 30 - warnings.length * 10),
  };
}

/**
 * Asset availability validation
 */
async function validateAssetAvailability(
  context: ValidationContext,
): Promise<ValidationResult> {
  const { manifest, url } = context;
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!Array.isArray(manifest.exposes)) {
    return { valid: true, errors, warnings, score: 100 };
  }

  const baseUrl = url.replace(/\/[^\/]*$/, '');
  const assetChecks: Promise<void>[] = [];

  manifest.exposes.forEach((expose: any, index: number) => {
    if (expose.assets?.js?.sync) {
      expose.assets.js.sync.forEach((asset: string) => {
        assetChecks.push(
          checkAssetAvailability(`${baseUrl}/${asset}`)
            .then((available) => {
              if (!available) {
                warnings.push({
                  code: 'ASSET_NOT_AVAILABLE',
                  message: `JS asset not available: ${asset}`,
                  field: `exposes[${index}].assets.js.sync`,
                  value: asset,
                  suggestion:
                    'Ensure all referenced assets are built and available',
                });
              }
            })
            .catch(() => {
              warnings.push({
                code: 'ASSET_CHECK_FAILED',
                message: `Could not verify JS asset: ${asset}`,
                field: `exposes[${index}].assets.js.sync`,
                value: asset,
                suggestion: 'Check network connectivity and asset availability',
              });
            }),
        );
      });
    }
  });

  // Wait for all asset checks (with timeout)
  try {
    await Promise.allSettled(assetChecks);
  } catch (error) {
    // Asset checks failed, but this shouldn't break validation
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - warnings.length * 5),
  };
}

/**
 * Check if asset is available
 */
async function checkAssetAvailability(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Simple semver validation
 */
function isValidSemver(version: string): boolean {
  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(version);
}

/**
 * Preemptive validation engine
 */
class ValidationEngine {
  private validationCache = new Map<
    string,
    { result: ValidationResult; timestamp: number }
  >();
  private activeValidations = new Map<string, Promise<ValidationResult>>();

  constructor(private config: Required<ValidationConfig>) {}

  async validateManifest(
    url: string,
    manifest: any,
  ): Promise<ValidationResult> {
    const cacheKey = `${url}:${JSON.stringify(manifest).substring(0, 100)}`;

    // Check cache first
    if (this.config.cacheDuration > 0) {
      const cached = this.validationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
        if (this.config.enableLogging) {
          console.log(
            `[PreemptiveValidation] Using cached validation for ${url}`,
          );
        }
        return cached.result;
      }
    }

    // Check if validation is already in progress
    if (this.activeValidations.has(cacheKey)) {
      return this.activeValidations.get(cacheKey)!;
    }

    // Start new validation
    const validationPromise = this.performValidation(url, manifest);
    this.activeValidations.set(cacheKey, validationPromise);

    try {
      const result = await validationPromise;

      // Cache result
      if (this.config.cacheDuration > 0) {
        this.validationCache.set(cacheKey, { result, timestamp: Date.now() });
      }

      return result;
    } finally {
      this.activeValidations.delete(cacheKey);
    }
  }

  private async performValidation(
    url: string,
    manifest: any,
  ): Promise<ValidationResult> {
    const context: ValidationContext = {
      url,
      manifest,
      moduleName: manifest.name || 'unknown',
      dependencies: manifest.dependencies,
      remoteEntry: manifest.metaData?.remoteEntry?.name,
      shared: manifest.shared,
      exposes: manifest.exposes,
      metadata: manifest.metaData,
    };

    const validators = [
      ...BUILT_IN_VALIDATORS,
      ...this.config.customValidators,
    ];
    const results: ValidationResult[] = [];

    if (this.config.parallelValidation) {
      // Run validations in parallel
      const validationPromises = validators.map(async (validator) => {
        try {
          const result = await Promise.race([
            validator.validator(context),
            new Promise<ValidationResult>((_, reject) =>
              setTimeout(
                () => reject(new Error('Validation timeout')),
                this.config.validationTimeout,
              ),
            ),
          ]);
          return { validator: validator.name, result };
        } catch (error) {
          if (this.config.enableLogging) {
            console.warn(
              `[PreemptiveValidation] Validator ${validator.name} failed:`,
              error.message,
            );
          }
          return {
            validator: validator.name,
            result: {
              valid: false,
              errors: [
                {
                  code: 'VALIDATOR_ERROR',
                  message: `Validator ${validator.name} failed: ${error.message}`,
                  severity: 'minor' as const,
                },
              ],
              warnings: [],
              score: 0,
            },
          };
        }
      });

      const validationResults = await Promise.allSettled(validationPromises);
      results.push(
        ...validationResults
          .filter(
            (
              result,
            ): result is PromiseFulfilledResult<{
              validator: string;
              result: ValidationResult;
            }> => result.status === 'fulfilled',
          )
          .map((result) => result.value.result),
      );
    } else {
      // Run validations sequentially
      for (const validator of validators) {
        try {
          const result = await validator.validator(context);
          results.push(result);

          // Fail fast if enabled and critical error found
          if (
            this.config.failFast &&
            !result.valid &&
            result.errors.some((e) => e.severity === 'critical')
          ) {
            break;
          }
        } catch (error) {
          if (this.config.enableLogging) {
            console.warn(
              `[PreemptiveValidation] Validator ${validator.name} failed:`,
              error.message,
            );
          }

          if (this.config.failFast) {
            results.push({
              valid: false,
              errors: [
                {
                  code: 'VALIDATOR_ERROR',
                  message: `Validator ${validator.name} failed: ${error.message}`,
                  severity: 'critical',
                },
              ],
              warnings: [],
              score: 0,
            });
            break;
          }
        }
      }
    }

    // Combine results
    return this.combineValidationResults(results);
  }

  private combineValidationResults(
    results: ValidationResult[],
  ): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    let totalScore = 0;

    results.forEach((result) => {
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
      totalScore += result.score;
    });

    const averageScore = results.length > 0 ? totalScore / results.length : 0;
    const hasErrors = allErrors.length > 0;
    const hasCriticalErrors = allErrors.some((e) => e.severity === 'critical');

    return {
      valid: !hasErrors,
      errors: allErrors,
      warnings: allWarnings,
      score: hasCriticalErrors ? 0 : averageScore,
      details: {
        totalValidators: results.length,
        criticalErrors: allErrors.filter((e) => e.severity === 'critical')
          .length,
        majorErrors: allErrors.filter((e) => e.severity === 'major').length,
        minorErrors: allErrors.filter((e) => e.severity === 'minor').length,
        warnings: allWarnings.length,
      },
    };
  }

  clearCache(): void {
    this.validationCache.clear();
  }

  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.validationCache.size,
      hitRate: 0, // Would need to track hits/misses to calculate
    };
  }
}

/**
 * Creates preemptive validation plugin
 */
export function createPreemptiveValidationPlugin(
  config: ValidationConfig = {},
): ModuleFederationRuntimePlugin {
  const fullConfig: Required<ValidationConfig> = {
    validateManifest: true,
    validateDependencies: true,
    validateEndpoints: true,
    validateVersions: true,
    validateSharedModules: true,
    validationTimeout: 10000,
    parallelValidation: true,
    customValidators: [],
    cacheDuration: 300000, // 5 minutes
    enableLogging: true,
    failFast: false,
    retryAttempts: 2,
    ...config,
  };

  const engine = new ValidationEngine(fullConfig);

  return {
    name: 'preemptive-validation-plugin',

    async fetch(url, options) {
      // Only validate manifest requests
      if (!url.includes('manifest.json') && !url.includes('mf-manifest.json')) {
        return;
      }

      try {
        // Fetch the manifest first
        const response = await fetch(url, options);
        if (!response.ok) {
          return response;
        }

        const manifest = await response.clone().json();

        // Validate the manifest
        const validationResult = await engine.validateManifest(url, manifest);

        if (fullConfig.enableLogging) {
          console.log(`[PreemptiveValidation] Validation result for ${url}:`, {
            valid: validationResult.valid,
            score: validationResult.score,
            errors: validationResult.errors.length,
            warnings: validationResult.warnings.length,
          });
        }

        // Log errors and warnings
        if (validationResult.errors.length > 0) {
          console.error(
            `[PreemptiveValidation] Validation errors for ${url}:`,
            validationResult.errors,
          );
        }

        if (validationResult.warnings.length > 0 && fullConfig.enableLogging) {
          console.warn(
            `[PreemptiveValidation] Validation warnings for ${url}:`,
            validationResult.warnings,
          );
        }

        // Decide whether to proceed based on validation result
        if (!validationResult.valid && fullConfig.failFast) {
          const criticalErrors = validationResult.errors.filter(
            (e) => e.severity === 'critical',
          );
          if (criticalErrors.length > 0) {
            throw new Error(
              `Manifest validation failed with critical errors: ${criticalErrors.map((e) => e.message).join(', ')}`,
            );
          }
        }

        return response;
      } catch (error) {
        if (fullConfig.enableLogging) {
          console.error(
            `[PreemptiveValidation] Validation failed for ${url}:`,
            error.message,
          );
        }
        throw error;
      }
    },
  };
}

/**
 * Pre-configured validation plugin for common scenarios
 */
export const comprehensiveValidationPlugin = createPreemptiveValidationPlugin({
  validateManifest: true,
  validateDependencies: true,
  validateEndpoints: false, // Disable by default to avoid network overhead
  validateVersions: true,
  validateSharedModules: true,
  parallelValidation: true,
  cacheDuration: 300000,
  enableLogging: true,
  failFast: false,
});
