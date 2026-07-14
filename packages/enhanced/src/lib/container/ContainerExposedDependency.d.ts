declare const dependencies: typeof import('webpack').dependencies;
import type {
  ObjectDeserializerContext,
  ObjectSerializerContext,
} from 'webpack/lib/dependencies/ModuleDependency';
declare class ContainerExposedDependency extends dependencies.ModuleDependency {
  exposedName: string;
  request: string;
  /**
   * @param {string} exposedName public name
   * @param {string} request request to module
   */
  constructor(exposedName: string, request: string);
  get type(): string;
  get category(): string;
  /**
   * @returns {string | null} an identifier to merge equal requests
   */
  getResourceIdentifier(): string | null;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize(context: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   */
  deserialize(context: ObjectDeserializerContext): void;
}
export default ContainerExposedDependency;
