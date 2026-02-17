export = validateSchema;
/**
 * @param {Parameters<typeof validate>[0]} schema a json schema
 * @param {Parameters<typeof validate>[1]} options the options that should be validated
 * @param {Parameters<typeof validate>[2]=} validationConfiguration configuration for generating errors
 * @returns {void}
 */
declare function validateSchema(schema: Parameters<typeof validate>[0], options: Parameters<typeof validate>[1], validationConfiguration?: Parameters<typeof validate>[2] | undefined): void;
import { validate } from "schema-utils";
