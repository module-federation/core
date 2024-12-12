/* eslint-disable */
//@ts-nocheck
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `yarn special-lint-fix` to update
 */

'use strict';

interface SharedPluginConfig {
  eager?: boolean;
  requiredVersion?: string | false;
  shareKey?: string;
  shareScope?: string;
  singleton?: boolean;
  strictVersion?: boolean;
  version?: string | false;
  layer?: string;
  request?: string;
}

interface ValidationError {
  params: {
    type?: string;
    additionalProperty?: string;
    missingProperty?: string;
  };
}

interface ValidationContext {
  instancePath?: string;
  parentData?: any;
  parentDataProperty?: any;
  rootData?: any;
}

// Validates a single shared plugin configuration
function validateSharedPluginConfig(
  config: any,
  context: ValidationContext = {},
): boolean {
  const {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = config,
  } = context;

  let errors: ValidationError[] | null = null;
  let errorCount = 0;

  // Helper to add validation errors
  const addError = (error: ValidationError) => {
    if (errors === null) {
      errors = [error];
    } else {
      errors.push(error);
    }
    errorCount++;
  };

  // Validate object type
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    addError({ params: { type: 'object' } });
    validateSharedPluginConfig.errors = errors;
    return false;
  }

  // Validate properties
  const validProperties = [
    'eager',
    'requiredVersion',
    'shareKey',
    'shareScope',
    'singleton',
    'strictVersion',
    'version',
    'layer',
    'request',
  ];

  // Check for invalid properties
  for (const prop in config) {
    if (!validProperties.includes(prop)) {
      addError({ params: { additionalProperty: prop } });
      break;
    }
  }

  // Validate string properties with minimum length
  const stringProps = ['request', 'shareKey', 'shareScope', 'layer'];
  for (const prop of stringProps) {
    if (config[prop] !== undefined) {
      if (typeof config[prop] !== 'string') {
        addError({ params: { type: 'string' } });
      } else if (config[prop].length < 1) {
        addError({ params: {} });
      }
    }
  }

  // Validate boolean properties
  const booleanProps = ['eager', 'singleton', 'strictVersion'];
  for (const prop of booleanProps) {
    if (config[prop] !== undefined && typeof config[prop] !== 'boolean') {
      addError({ params: { type: 'boolean' } });
    }
  }

  // Validate version-like properties that can be string or false
  const versionProps = ['requiredVersion', 'version'];
  for (const prop of versionProps) {
    if (config[prop] !== undefined) {
      if (config[prop] !== false && typeof config[prop] !== 'string') {
        addError({ params: {} });
      }
    }
  }

  validateSharedPluginConfig.errors = errors;
  return errorCount === 0;
}

// Validates a provides item (string or object)
function validateProvidesItem(
  item: any,
  context: ValidationContext = {},
): boolean {
  // String validation
  if (typeof item === 'string') {
    if (item.length < 1) {
      validateProvidesItem.errors = [{ params: {} }];
      return false;
    }
    return true;
  }

  // Config object validation
  if (typeof item === 'object' && !Array.isArray(item)) {
    return validateSharedPluginConfig(item, context);
  }

  validateProvidesItem.errors = [{ params: {} }];
  return false;
}

// Validates an array of shared plugin configurations or a single configuration
function validateSharedPlugins(
  input: any,
  context: ValidationContext = {},
): boolean {
  const {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = input,
  } = context;

  let errors: ValidationError[] | null = null;
  let errorCount = 0;

  // Helper to add validation errors
  const addError = (error: ValidationError) => {
    if (errors === null) {
      errors = [error];
    } else {
      errors.push(error);
    }
    errorCount++;
  };

  // Array validation
  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i++) {
      const item = input[i];

      // Validate string items
      if (typeof item === 'string') {
        if (item.length < 1) {
          addError({ params: {} });
        }
        continue;
      }

      // Validate object items (could be a provides object with key-value pairs)
      if (typeof item === 'object' && !Array.isArray(item)) {
        for (const key in item) {
          if (
            !validateProvidesItem(item[key], {
              instancePath: `${instancePath}/${i}/${key}`,
              parentData: item,
              parentDataProperty: key,
              rootData,
            })
          ) {
            errors = errors || [];
            errors.push(...(validateProvidesItem.errors || []));
            errorCount++;
          }
        }
        continue;
      }

      addError({ params: {} });
    }
  }
  // Object validation (key-value pairs of provides)
  else if (typeof input === 'object' && !Array.isArray(input)) {
    for (const key in input) {
      const value = input[key];
      if (
        !validateProvidesItem(value, {
          instancePath: `${instancePath}/${key}`,
          parentData: input,
          parentDataProperty: key,
          rootData,
        })
      ) {
        errors = errors || [];
        errors.push(...(validateProvidesItem.errors || []));
        errorCount++;
      }
    }
  }
  // Invalid type
  else {
    addError({ params: { type: 'object' } });
  }

  validateSharedPlugins.errors = errors;
  return errorCount === 0;
}

// Main validation function for provider shared plugin
function validateProviderSharedPlugin(
  config: any,
  context: ValidationContext = {},
): boolean {
  const {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = config,
  } = context;

  let errors: ValidationError[] | null = null;
  let errorCount = 0;

  // Validate object type
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    validateProviderSharedPlugin.errors = [
      {
        params: { type: 'object' },
      },
    ];
    return false;
  }

  // Check required properties
  if (config.provides === undefined) {
    validateProviderSharedPlugin.errors = [
      {
        params: { missingProperty: 'provides' },
      },
    ];
    return false;
  }

  // Check for invalid properties
  const validProperties = ['provides', 'shareScope'];
  for (const prop in config) {
    if (!validProperties.includes(prop)) {
      validateProviderSharedPlugin.errors = [
        {
          params: { additionalProperty: prop },
        },
      ];
      return false;
    }
  }

  // Validate provides array/object
  if (
    !validateSharedPlugins(config.provides, {
      instancePath: `${instancePath}/provides`,
      parentData: config,
      parentDataProperty: 'provides',
      rootData,
    })
  ) {
    errors = validateSharedPlugins.errors;
    errorCount++;
  }

  // Validate shareScope if present
  if (config.shareScope !== undefined) {
    if (typeof config.shareScope !== 'string') {
      validateProviderSharedPlugin.errors = [
        {
          params: { type: 'string' },
        },
      ];
      return false;
    }
    if (config.shareScope.length < 1) {
      validateProviderSharedPlugin.errors = [
        {
          params: {},
        },
      ];
      return false;
    }
  }

  validateProviderSharedPlugin.errors = errors;
  return errorCount === 0;
}

export default validateProviderSharedPlugin;
