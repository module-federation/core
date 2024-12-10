/* eslint-disable */

// This file contains validation schemas for Container Reference Plugin
// It validates the configuration for Module Federation remotes

// Types for the validation schemas
type ValidationError = {
  params: {
    type?: string;
    missingProperty?: string;
    additionalProperty?: string;
    passingSchemas?: number | null;
    allowedValues?: readonly string[] | string[];
    minLength?: number;
  };
};

type ValidationOptions = {
  instancePath?: string;
  parentData?: any;
  parentDataProperty?: any;
  rootData?: any;
};

type ValidateFunction = {
  (data: unknown, options?: ValidationOptions): boolean;
  errors: ValidationError[] | null;
};

// Utility function to create a validator with proper error handling
function createValidator<T extends ValidateFunction>(
  validator: (data: unknown, options?: ValidationOptions) => boolean,
): T {
  const validatorWithErrors = validator as T;
  validatorWithErrors.errors = null;
  return validatorWithErrors;
}

// Utility function to set validation error
function setValidationError(
  validator: ValidateFunction,
  error: ValidationError,
): false {
  validator.errors = [error];
  return false;
}

// Enum for supported external types in Module Federation
const EXTERNAL_TYPES = [
  'var',
  'module',
  'assign',
  'this',
  'window',
  'self',
  'global',
  'commonjs',
  'commonjs2',
  'commonjs-module',
  'commonjs-static',
  'amd',
  'amd-require',
  'umd',
  'umd2',
  'jsonp',
  'system',
  'promise',
  'import',
  'script',
  'node-commonjs',
] as const;

type ExternalsType = (typeof EXTERNAL_TYPES)[number];

const schema40 = {
  definitions: {
    ExternalsType: {
      enum: EXTERNAL_TYPES,
    },
    Remotes: {
      anyOf: [
        {
          type: 'array',
          items: {
            anyOf: [
              {
                $ref: '#/definitions/RemotesItem',
              },
              {
                $ref: '#/definitions/RemotesObject',
              },
            ],
          },
        },
        {
          $ref: '#/definitions/RemotesObject',
        },
      ],
    },
    RemotesConfig: {
      type: 'object',
      additionalProperties: false,
      properties: {
        external: {
          anyOf: [
            {
              $ref: '#/definitions/RemotesItem',
            },
            {
              $ref: '#/definitions/RemotesItems',
            },
          ],
        },
        shareScope: {
          type: 'string',
          minLength: 1,
        },
      },
      required: ['external'],
    },
    RemotesItem: {
      type: 'string',
      minLength: 1,
    },
    RemotesItems: {
      type: 'array',
      items: {
        $ref: '#/definitions/RemotesItem',
      },
    },
    RemotesObject: {
      type: 'object',
      additionalProperties: {
        anyOf: [
          {
            $ref: '#/definitions/RemotesConfig',
          },
          {
            $ref: '#/definitions/RemotesItem',
          },
          {
            $ref: '#/definitions/RemotesItems',
          },
        ],
      },
    },
  },
  type: 'object',
  additionalProperties: false,
  properties: {
    remoteType: {
      oneOf: [
        {
          $ref: '#/definitions/ExternalsType',
        },
      ],
    },
    remotes: {
      $ref: '#/definitions/Remotes',
    },
    shareScope: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['remoteType', 'remotes'],
};
const schema41 = {
  enum: [
    'var',
    'module',
    'assign',
    'this',
    'window',
    'self',
    'global',
    'commonjs',
    'commonjs2',
    'commonjs-module',
    'commonjs-static',
    'amd',
    'amd-require',
    'umd',
    'umd2',
    'jsonp',
    'system',
    'promise',
    'import',
    'script',
    'node-commonjs',
  ],
};
const schema42 = {
  anyOf: [
    {
      type: 'array',
      items: {
        anyOf: [
          {
            $ref: '#/definitions/RemotesItem',
          },
          {
            $ref: '#/definitions/RemotesObject',
          },
        ],
      },
    },
    {
      $ref: '#/definitions/RemotesObject',
    },
  ],
};
const schema43 = {
  type: 'string',
  minLength: 1,
};
const schema44 = {
  type: 'object',
  additionalProperties: {
    anyOf: [
      {
        $ref: '#/definitions/RemotesConfig',
      },
      {
        $ref: '#/definitions/RemotesItem',
      },
      {
        $ref: '#/definitions/RemotesItems',
      },
    ],
  },
};
const schema45 = {
  type: 'object',
  additionalProperties: false,
  properties: {
    external: {
      anyOf: [
        {
          $ref: '#/definitions/RemotesItem',
        },
        {
          $ref: '#/definitions/RemotesItems',
        },
      ],
    },
    name: {
      type: 'string',
      minLength: 1,
    },
    shareScope: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['external'],
};
const schema47 = {
  type: 'array',
  items: {
    $ref: '#/definitions/RemotesItem',
  },
};
/**
 * Validates an array of non-empty strings
 */
const validateNonEmptyStringArray = createValidator<ValidateFunction>(
  (data: unknown, options: ValidationOptions = {}): boolean => {
    if (!Array.isArray(data)) {
      return setValidationError(validateNonEmptyStringArray, {
        params: { type: 'array' },
      });
    }

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (typeof item !== 'string') {
        return setValidationError(validateNonEmptyStringArray, {
          params: { type: 'string' },
        });
      }

      if (item.length < 1) {
        return setValidationError(validateNonEmptyStringArray, {
          params: { minLength: 1 },
        });
      }
    }

    validateNonEmptyStringArray.errors = null;
    return true;
  },
);

/**
 * Validates a RemotesConfig object
 */
const validateRemotesConfig = createValidator<ValidateFunction>(
  (data: unknown, options: ValidationOptions = {}): boolean => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return setValidationError(validateRemotesConfig, {
        params: { type: 'object' },
      });
    }

    const config = data as Record<string, unknown>;

    if (!('external' in config)) {
      return setValidationError(validateRemotesConfig, {
        params: { missingProperty: 'external' },
      });
    }

    const validKeys = ['external', 'shareScope'];
    for (const key in config) {
      if (!validKeys.includes(key)) {
        return setValidationError(validateRemotesConfig, {
          params: { additionalProperty: key },
        });
      }
    }

    const { external, shareScope } = config;

    if (typeof external === 'string') {
      if (external.length < 1) {
        return setValidationError(validateRemotesConfig, {
          params: { minLength: 1 },
        });
      }
    } else if (Array.isArray(external)) {
      if (
        !validateNonEmptyStringArray(external, {
          ...options,
          instancePath: `${options.instancePath}/external`,
          parentData: data,
          parentDataProperty: 'external',
        })
      ) {
        validateRemotesConfig.errors = validateNonEmptyStringArray.errors;
        return false;
      }
    } else {
      return setValidationError(validateRemotesConfig, {
        params: { type: 'string or array' },
      });
    }

    if (shareScope !== undefined) {
      if (typeof shareScope !== 'string' || shareScope.length < 1) {
        return setValidationError(validateRemotesConfig, {
          params: { type: 'string', minLength: 1 },
        });
      }
    }

    validateRemotesConfig.errors = null;
    return true;
  },
);

/**
 * Validates a RemotesObject which is an object where each value must be either:
 * - A RemotesConfig
 * - A RemotesItem (string)
 * - A RemotesItems (array of strings)
 */
const validateRemotesObject = createValidator<ValidateFunction>(
  (data: unknown, options: ValidationOptions = {}): boolean => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return setValidationError(validateRemotesObject, {
        params: { type: 'object' },
      });
    }

    for (const key in data) {
      const value = (data as any)[key];
      const valuePath = `${options.instancePath}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;

      const isRemotesConfig = validateRemotesConfig(value, {
        ...options,
        instancePath: valuePath,
        parentData: data,
        parentDataProperty: key,
      });

      if (isRemotesConfig) {
        continue;
      }

      if (typeof value === 'string' && value.length >= 1) {
        continue;
      }

      const isRemotesItems = validateNonEmptyStringArray(value, {
        ...options,
        instancePath: valuePath,
        parentData: data,
        parentDataProperty: key,
      });

      if (isRemotesItems) {
        continue;
      }

      return setValidationError(validateRemotesObject, {
        params: { type: 'RemotesConfig | string | string[]' },
      });
    }

    validateRemotesObject.errors = null;
    return true;
  },
);

/**
 * Validates Remotes which can be either:
 * - An array of RemotesItems/RemotesObjects
 * - A RemotesObject
 */
const validateRemotes = createValidator<ValidateFunction>(
  (data: unknown, options: ValidationOptions = {}): boolean => {
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const itemPath = `${options.instancePath}/${i}`;

        if (typeof item === 'string') {
          if (item.length < 1) {
            return setValidationError(validateRemotes, {
              params: { minLength: 1 },
            });
          }
          continue;
        }

        const isValidRemotesObject = validateRemotesObject(item, {
          ...options,
          instancePath: itemPath,
          parentData: data,
          parentDataProperty: i,
        });

        if (!isValidRemotesObject) {
          validateRemotes.errors = validateRemotesObject.errors;
          return false;
        }
      }
      return true;
    }

    const isValidRemotesObject = validateRemotesObject(data, {
      ...options,
      instancePath: options.instancePath,
    });

    if (!isValidRemotesObject) {
      validateRemotes.errors = validateRemotesObject.errors;
      return false;
    }

    validateRemotes.errors = null;
    return true;
  },
);

/**
 * Main validation function for Container Reference Plugin configuration
 */
const validateContainerReferencePluginConfig =
  createValidator<ValidateFunction>(
    (data: unknown, options: ValidationOptions = {}): boolean => {
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return setValidationError(validateContainerReferencePluginConfig, {
          params: { type: 'object' },
        });
      }

      const config = data as Record<string, unknown>;
      const requiredProps = ['remoteType', 'remotes'];

      for (const prop of requiredProps) {
        if (!(prop in config)) {
          return setValidationError(validateContainerReferencePluginConfig, {
            params: { missingProperty: prop },
          });
        }
      }

      const allowedProps = ['remoteType', 'remotes', 'shareScope'];
      for (const key in config) {
        if (!allowedProps.includes(key)) {
          return setValidationError(validateContainerReferencePluginConfig, {
            params: { additionalProperty: key },
          });
        }
      }

      const { remoteType, remotes, shareScope } = config;

      if (!EXTERNAL_TYPES.includes(remoteType as ExternalsType)) {
        return setValidationError(validateContainerReferencePluginConfig, {
          params: {
            type: 'ExternalsType',
            allowedValues: [...EXTERNAL_TYPES],
          },
        });
      }

      if (
        !validateRemotes(remotes, {
          ...options,
          instancePath: `${options.instancePath}/remotes`,
          parentData: data,
          parentDataProperty: 'remotes',
        })
      ) {
        validateContainerReferencePluginConfig.errors = validateRemotes.errors;
        return false;
      }

      if (shareScope !== undefined) {
        if (typeof shareScope !== 'string' || shareScope.length < 1) {
          return setValidationError(validateContainerReferencePluginConfig, {
            params: { type: 'string', minLength: 1 },
          });
        }
      }

      validateContainerReferencePluginConfig.errors = null;
      return true;
    },
  );

export default validateContainerReferencePluginConfig;
