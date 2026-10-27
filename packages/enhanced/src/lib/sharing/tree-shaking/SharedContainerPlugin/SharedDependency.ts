import type {
  ObjectDeserializerContext,
  ObjectSerializerContext,
} from 'webpack';
import { getWebpack, getWebpackModule } from '../../../webpack';

import makeSerializable from '../../../makeSerializable';
const ModuleDependency = getWebpackModule(
  getWebpack().dependencies?.ModuleDependency,
  'webpack/lib/dependencies/ModuleDependency',
  'webpack/lib/dependencies/core/ModuleDependency',
) as typeof import('webpack/lib/dependencies/ModuleDependency');

class SharedDependency extends ModuleDependency {
  sharedName: string;
  override request: string;

  /**
   * @param {string} sharedName public name
   * @param {string} request request to module
   */
  constructor(sharedName: string, request: string) {
    super(request);
    this.sharedName = sharedName;
    this.request = request;
  }

  override get type(): string {
    return 'shared exposed';
  }

  override get category(): string {
    return 'esm';
  }

  /**
   * @returns {string | null} an identifier to merge equal requests
   */
  override getResourceIdentifier(): string | null {
    return `shared dependency ${this.sharedName}=${this.request}`;
  }

  /**
   * @param {ObjectSerializerContext} context context
   */
  override serialize(context: ObjectSerializerContext): void {
    context.write(this.sharedName);
    super.serialize(context);
  }

  /**
   * @param {ObjectDeserializerContext} context context
   */
  override deserialize(context: ObjectDeserializerContext): void {
    this.sharedName = context.read();
    super.deserialize(context);
  }
}

makeSerializable(SharedDependency, 'SharedDependency');

export default SharedDependency;
