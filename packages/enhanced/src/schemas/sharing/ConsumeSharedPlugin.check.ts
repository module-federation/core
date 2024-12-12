/* eslint-disable */
// This is a TypeScript rewrite of the schema validator

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
  parentDataProperty?: string | number;
  rootData?: any;
}

interface ConsumesConfig {
  eager?: boolean;
  import?: string | false;
  packageName?: string;
  requiredVersion?: string | false;
  shareKey?: string;
  shareScope?: string;
  singleton?: boolean;
  strictVersion?: boolean;
  issuerLayer?: string;
  layer?: string;
  request?: string;
}

interface ConsumesPluginOptions {
  consumes:
    | Array<string | Record<string, ConsumesConfig | string>>
    | Record<string, ConsumesConfig | string>;
  shareScope?: string;
}

// Add error property to function type
interface ValidationFunction extends Function {
  errors: ValidationError[] | null;
}

// Validate string with minimum length
function validateString(value: any, minLength: number = 1): boolean {
  return typeof value === 'string' && value.length >= minLength;
}

// Validate ConsumesConfig
const validateConsumesConfig: ValidationFunction = function (
  config: any,
  context: ValidationContext = {},
): boolean {
  let errors: ValidationError[] | null = null;

  // Check if it's an object
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    validateConsumesConfig.errors = [{ params: { type: 'object' } }];
    return false;
  }

  // Check for additional properties
  const validProps = [
    'eager',
    'import',
    'packageName',
    'requiredVersion',
    'shareKey',
    'shareScope',
    'singleton',
    'strictVersion',
    'issuerLayer',
    'layer',
    'request',
  ];

  for (const prop in config) {
    if (!validProps.includes(prop)) {
      validateConsumesConfig.errors = [
        { params: { additionalProperty: prop } },
      ];
      return false;
    }
  }

  // Validate each property
  if (config.eager !== undefined && typeof config.eager !== 'boolean') {
    validateConsumesConfig.errors = [{ params: { type: 'boolean' } }];
    return false;
  }

  if (
    config.import !== undefined &&
    config.import !== false &&
    !validateString(config.import)
  ) {
    validateConsumesConfig.errors = [{ params: { type: 'string' } }];
    return false;
  }

  if (config.packageName !== undefined && !validateString(config.packageName)) {
    validateConsumesConfig.errors = [{ params: { type: 'string' } }];
    return false;
  }

  if (
    config.requiredVersion !== undefined &&
    config.requiredVersion !== false &&
    !validateString(config.requiredVersion)
  ) {
    validateConsumesConfig.errors = [{ params: { type: 'string' } }];
    return false;
  }

  if (config.shareKey !== undefined && !validateString(config.shareKey)) {
    validateConsumesConfig.errors = [{ params: { type: 'string' } }];
    return false;
  }

  if (config.shareScope !== undefined && !validateString(config.shareScope)) {
    validateConsumesConfig.errors = [{ params: { type: 'string' } }];
    return false;
  }

  if (config.singleton !== undefined && typeof config.singleton !== 'boolean') {
    validateConsumesConfig.errors = [{ params: { type: 'boolean' } }];
    return false;
  }

  if (
    config.strictVersion !== undefined &&
    typeof config.strictVersion !== 'boolean'
  ) {
    validateConsumesConfig.errors = [{ params: { type: 'boolean' } }];
    return false;
  }

  if (config.issuerLayer !== undefined && !validateString(config.issuerLayer)) {
    validateConsumesConfig.errors = [{ params: { type: 'string' } }];
    return false;
  }

  if (config.layer !== undefined && !validateString(config.layer)) {
    validateConsumesConfig.errors = [{ params: { type: 'string' } }];
    return false;
  }

  if (config.request !== undefined && !validateString(config.request)) {
    validateConsumesConfig.errors = [{ params: { type: 'string' } }];
    return false;
  }

  validateConsumesConfig.errors = errors;
  return true;
};

// Validate ConsumesObject
const validateConsumesObject: ValidationFunction = function (
  obj: any,
  context: ValidationContext = {},
): boolean {
  let errors: ValidationError[] | null = null;

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    validateConsumesObject.errors = [{ params: { type: 'object' } }];
    return false;
  }

  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      if (!validateString(value)) {
        validateConsumesObject.errors = [{ params: { type: 'string' } }];
        return false;
      }
    } else if (
      !validateConsumesConfig(value, {
        ...context,
        instancePath: `${context.instancePath}/${key}`,
        parentData: obj,
        parentDataProperty: key,
      })
    ) {
      validateConsumesObject.errors = validateConsumesConfig.errors;
      return false;
    }
  }

  validateConsumesObject.errors = errors;
  return true;
};

// Validate Consumes array
const validateConsumesArray: ValidationFunction = function (
  arr: any,
  context: ValidationContext = {},
): boolean {
  let errors: ValidationError[] | null = null;

  if (!Array.isArray(arr)) {
    validateConsumesArray.errors = [{ params: { type: 'array' } }];
    return false;
  }

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (typeof item === 'string') {
      if (!validateString(item)) {
        validateConsumesArray.errors = [{ params: { type: 'string' } }];
        return false;
      }
    } else if (
      !validateConsumesObject(item, {
        ...context,
        instancePath: `${context.instancePath}/${i}`,
        parentData: arr,
        parentDataProperty: i,
      })
    ) {
      validateConsumesArray.errors = validateConsumesObject.errors;
      return false;
    }
  }

  validateConsumesArray.errors = errors;
  return true;
};

// Main validation function
const validate: ValidationFunction = function (
  data: any,
  context: ValidationContext = {},
): boolean {
  let errors: ValidationError[] | null = null;

  // Check if it's an object
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    validate.errors = [{ params: { type: 'object' } }];
    return false;
  }

  // Check required properties
  if (!data.hasOwnProperty('consumes')) {
    validate.errors = [{ params: { missingProperty: 'consumes' } }];
    return false;
  }

  // Check for additional properties
  for (const prop in data) {
    if (prop !== 'consumes' && prop !== 'shareScope') {
      validate.errors = [{ params: { additionalProperty: prop } }];
      return false;
    }
  }

  // Validate consumes
  if (Array.isArray(data.consumes)) {
    if (
      !validateConsumesArray(data.consumes, {
        ...context,
        instancePath: `${context.instancePath}/consumes`,
      })
    ) {
      validate.errors = validateConsumesArray.errors;
      return false;
    }
  } else if (
    !validateConsumesObject(data.consumes, {
      ...context,
      instancePath: `${context.instancePath}/consumes`,
    })
  ) {
    validate.errors = validateConsumesObject.errors;
    return false;
  }

  // Validate shareScope
  if (data.shareScope !== undefined && !validateString(data.shareScope)) {
    validate.errors = [{ params: { type: 'string' } }];
    return false;
  }

  validate.errors = errors;
  return true;
};

// Initialize errors property
validateConsumesConfig.errors = null;
validateConsumesObject.errors = null;
validateConsumesArray.errors = null;
validate.errors = null;

module.exports = validate;
module.exports.default = validate;
