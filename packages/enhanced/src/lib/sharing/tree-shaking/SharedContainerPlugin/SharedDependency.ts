import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
) as typeof import('webpack/lib/util/makeSerializable');
const { dependencies } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

import type {
  ObjectDeserializerContext,
  ObjectSerializerContext,
} from 'webpack/lib/dependencies/ModuleDependency';

class SharedDependency extends dependencies.ModuleDependency {
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
