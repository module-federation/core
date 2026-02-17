export = createSchemaValidation;
/**
 * @template {object | object[]} T
 * @param {((value: T) => boolean) | undefined} check check
 * @param {() => Schema} getSchema get schema fn
 * @param {ValidationErrorConfiguration} options options
 * @returns {(value?: T) => void} validate
 */
declare function createSchemaValidation<T extends unknown>(check: ((value: T) => boolean) | undefined, getSchema: () => Schema, options: ValidationErrorConfiguration): (value?: T) => void;
declare namespace createSchemaValidation {
    export { Schema, ValidationErrorConfiguration };
}
type Schema = import("schema-utils").Schema;
type ValidationErrorConfiguration = import("schema-utils").ValidationErrorConfiguration;
