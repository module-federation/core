import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const memoize = require(
  normalizeWebpackPath('webpack/lib/util/memoize'),
) as typeof import('webpack/lib/util/memoize');

type CheckError = {
  instancePath?: string;
  keyword?: string;
  message?: string;
  params?: Record<string, unknown>;
};

type SchemaCheck = ((value: unknown) => boolean) & {
  errors?: CheckError[] | null;
};

const formatCheckError = (error: CheckError, baseDataPath: string): string => {
  const instancePath = error.instancePath || '';
  const path = `${baseDataPath}${instancePath}`;
  const keyword = error.keyword ? ` (${error.keyword})` : '';
  if (error.message) {
    return `- ${path}${keyword}: ${error.message}`;
  }
  if (error.params && Object.keys(error.params).length > 0) {
    return `- ${path}${keyword}: ${JSON.stringify(error.params)}`;
  }
  return `- ${path}${keyword}`;
};

/**
 * @template {object | object[]} T
 * @param {(function(T): boolean) | undefined} check check
 * @param {() => JsonObject} getSchema get schema fn
 * @param {ValidationErrorConfiguration} options options
 * @returns {function(T=): void} validate
 */
const createSchemaValidation = (
  check: ((value: any) => boolean) | undefined,
  getSchema: () => any,
  options: any,
) => {
  getSchema = memoize(getSchema);
  //@ts-ignore
  return (value) => {
    if (check && !check(/** @type {T} */ value)) {
      const baseDataPath =
        typeof options?.baseDataPath === 'string'
          ? options.baseDataPath
          : 'options';
      const errors = (check as SchemaCheck).errors || [];
      const details = errors.map((error) =>
        formatCheckError(error, baseDataPath),
      );
      const prefix =
        typeof options?.name === 'string' ? `${options.name}: ` : '';
      const message =
        details.length > 0
          ? `${prefix}Invalid options object.\n${details.join('\n')}`
          : `${prefix}Invalid options object.`;
      const error = new Error(message);
      error.name = 'ValidationError';
      throw error;
    }
  };
};

export { createSchemaValidation };
