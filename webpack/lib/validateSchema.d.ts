export = validateSchema;
/**
 * @param {Parameters<typeof validate>[0]} schema a json schema
 * @param {Parameters<typeof validate>[1]} options the options that should be validated
 * @param {Parameters<typeof validate>[2]=} validationConfiguration configuration for generating errors
 * @returns {void}
 */
declare function validateSchema(
  schema: [
    schema: import('schema-utils/declarations/validate').Schema,
    options: object | object[],
    configuration?: import('schema-utils/declarations/validate').ValidationErrorConfiguration,
  ][0],
  options: [
    schema: import('schema-utils/declarations/validate').Schema,
    options: object | object[],
    configuration?: import('schema-utils/declarations/validate').ValidationErrorConfiguration,
  ][1],
  validationConfiguration?:
    | [
        schema: import('schema-utils/declarations/validate').Schema,
        options: object | object[],
        configuration?: import('schema-utils/declarations/validate').ValidationErrorConfiguration,
      ][2]
    | undefined,
): void;
