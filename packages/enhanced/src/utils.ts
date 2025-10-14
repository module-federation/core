import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const memoize = require(
  normalizeWebpackPath('webpack/lib/util/memoize'),
) as typeof import('webpack/lib/util/memoize');

const getValidate = memoize(() => require('schema-utils').validate);

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
      getValidate()(
        getSchema(),
        /** @type {object | object[]} */
        value,
        options,
      );
      require('util').deprecate(
        /* istanbul ignore next - deprecation warning */
        function noop() {
          /* intentionally empty for deprecation */
        },
        'webpack bug: Pre-compiled schema reports error while real schema is happy. This has performance drawbacks.',
        'DEP_WEBPACK_PRE_COMPILED_SCHEMA_INVALID',
      )();
    }
  };
};

export { createSchemaValidation };
