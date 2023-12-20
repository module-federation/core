/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/
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

class ContainerExposedDependency extends dependencies.ModuleDependency {
  exposedName: string;
  override request: string;

  /**
   * @param {string} exposedName public name
   * @param {string} request request to module
   */
  constructor(exposedName: string, request: string) {
    super(request);
    this.exposedName = exposedName;
    this.request = request;
  }

  override get type(): string {
    return 'container exposed';
  }

  override get category(): string {
    return 'esm';
  }

  /**
   * @returns {string | null} an identifier to merge equal requests
   */
  override getResourceIdentifier(): string | null {
    return `exposed dependency ${this.exposedName}=${this.request}`;
  }

  /**
   * @param {ObjectSerializerContext} context context
   */
  override serialize(context: ObjectSerializerContext): void {
    context.write(this.exposedName);
    super.serialize(context);
  }

  /**
   * @param {ObjectDeserializerContext} context context
   */
  override deserialize(context: ObjectDeserializerContext): void {
    this.exposedName = context.read();
    super.deserialize(context);
  }
}

makeSerializable(
  ContainerExposedDependency,
  'enhanced/lib/container/ContainerExposedDependency',
);

export default ContainerExposedDependency;
